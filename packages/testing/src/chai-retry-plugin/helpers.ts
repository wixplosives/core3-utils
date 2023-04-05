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
            /**
             * This is needed to handle cases when function that user passes to `expect`
             * should be called through the native chai's implementation rather then  within `chaiRetryPlugin`, for example:
             *
             * const myObj = { val: 1 },
             *       addTwo = () => {
             *              myObj.val += 2;
             *          };
             * await expect(addTwo).retry().to.increase(myObj, 'val').by(2);
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
        } catch (error) {
            await sleep(delay);
        }
    }

    throw new Error(`Limit of ${retries} retries exceeded!`);
};

export const retryFunctionAndAssertions = (retryAndAssertArguments: RetryAndAssertArguments): Promise<void> => {
    return addTimeoutToPromise(performRetries(retryAndAssertArguments), retryAndAssertArguments.options.timeout);
};
