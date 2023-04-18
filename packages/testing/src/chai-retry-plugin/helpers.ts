import Chai from 'chai';
import { timeout as timeoutPromise, sleep as sleepPromise } from 'promise-assist';
import { adjustTestTime, mochaCtx } from '../mocha-ctx';

import { chaiMethodsThatHandleFunction } from './constants';
import type { RetryAndAssertArguments } from './types';

export const addTimeoutSafetyMargin = (ms: number) => mochaCtx() && adjustTestTime(ms);

function sleep(ms: number): Promise<void> {
    addTimeoutSafetyMargin(ms);
    return sleepPromise(ms);
}

function timeout(promise: Promise<void>, ms: number, getTimeoutError: () => string): Promise<void> {
    addTimeoutSafetyMargin(ms);
    return timeoutPromise(promise, ms, getTimeoutError);
}

export const retryFunctionAndAssertions = async (retryAndAssertArguments: RetryAndAssertArguments): Promise<void> => {
    let assertionError: Error | undefined;
    let isTimeoutExceeded = false;

    const performRetries = async ({
        functionToRetry,
        options,
        assertionStack,
        description,
    }: RetryAndAssertArguments) => {
        const { retries, delay } = options;
        let retriesCount = 0;

        while (retriesCount < retries && !isTimeoutExceeded) {
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
                let assertion = Chai.expect(valueToAssert, description);

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

        throw new Error(`Limit of ${retries} retries exceeded! ${assertionError}`);
    };

    const getTimeoutError = () =>
        `Timed out after ${retryAndAssertArguments.options.timeout}ms. ${assertionError ?? ''}`;

    setTimeout(() => {
        isTimeoutExceeded = true;
    }, retryAndAssertArguments.options.timeout);

    return timeout(performRetries(retryAndAssertArguments), retryAndAssertArguments.options.timeout, getTimeoutError);
};
