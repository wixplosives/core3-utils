import Chai from 'chai';
import { timeout as addTimeoutToPromise, sleep } from 'promise-assist';
import { chaiMethodsThatHandleFunction } from './constants';

import type { RetryAndAssertArguments } from './types';

const { expect } = Chai;

const performRetries = async ({ functionToRetry, options, assertionStack }: RetryAndAssertArguments) => {
    const { retries, delay } = options;
    let retriesCount = 0;

    while (retriesCount < retries) {
        try {
            retriesCount++;
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
        } catch (error) {
            await sleep(delay);
        }
    }

    throw new Error(`Limit of ${retries} retries exceeded!`);
};

export const retryFunctionAndAssertions = (retryAndAssertArguments: RetryAndAssertArguments): Promise<void> => {
    return addTimeoutToPromise(performRetries(retryAndAssertArguments), retryAndAssertArguments.options.timeout);
};
