import { isString } from '@wixc3/common';
import { deferred } from 'promise-assist';
import { disposeAfter } from '../dispose';
import { getIntervalPerformance, ideaTime } from '../measure-machine';
import { createPollStep } from './poll';
import { createTimeoutStep } from './promise';
import type { PollStep, Predicate, _PromiseAll, PromiseWithTimeout, StepsDefaults } from './types';
type CaptureStackFn = (s: { stack: string }) => void;
/**
 * A generated stub
 */
export type Stub = (...args: any[]) => void;

let stepsCountByTest = new WeakMap<Mocha.Test, number>();

let stepsDefaults: StepsDefaults;
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

const getDefaults = (): StepsDefaults => ({
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

/**
 * Get current test step time dilation
 *
 * - All timeout set in tests will be multiplied by timeDilation()
 */
export function timeDilation(): number;
/**
 * Set current test step time dilation
 *
 * - All timeout set in tests will be multiplied by timeDilation()
 */
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

/**
 * Limits the time a promise can take
 *
 * - Note: useable only within a mocha test/hook.
 * The total test timeout will be adjusted to make sure the test
 * will not time out waiting for this step
 *
 * @example
 * ```ts
 * await withTimeout(sleep(1000)).description('will time out').timeout(10)
 * ```
 * @param action a promise that should be settled before the timeout
 */
export function withTimeout<T>(action: Promise<T>): PromiseWithTimeout<T> {
    addTimeoutSafetyMargin();
    const step = createTimeoutStep(action, ctx(), true, timeDilation())
        .timeout(stepsDefaults.step.timeout, stepsDefaults.step.adjustToMachinePower)
        .description(`step ${increaseStepsCount()}`);
    step.stack = getStack();
    return step;
}

/**
 * Limits the time a list of promises can take
 *
 * - Note: useable only within a mocha test/hook.
 * The total test timeout will be adjusted to make sure the test
 * will not time out waiting for this step
 * @example
 * ```ts
 * await allWithTimeout(sleep(1000), sleep(99)).description('will time out').timeout(10)
 * ```
 * @param action promises that should be settled before the timeout
 */
export function allWithTimeout<T extends Readonly<any[]>>(...actions: T): PromiseWithTimeout<_PromiseAll<T>> {
    return withTimeout(Promise.all(actions));
}

/**
 * Checks the return value of am action until it satisfies the predicate
 *
 * Error handling can be changed using allowErrors. the default behavior is:
 *
 * - When the action throws the step fails
 *
 * - When the predicate throws the polling continues
 *
 *  {@link @wixc3/testing#Expected} as helpful predicator creators.
 *
 * @example
 * ```ts
 * await poll(()=>getValue(), {a:0}).description('value matches {a:0}').timeout(100).interval(10)
 * ```
 * @example
 * ```ts
 * await poll(()=>getValue(), v => expect(v).to.be.approximately(10, 1)).description('value is 10+-1')
 * ```
 * @example
 * ```ts
 * await poll(()=>mightThrow(), {a:0}).description('value matches {a:0}').allowErrors()
 * ```
 * @param predicate predicated value (compared with expect.eql)
 * *or* a predicate function that will be considered satisfied when returning **values other than false**
 */
export function poll<T>(action: () => T, predicate: Predicate<T> | Awaited<T>): PollStep<T> {
    addTimeoutSafetyMargin();
    const {
        poll: { interval, allowActionError, allowPredicateError },
    } = stepsDefaults;

    const step = createPollStep(action, predicate, ctx(), timeDilation())
        .timeout(stepsDefaults.step.timeout)
        .description(`step ${increaseStepsCount()}`)
        .interval(interval)
        .allowErrors(allowActionError, allowPredicateError);
    step.stack = getStack();
    return step;
}

/**
 * Spies on an object method, waiting until it's called.
 * The spy is removed once called
 *
 * @example
 * ```ts
 * const call = waitForSpyCall(target, 'method');
 * target.method(1, 'success');
 * expect(await call).to.eql([1, 'success']);
 * ```
 */
export function waitForSpyCall<S extends object>(scope: S, method: keyof S | S[keyof S]): PromiseWithTimeout<any[]> {
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

/**
 * Creates a stub, then waits for it to be called
 * @example
 * ```ts
 *  expect(await waitForStubCall(async (stub) => {
 *      await sleep(1);
 *      stub('success');
 *      return 'action!';
 *  })).to.eql({
 *      callArgs: ['success'],
 *      returned: 'action!',
 *  });
 * ```
 * @param waitForAction when false the action is not awaited, waits only for the stub to be called
 */
export function waitForStubCall<T>(
    action: (stub: Stub) => T,
    waitForAction = true
): PromiseWithTimeout<{
    returned: T;
    callArgs: any[];
}> {
    const d = deferred<any[]>();
    const returned = action((...args: any[]) => d.resolve(args));
    const step = withTimeout(
        waitForAction
            ? Promise.all([returned, d.promise]).then(([returned, callArgs]) => ({ returned, callArgs }))
            : d.promise.then((callArgs) => ({ returned, callArgs }))
    );
    return step;
}

/**
 * Resolves after ms milliseconds
 */
export function sleep(ms?: number): PromiseWithTimeout<void> {
    addTimeoutSafetyMargin();
    return createTimeoutStep(new Promise<void>(() => void 0), ctx(), false, timeDilation()).timeout(
        ms || stepsDefaults.step.timeout,
        stepsDefaults.step.adjustToMachinePower
    );
}

/**
 * default values for steps of the current test
 */
export function defaults(): StepsDefaults {
    return stepsDefaults;
}

/**
 * active mocha context
 */
export function mochaCtx(): Mocha.Context {
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
