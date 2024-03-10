import Chai from 'chai';
import { chaiMethodsThatHandleFunction } from './constants';
import type { AssertionMethod, RetryAndAssertArguments } from './types';
import { adjustTestTime } from '../mocha-ctx';
import { deferred, timeout } from 'promise-assist';
import { isDebugMode } from '../debug-tests';

/**
 * filters out error stack rows containing calls of `chai-retry-plugin` and `promise-assist` methods
 */
const filterAssertionStack = (stack: string | undefined) =>
    stack
        ?.split('\n')
        .filter(
            (row) =>
                ![
                    'initialAssertion',
                    'updateAssertion',
                    'performRetries',
                    'process.processTimers',
                    'runNextTicks',
                ].some((hiddenMethods) => row.trim().startsWith(`at ${hiddenMethods}`)),
        )
        .join('\n');

export const retryFunctionAndAssertions = async (retryParams: RetryAndAssertArguments): Promise<void> => {
    const { options, assertionStack } = retryParams;
    let assertionError: Error | undefined;
    let didTimeout = false;
    let cancel = () => {
        /* */
    };

    const performRetries = async () => {
        let delay: Promise<void>;

        for (let retriesCount = 0; (retriesCount < options.retries && !didTimeout) || isDebugMode(); retriesCount++) {
            const time = Date.now();
            try {
                /**
                 * If assertion chain includes such method as `change`, `decrease` or `increase` that means function passed to
                 * the `expect` will be called by Chai itself
                 */
                let assertion = await initialAssertion(retryParams);

                for (const { propertyName, method, args } of assertionStack) {
                    assertion = await updateAssertion(method, args, assertion, propertyName);
                }

                return;
            } catch (error: any) {
                if (!didTimeout) {
                    assertionError = error as Error;
                    adjustTest(time, options.delay);
                    ({ cancel, delay } = sleep(options.delay));
                    await delay;
                }
            }
        }

        throw new Error(`Limit of ${options.retries} retries exceeded! ${assertionError}`);
    };

    const getTimeoutError = () => `Timed out after ${options.timeout}ms.`;

    if (isDebugMode() || options.timeout === 0) {
        return performRetries();
    } else {
        return timeout(performRetries(), options.timeout, getTimeoutError).catch((err) => {
            cancel();
            didTimeout = true;
            if (err instanceof Error) {
                const assertionStack = filterAssertionStack(assertionError?.stack) ?? '';
                // removing first two rows of current stack trace, first is empty message and second is internal anonymous call
                const currentStack = new Error().stack?.split('\n').slice(2).join('\n');
                const retryStack = filterAssertionStack(currentStack) ?? '';

                err.stack = assertionStack + '\n' + retryStack;
            }
            throw err;
        });
    }
};

const initialAssertion = async ({ assertionStack, description, functionToRetry: fn }: RetryAndAssertArguments) => {
    const shouldAssertFunctionValue = assertionStack.some((stackItem) =>
        chaiMethodsThatHandleFunction.includes(stackItem.propertyName),
    );
    const valueToAssert = shouldAssertFunctionValue ? fn : await fn();
    return Chai.expect(valueToAssert, description);
};

const updateAssertion = async (
    method: AssertionMethod | undefined,
    args: unknown[] | undefined,
    assertion: Chai.Assertion,
    propertyName: keyof Chai.Assertion,
) => (method && args ? await method.apply(assertion, args) : (assertion[propertyName] as Chai.Assertion));

const adjustTest = (time: number, delay: number): number => {
    const now = Date.now();
    const diff = now - time;

    adjustTestTime(diff + delay);
    return now + delay;
};

const sleep = (ms: number) => {
    const { promise, resolve, reject } = deferred();
    const timeoutId = setTimeout(resolve, ms);
    return {
        cancel: () => {
            clearTimeout(timeoutId);
            reject();
        },
        delay: promise,
    };
};
