import { isString, noop } from '@wixc3/common';
import { deferred, timeout as _timeout } from 'promise-assist';

type PromiseStep<T> = Promise<T> & {
    timeout: (ms: number) => PromiseStep<T>;
    description: (description: string) => PromiseStep<T>;
    stack: string;
};

export function promiseStep<T, S extends PromiseStep<T>>(src: Promise<T>, ctx: Mocha.Context): S {
    let timerId: number;
    let timeoutMessage: string;
    let timeout = 0;
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;

    const p = new Promise<T>((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
        src.then(
            (resolvedValue) => {
                clearTimeout(timerId);
                resolve(resolvedValue);
            },
            (rejectReason) => {
                clearTimeout(timerId);
                reject(rejectReason);
            }
        );
    }) as S;

    p.timeout = (ms: number) => {
        const diff = ms - timeout;
        timeout = ms;
        ctx.timeout(ctx.timeout() + diff);
        clearTimeout(timerId);
        timerId = setTimeout(() => reject(new Error(`${timeoutMessage} after ${ms}ms\n${p.stack}`)), ms);
        return p;
    };

    p.description = (description: string) => {
        timeoutMessage = `Timed out in step "${description}"`;
        return p;
    };

    return p;
}

type PollStep<T> = Promise<T> & {
    timeout: (ms: number) => PollStep<T>;
    description: (description: string) => PollStep<T>;
    interval: (ms: number) => PollStep<T>;
    allowErrors: (action?: boolean, predicate?: boolean) => PollStep<T>;
    stack: string;
};

type Predicate<T> = (a: Awaited<T>) => boolean | Chai.Assertion | void;

export function pollStep<T>(action: () => T, predicate: Predicate<T>, ctx: Mocha.Context): PollStep<T> {
    let intervalId!: number;
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;
    let allowErrors = {
        predicate: false,
        action: false,
    };
    const intervalPromise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });

    const handleError = (e: any, type: 'action' | 'predicate') => {
        if (allowErrors[type]) {
            void p.description(e instanceof Error ? e.message : `${e}`);
        } else {
            clearInterval(intervalId);
            reject(e);
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const p = promiseStep(intervalPromise, ctx) as PollStep<T>;
    p.interval = (ms: number) => {
        clearInterval(intervalId);
        intervalId = setInterval(async () => {
            let value: Awaited<T>;
            try {
                value = await Promise.resolve(action());
                try {
                    if (predicate(value!) !== false) {
                        clearInterval(intervalId);
                        resolve(value!);
                    }
                } catch (e) {
                    handleError(e, 'predicate');
                }
            } catch (e) {
                handleError(e, 'action');
            }
        }, ms);
        return p;
    };
    p.allowErrors = (action = true, predicate = true) => {
        allowErrors = { action, predicate };
        return p;
    };
    p.catch(() => {
        clearInterval(intervalId);
    });

    return p.interval(100);
}

type CaptureStackFn = (s: { stack: string }) => void;

class Steps {
    constructor(readonly mochaCtx: Mocha.Context) {}
    defaults = {
        stepTimeout: 1000,
        poll: {
            interval: 100,
            allowActionError: false,
            allowPredicateError: true,
        },
    };
    private stepCount = 1;
    private captureStackTrace: CaptureStackFn =
        (Error as { captureStackTrace?: CaptureStackFn }).captureStackTrace || noop;
    private stackProvider = { stack: '' };

    promise = <T>(action: Promise<T>) => {
        this.captureStackTrace(this.stackProvider);
        const { stack } = this.stackProvider;

        const step = promiseStep(action, this.mochaCtx)
            .timeout(this.defaults.stepTimeout)
            .description(`step ${this.stepCount++}`);
        step.stack = stack;
        return step;
    };
    
    poll = <R, T extends () => R>(action: T, predicate: Predicate<R>) => {
        this.captureStackTrace(this.stackProvider);
        const { stack } = this.stackProvider;

        const {
            poll: { interval, allowActionError, allowPredicateError },
        } = this.defaults;
        const step = pollStep(action, predicate, this.mochaCtx)
            .timeout(this.defaults.stepTimeout)
            .description(`step ${this.stepCount++}`)
            .interval(interval)
            .allowErrors(allowActionError, allowPredicateError);

        step.stack = stack;
        return step;
    };

    firstCall = <S extends object>(scope: S, method: keyof S | S[keyof S]): PromiseStep<any[]> => {
        this.captureStackTrace(this.stackProvider);
        const { stack } = this.stackProvider;

        const def = deferred<any[]>();
        let methodName = '';
        if (isString(method)) {
            methodName = method;
        } else {
            if (method instanceof Function) {
                methodName = method.name;
            }
        }
        if (methodName in scope) {
            const m = methodName as keyof S;
            const original = scope[m];
            const restore = () => (scope[m] = original);

            // eslint-disable-next-line
            // @ts-ignore
            scope[m] = (...args: Parameters<T>) => {
                def.resolve(args);
                // eslint-disable-next-line
                return (original as Function).bind(scope)(...args);
            };
            const p = this.promise(def.promise);
            p.stack = stack;

            p.then(restore).catch((e) => {
                restore();
                return Promise.reject(e);
            });
            return p;
        } else {
            throw new Error('Invalid method name' + methodName);
        }
    };
    asyncStub = (fn: (stub: (...args: any[]) => void) => any) => {
        this.captureStackTrace(this.stackProvider);
        const { stack } = this.stackProvider;

        const d = deferred<any[]>();
        fn((...args: any[]) => d.resolve(args));
        const step = this.promise(d.promise);
        step.stack = stack;
        return step;
    };
}

type Stepped = (this: Mocha.Context, steps: Steps) => Promise<any>;
export function withSteps(test: Stepped): Mocha.Func {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return function () {
        return test.bind(this)(new Steps(this));
    };
}

withSteps.it = function (title: string, test: Stepped): Mocha.Test {
    return it(title, withSteps(test));
};
