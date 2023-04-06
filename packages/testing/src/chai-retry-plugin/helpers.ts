import Chai from 'chai';
import { timeout as timeoutPromise, sleep } from 'promise-assist';
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
        } catch {
            await sleep(delay);
        }
    }

    throw new Error(`Limit of ${retries} retries exceeded!`);
};

export const retryFunctionAndAssertions = (retryAndAssertArguments: RetryAndAssertArguments): Promise<void> => {
    return timeoutPromise(performRetries(retryAndAssertArguments), retryAndAssertArguments.options.timeout);
};
