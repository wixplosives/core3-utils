import Chai from 'chai';
import { chaiMethodsThatHandleFunction } from './constants';
import type { AssertionMethod, RetryAndAssertArguments } from './types';
import { adjustTestTime } from '../mocha-ctx';
import { deferred, timeout } from 'promise-assist';
import { isDebugMode } from '../debug-tests';

export const retryFunctionAndAssertions = async (retryParams: RetryAndAssertArguments): Promise<void> => {
    const { options, assertionStack } = retryParams;
    let assertionError: Error | undefined;
    let didTimeout = false;
    let cancel = () => {
        /* */
    };

    const performRetries = async () => {
        let time = Date.now();
        let delay: Promise<void>;

        for (let retriesCount = 0; (retriesCount < options.retries && !didTimeout) || isDebugMode(); retriesCount++) {
            try {
                /**
                 * If assertion chain includes such method as `change`, `decrease` or `increase` that means function passed to
                 * the `expect` will be called by Chai itself
                 */
                let assertion = await initialAssertion(retryParams);

                for (const { propertyName, method, args } of assertionStack) {
                    assertion = updateAssertion(method, args, assertion, propertyName);
                }

                return;
            } catch (error: any) {
                if (!didTimeout) {
                    assertionError = error as Error;
                    time = adjustTest(time, options.delay);
                    ({ cancel, delay } = sleep(options.delay));
                    await delay;
                }
            }
        }

        throw new Error(`Limit of ${options.retries} retries exceeded! ${assertionError}`);
    };

    const getTimeoutError = () => `Timed out after ${options.timeout}ms. ${assertionError ?? ''}`;

    if (isDebugMode()) {
        return performRetries();
    } else {
        return timeout(performRetries(), options.timeout, getTimeoutError).catch((err) => {
            cancel();
            didTimeout = true;
            throw err;
        });
    }
};

const initialAssertion = async ({ assertionStack, description, functionToRetry: fn }: RetryAndAssertArguments) => {
    const shouldAssertFunctionValue = assertionStack.some((stackItem) =>
        chaiMethodsThatHandleFunction.includes(stackItem.propertyName),
    );
    const valueToAssert = shouldAssertFunctionValue ? fn : await fn();
    return Chai.expect(valueToAssert, description);
};

const updateAssertion = (
    method: AssertionMethod | undefined,
    args: unknown[] | undefined,
    assertion: Chai.Assertion,
    propertyName: keyof Chai.Assertion,
) => (method && args ? method.apply(assertion, args) : (assertion[propertyName] as Chai.Assertion));

const adjustTest = (time: number, delay: number): number => {
    const now = Date.now();
    const diff = now - time;

    adjustTestTime(diff + delay);
    return now + delay;
};

const sleep = (ms: number) => {
    const { promise, resolve, reject } = deferred();
    const timeoutId = setTimeout(resolve, ms);
    return {
        cancel: () => {
            clearTimeout(timeoutId);
            reject();
        },
        delay: promise,
    };
};
