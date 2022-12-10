import { isString } from '@wixc3/common';
import { deferred } from 'promise-assist';
import { disposeAfter } from '../dispose';
import { getIntervalPerformance, ideaTime } from '../measure-machine';
import { pollStep } from './poll';
import { promiseStep } from './promise';
import type { Predicate } from './types';
type CaptureStackFn = (s: { stack: string }) => void;
type Stub = (...args: any[]) => void;

let stepsCountByTest = new WeakMap<Mocha.Test, number>();
let stepsDefaults: ReturnType<typeof getDefaults>;
let currentTest: Mocha.Test;
const increaseStepsCount = () => {
    const count = stepsCountByTest.get(currentTest.ctx?.test as Mocha.Test) || 1;
    stepsCountByTest.set(currentTest.ctx?.test as Mocha.Test, count + 1);
    return count;
};

const ctx = () => {
    if (!currentTest?.ctx) {
        throw new Error(`Invalid use of the testing package: no mocha test context`);
    }
    return currentTest.ctx;
};

const getDefaults = () => ({
    step: {
        timeout: 1000,
        safetyMargin: 50,
        adjustToMachinePower: true,
    },
    poll: {
        interval: 100,
        allowActionError: false,
        allowPredicateError: true,
    },
});

let _timeDilation: number;
export function timeDilation(): number;
export function timeDilation(value: number): number;
export function timeDilation(value?: number) {
    if (value && value > 0) {
        _timeDilation = value;
    }
    return _timeDilation;
}

const getStack = () => {
    const captureStackTrace: CaptureStackFn =
        (Error as { captureStackTrace?: CaptureStackFn }).captureStackTrace || (() => void 0);
    const stackProvider = { stack: '' };
    captureStackTrace(stackProvider);
    const { stack } = stackProvider;
    return stack
        .split('\n')
        .filter(
            (i) => !i.match(/testing[\\/](dist|src)[\\/]steps[\\/]\w+\.(js|ts)/) && !i.match(/captureStackTrace\(.*/)
        )
        .join('\n');
};

const addTimeoutSafetyMargin = () => {
    ctx().timeout(ctx().timeout() + stepsDefaults.step.safetyMargin * timeDilation());
};

export function withTimeout<T>(action: Promise<T>) {
    addTimeoutSafetyMargin();
    const step = promiseStep(action, ctx(), true, timeDilation())
        .timeout(stepsDefaults.step.timeout, stepsDefaults.step.adjustToMachinePower)
        .description(`step ${increaseStepsCount()}`);
    step.stack = getStack();
    return step;
}

export function allWithTimeout<T extends Readonly<any[]>>(...actions: T) {
    return withTimeout(Promise.all(actions));
}

export function poll<T>(action: () => T, predicate?: Predicate<T> | Awaited<T>) {
    addTimeoutSafetyMargin();
    const {
        poll: { interval, allowActionError, allowPredicateError },
    } = stepsDefaults;

    const step = pollStep(action, predicate, ctx(), timeDilation())
        .timeout(stepsDefaults.step.timeout)
        .description(`step ${increaseStepsCount()}`)
        .interval(interval)
        .allowErrors(allowActionError, allowPredicateError);
    step.stack = getStack();
    return step;
}

export function waitForCall<S extends object>(scope: S, method: keyof S | S[keyof S]) {
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
        const p = withTimeout(def.promise);
        p.then(restore, restore);
        return p;
    } else {
        throw new Error('Invalid method name' + methodName);
    }
}

export function waitForStubCall<T>(action: (stub: Stub) => T, waitForAction = true) {
    const d = deferred<any[]>();
    const returned = action((...args: any[]) => d.resolve(args));
    const step = withTimeout(
        waitForAction
            ? Promise.all([returned, d.promise]).then(([returned, callArgs]) => ({ returned, callArgs }))
            : d.promise.then((callArgs) => ({ returned, callArgs }))
    );
    return step;
}

export function sleep(ms?: number) {
    addTimeoutSafetyMargin();
    return promiseStep(new Promise(() => void 0), ctx(), false, timeDilation()).timeout(
        ms || stepsDefaults.step.timeout,
        stepsDefaults.step.adjustToMachinePower
    );
}

export function defaults() {
    return stepsDefaults;
}

export function mochaCtx() {
    return currentTest.ctx!;
}

before('check time', async function () {
    this.timeout(ideaTime * 30);
    timeDilation(await getIntervalPerformance());
    // eslint-disable-next-line no-console
    console.log(`Time dilation due to machine power: ${timeDilation()}`);
});

beforeEach('save current test context', function () {
    currentTest = this.currentTest!;
    stepsDefaults = getDefaults();
    disposeAfter(() => {
        stepsCountByTest = new WeakMap();
    });
});
