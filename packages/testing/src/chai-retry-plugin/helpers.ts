import Chai, { AssertionError } from 'chai';
import { timeout as addTimeoutToPromise, sleep } from 'promise-assist';

import type { AssertionPropertyKeys, RetryAndAssertProps } from './types';

const { expect } = Chai;

const performRetries = async ({ functionToRetry, options, assertionStack }: RetryAndAssertProps) => {
    const { retries, delay } = options;
    let retriesCount = 0;

    while (retriesCount < retries) {
        try {
            retriesCount++;
            const result = await functionToRetry();
            const assertion = expect(result);
            let isNegationApplied = false;

            for (const { isNegate, method, args = [], key } of assertionStack) {
                if (isNegate) {
                    isNegationApplied = true;
                    continue;
                }

                try {
                    if (key) {
                        assertion.to.be[key as keyof AssertionPropertyKeys];
                    }

                    method?.apply(assertion, args);
                } catch (error) {
                    if (error instanceof AssertionError && isNegationApplied) {
                        continue;
                    }

                    throw error;
                }

                if (isNegationApplied) {
                    throw new Error('Negated assertion should throw an error, but it finished successfully.');
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
