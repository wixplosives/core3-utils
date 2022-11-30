import { isString, noop } from '@wixc3/common';
import { deferred, timeout as _timeout } from 'promise-assist';
import { pollStep, Predicate } from './poll';
import { PromiseStep, promiseStep } from './promise';

type CaptureStackFn = (s: { stack: string }) => void;

class Steps {
    constructor(readonly mochaCtx: Mocha.Context) {}
    defaults = {
        step: {
            timeout: 1000,
            safetyMargin: 50
        },
        poll: {
            interval: 100,
            allowActionError: false,
            allowPredicateError: true,
        },
    };
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
        this.mochaCtx.timeout(this.mochaCtx.timeout() + this.defaults.step.safetyMargin)
    }

    promise = <T>(action: Promise<T>) => {
        this.addTimeoutSafetyMargin()
        const step = promiseStep(action, this.mochaCtx)
            .timeout(this.defaults.step.timeout)
            .description(`step ${this.stepCount++}`);
        step.stack = this.getStack();
        return step;
    };

    poll = <T>(action: () => T, predicate?: Predicate<T> | Awaited<T>) => {
        this.addTimeoutSafetyMargin()
        const {
            poll: { interval, allowActionError, allowPredicateError },
        } = this.defaults;

        const step = pollStep(action, predicate, this.mochaCtx)
            .timeout(this.defaults.step.timeout)
            .description(`step ${this.stepCount++}`)
            .interval(interval)
            .allowErrors(allowActionError, allowPredicateError);
        step.stack = this.getStack();

        return step;
    };

    firstCall = <S extends object>(scope: S, method: keyof S | S[keyof S]): PromiseStep<any[]> => {
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
    asyncStub = (fn: (stub: (...args: any[]) => void) => any) => {
        const d = deferred<any[]>();
        fn((...args: any[]) => d.resolve(args));
        const step = this.promise(d.promise);
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

interface TestFunctionWithSteps {
    (title: string, test: Stepped): Mocha.Test;
    only: (title: string, test: Stepped) => Mocha.Test;
    skip: (title: string, test: Stepped) => Mocha.Test;
}

withSteps.it = function (title: string, test: Stepped): Mocha.Test {
    return it(title, withSteps(test));
} as TestFunctionWithSteps;

withSteps.it.only = function (title: string, test: Stepped): Mocha.Test {
    // eslint-disable-next-line no-only-tests/no-only-tests
    return it.only(title, withSteps(test));
};

withSteps.it.skip = function (title: string, test: Stepped): Mocha.Test {
    // eslint-disable-next-line no-only-tests/no-only-tests
    return it.skip(title, withSteps(test));
};

withSteps.beforeEach = function (fn: Stepped): void {
    return beforeEach(withSteps(fn));
};

withSteps.before = function (fn: Stepped): void {
    return before(withSteps(fn));
};

withSteps.afterEach = function (fn: Stepped): void {
    return afterEach(withSteps(fn));
};

withSteps.after = function (fn: Stepped): void {
    return after(withSteps(fn));
};
