import { isString, noop } from '@wixc3/common';
import { deferred, timeout as _timeout } from 'promise-assist';
import { pollStep, Predicate } from './poll';
import { PromiseStep, promiseStep } from './promise';

type CaptureStackFn = (s: { stack: string }) => void;
type Stub = (...args: any[]) => void;
export class Steps {
    constructor(readonly mochaCtx: Mocha.Context) {}
    defaults = {
        step: {
            timeout: 1000,
            safetyMargin: 50
        },
        poll: {
            interval: 100,
            allowActionError: false,
            allowPredicateError: true
        }
    };
    static timeDilation = 1;
    private stepCount = 1;
    private getStack() {
        const captureStackTrace: CaptureStackFn =
            (Error as { captureStackTrace?: CaptureStackFn }).captureStackTrace || noop;
        const stackProvider = { stack: '' };
        captureStackTrace(stackProvider);
        const { stack } = stackProvider;
        return stack.split('\n').slice(7).join('\n');
    }
    private addTimeoutSafetyMargin() {
        this.mochaCtx.timeout(this.mochaCtx.timeout() + this.defaults.step.safetyMargin);
    }

    withTimeout = <T>(action: Promise<T>) => {
        this.addTimeoutSafetyMargin();
        const step = promiseStep(action, this.mochaCtx)
            .timeout(this.defaults.step.timeout)
            .description(`step ${this.stepCount++}`);
        step.stack = this.getStack();
        return step;
    };

    poll = <T>(action: () => T, predicate?: Predicate<T> | Awaited<T>) => {
        this.addTimeoutSafetyMargin();
        const {
            poll: { interval, allowActionError, allowPredicateError }
        } = this.defaults;

        const step = pollStep(action, predicate, this.mochaCtx)
            .timeout(this.defaults.step.timeout)
            .description(`step ${this.stepCount++}`)
            .interval(interval)
            .allowErrors(allowActionError, allowPredicateError);
        step.stack = this.getStack();

        return step;
    };

    waitForCall = <S extends object>(scope: S, method: keyof S | S[keyof S]): PromiseStep<any[]> => {
        const def = deferred<any[]>();
        let methodName = '';
        if (isString(method)) {
            methodName = method;
        } else {
            if (typeof method === 'function') {
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
            const p = this.withTimeout(def.promise);
            p.stack = this.getStack();

            p.then(restore).catch((e) => {
                restore();
                return Promise.reject(e);
            });
            return p;
        } else {
            throw new Error('Invalid method name' + methodName);
        }
    };
    waitForStubCall = <T>(action: (stub: Stub) => T, waitForAction = true) => {
        const d = deferred<any[]>();
        const returned = action((...args: any[]) => d.resolve(args));
        const step = this.withTimeout(
            waitForAction
                ? Promise.all([returned, d.promise]).then(([returned, callArgs]) => ({ returned, callArgs }))
                : d.promise.then((callArgs) => ({ returned, callArgs }))
        );
        step.stack = this.getStack();
        return step;
    };

    sleep = (ms?: number) => {
        this.addTimeoutSafetyMargin();
        const step = promiseStep(new Promise(noop), this.mochaCtx, false)
            .timeout(ms || this.defaults.step.timeout)
            .description(`step ${this.stepCount++}`);

        step.stack = this.getStack();
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
