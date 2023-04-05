import Chai from 'chai';
import { timeout as addTimeoutToPromise, sleep } from 'promise-assist';

import type { AssertionMethodStackItem, AssertionStackItem, RetryAndAssertArguments } from './types';

const { expect } = Chai;

function isAssertionMethodStackItem(item: AssertionStackItem): item is AssertionMethodStackItem {
    return 'method' in item && 'args' in item;
}

const performRetries = async ({
    functionToRetry,
    options,
    assertionStack,
    isFunctionCallHandledByChai,
}: RetryAndAssertArguments) => {
    const { retries, delay } = options;
    let retriesCount = 0;

    while (retriesCount < retries) {
        try {
            retriesCount++;
            const result = isFunctionCallHandledByChai ? functionToRetry : await functionToRetry();
            let assertion = expect(result);

            for (const assertionStackItem of assertionStack) {
                if (isAssertionMethodStackItem(assertionStackItem)) {
                    const { method, args } = assertionStackItem;
                    assertion = method.apply(assertion, args);
                } else {
                    const { propertyName } = assertionStackItem;
                    assertion = assertion[propertyName as keyof Chai.Assertion] as Chai.Assertion;
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
