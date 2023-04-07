import Chai from 'chai';
import { timeout as timeoutPromise, sleep } from 'promise-assist';
import { chaiMethodsThatHandleFunction } from './constants';

import type { RetryAndAssertArguments, RetryOptions } from './types';

const { expect } = Chai;

export const retryFunctionAndAssertions = async (retryAndAssertArguments: RetryAndAssertArguments): Promise<void> => {
    let assertionError: Error | undefined;

    const performRetries = async ({ functionToRetry, options, assertionStack }: RetryAndAssertArguments) => {
        const { retries, delay } = options;
        let retriesCount = 0;

        while (retriesCount < retries) {
            try {
                retriesCount++;
                /**
                 * If assertion chain includes such method as `change`, `decrease` or `increase` that means function passed to
                 * the `expect` will be called by Chai itself
                 */
                const shouldAssertFunctionValue = assertionStack.some((stackItem) =>
                    chaiMethodsThatHandleFunction.includes(stackItem.propertyName)
                );
                const valueToAssert = shouldAssertFunctionValue ? functionToRetry : await functionToRetry();
                let assertion = expect(valueToAssert);

                for (const { propertyName, method, args } of assertionStack) {
                    if (method && args) {
                        assertion = method.apply(assertion, args);
                    } else {
                        assertion = assertion[propertyName] as Chai.Assertion;
                    }
                }

                return;
            } catch (error: unknown) {
                assertionError = error as Error;
                await sleep(delay);
            }
        }

        throw new Error(`Limit of ${retries} retries exceeded! AssertionError: ${assertionError}`);
    };

    const getTimeoutError = () =>
        `Timed out after ${retryAndAssertArguments.options.timeout}ms. ${
            assertionError ? `AssertionError: ${assertionError}` : ''
        }`;

    return timeoutPromise(
        performRetries(retryAndAssertArguments),
        retryAndAssertArguments.options.timeout,
        getTimeoutError
    );
};

export const validateOptions = (options: Required<RetryOptions>) => {
    if (options.retries < 1) {
        throw new Error('`retries` option should be greater than 0.');
    }

    if (options.delay < 0) {
        throw new Error('`delay` option should be a positive number.');
    }

    if (options.timeout <= 0) {
        throw new Error('`timeout` option should be greater than 0.');
    }
};
