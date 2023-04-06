import Chai from 'chai';
import { timeout as timeoutPromise, sleep } from 'promise-assist';
import { chaiMethodsThatHandleFunction } from './constants';

import type { RetryAndAssertArguments } from './types';

const { expect } = Chai;

const performRetries = async (
    { functionToRetry, options, assertionStack }: RetryAndAssertArguments,
    setLastThrownError: (error: Error) => void,
    getLastThrownError: () => Error | undefined
) => {
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
            setLastThrownError(error as Error);
            await sleep(delay);
        }
    }

    const lastThrownError = getLastThrownError();
    throw new Error(
        `Limit of ${retries} retries exceeded! ${lastThrownError ? `Last thrown error: ${lastThrownError}` : ''}`
    );
};

export const retryFunctionAndAssertions = async (retryAndAssertArguments: RetryAndAssertArguments): Promise<void> => {
    let lastThrownError: Error | undefined;

    const setLastThrownError = (error: Error) => {
        lastThrownError = error;
    };

    const getLastThrownError = () => lastThrownError;

    try {
        await timeoutPromise(
            performRetries(retryAndAssertArguments, setLastThrownError, getLastThrownError),
            retryAndAssertArguments.options.timeout
        );
    } catch (error) {
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('timed out')) {
            throw new Error(`${errorMessage}. ${lastThrownError ? `Last thrown error: ${lastThrownError}` : ''}`);
        } else {
            throw error;
        }
    }
};
