import Chai from 'chai';
import { timeout as addTimeoutToPromise, sleep } from 'promise-assist';

import type { AssertionMethodStackItem, AssertionPropertyKeys, AssertionStackItem, RetryAndAssertProps } from './types';

const { expect } = Chai;

function isAssertionMethodStackItem(item: AssertionStackItem): item is AssertionMethodStackItem {
    return 'method' in item && 'args' in item;
}

const performRetries = async ({
    functionToRetry,
    options,
    assertionStack,
    isFunctionCallHandledByChai,
}: RetryAndAssertProps) => {
    const { retries, delay } = options;
    let retriesCount = 0;

    while (retriesCount < retries) {
        try {
            retriesCount++;
            const result = isFunctionCallHandledByChai ? functionToRetry : await functionToRetry();
            let assertion = expect(result);

            for (const item of assertionStack) {
                if (isAssertionMethodStackItem(item)) {
                    const { method, args } = item;
                    assertion = method.apply(assertion, args);
                } else {
                    const { property } = item;
                    assertion = assertion.to.be[property as keyof AssertionPropertyKeys];
                }
            }

            return;
        } catch (error) {
            await sleep(delay);
        }
    }

    throw new Error(`Limit of ${retries} retries exceeded!`);
};

export const retryFunctionAndAssertions = (retryAndAssertProps: RetryAndAssertProps): Promise<void> => {
    return addTimeoutToPromise(performRetries(retryAndAssertProps), retryAndAssertProps.options.timeout);
};
