import { isString } from '@wixc3/common';
import { deferred } from 'promise-assist';
import { getIntervalPerformance, ideaTime } from '../measure-machine';
import { pollStep, Predicate } from './poll';
import { PromiseStep, promiseStep } from './promise';
import mocha from 'mocha';

type CaptureStackFn = (s: { stack: string }) => void;
type Stub = (...args: any[]) => void;

export class Steps {
    static timeDilation: number;
    private static runningTestsCtx = new WeakMap<Mocha.Context, Steps>();
    static getTestSteps(ctx: Mocha.Context) {
        if (!Steps.runningTestsCtx.has(ctx)) {
            Steps.runningTestsCtx.set(ctx, new Steps(ctx));
        }
        return Steps.runningTestsCtx.get(ctx)!;
    }
    constructor(readonly mochaCtx: Mocha.Context) {
        Steps.runningTestsCtx.set(mochaCtx, this);
    }
    defaults = {
        step: {
            timeout: 1000,
            safetyMargin: 50,
            adjustToMachinePower: true
        },
        poll: {
            interval: 100,
            allowActionError: false,
            allowPredicateError: true
        }
    };
    private stepCount = 1;
    private getStack() {
        const captureStackTrace: CaptureStackFn =
            (Error as { captureStackTrace?: CaptureStackFn }).captureStackTrace || (() => void 0);
        const stackProvider = { stack: '' };
        captureStackTrace(stackProvider);
        const { stack } = stackProvider;
        return stack
            .split('\n')
            .filter(
                (i) =>
                    !i.match(/testing[\\/](dist|src)[\\/]steps[\\/]\w+\.(js|ts)/) &&
                    !i.match(/Steps\.\w+/) &&
                    !i.match(/captureStackTrace\(.*/)
            )
            .join('\n');
    }
    private addTimeoutSafetyMargin() {
        this.mochaCtx.timeout(this.mochaCtx.timeout() + this.defaults.step.safetyMargin * Steps.timeDilation);
    }

    withTimeout = <T>(action: Promise<T>) => {
        this.addTimeoutSafetyMargin();
        const step = promiseStep(action, this.mochaCtx, true, Steps.timeDilation)
            .timeout(this.defaults.step.timeout, this.defaults.step.adjustToMachinePower)
            .description(`step ${this.stepCount++}`);
        step.stack = this.getStack();
        return step;
    };

    allWithTimeout = <T extends Readonly<any[]>>(...actions: T) => this.withTimeout(Promise.all(actions));

    poll = <T>(action: () => T, predicate?: Predicate<T> | Awaited<T>) => {
        this.addTimeoutSafetyMargin();
        const {
            poll: { interval, allowActionError, allowPredicateError }
        } = this.defaults;

        const step = pollStep(action, predicate, this.mochaCtx, Steps.timeDilation)
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
            p.then(restore, restore);
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
        const step = promiseStep(new Promise(() => void 0), this.mochaCtx, false, Steps.timeDilation)
            .timeout(ms || this.defaults.step.timeout, this.defaults.step.adjustToMachinePower)
            .description(`step ${this.stepCount++}`);
        step.stack = this.getStack();
        return step;
    };
}

before('check time', async function () {
    this.timeout(ideaTime * 30);
    Steps.timeDilation = await getIntervalPerformance();
    // eslint-disable-next-line no-console
    console.log(`Time dilation due to machine power: ${Steps.timeDilation}`);
});

type Stepped = (this: Mocha.Context, steps: Steps) => Promise<any>;
export function withSteps(test: Stepped): Mocha.Func {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return function () {
        return test.bind(this)(new Steps(this));
    };
}
