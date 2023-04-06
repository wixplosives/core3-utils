import Chai from 'chai';
import { timeout as timeoutPromise, sleep } from 'promise-assist';
import { chaiMethodsThatHandleFunction } from './constants';

import type { RetryAndAssertArguments } from './types';

const { expect } = Chai;

export const retryFunctionAndAssertions = async (retryAndAssertArguments: RetryAndAssertArguments): Promise<void> => {
    let lastThrownError: Error | undefined;

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
                lastThrownError = error as Error;
                await sleep(delay);
            }
        }

        throw new Error(
            `Limit of ${retries} retries exceeded! ${lastThrownError ? `Last thrown error: ${lastThrownError}` : ''}`
        );
    };

    try {
        await timeoutPromise(performRetries(retryAndAssertArguments), retryAndAssertArguments.options.timeout);
    } catch (error) {
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('timed out')) {
            throw new Error(`${errorMessage}. ${lastThrownError ? `Last thrown error: ${lastThrownError}` : ''}`);
        } else {
            throw error;
        }
    }
};
