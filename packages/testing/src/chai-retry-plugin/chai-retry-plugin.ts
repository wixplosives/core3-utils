import Chai from 'chai';
import { chaiMethodsThatHandleFunction } from './constants';
import { retryFunctionAndAssertions } from './helpers';

import type { AssertionMethod, FunctionToRetry, AssertionStackItem, RetryOptions, PromiseLikeAssertion } from './types';

const { Assertion } = Chai;

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Chai {
        interface Assertion {
            /**
             * Allows to retry the function passed to `expect` and assert the result until retries ended or timeout exceeded
             * @param options Settings for retry logic:
             * - `timeout`: The maximum duration in milliseconds to wait before failing the retry operation.
             * - `retries`: The number of times to retry the function before failing.
             * - `delay`: The delay in milliseconds between retries.
             * @default { timeout: 5000, delay: 0, retries: Infinity }
             */
            retry(options?: RetryOptions): PromiseLikeAssertion;
        }
    }
}

/**
 * Adds the `retry` method to Chai assertions, which allows to check the return value of a function until it satisfies the chained assertions.
 * Should be applied through `Chai.use` function, for example:
 * @example
 * ```ts
 * import Chai from 'chai';
 * import { chaiRetryPlugin } from '@wixc3/testing';
 *
 * Chai.use(chaiRetryPlugin);
 * ```
 *
 * Examples of usage:
 * @example
 * ```ts
 * await expect(funcToRetry).retry({ timeout: 7000, retries: 5 }).have.property('value').and.be.above(4);
 * ```
 * @example
 * ```ts
 * await expect(sometimesNullFunction).retry({ timeout: 2000 }).to.be.not.null;
 * ```
 * @example
 * ```ts
 * await expect(funcToRetry).retry({ retries: 5, delay: 10 }).and.have.property('success').and.be.true;
 * ```
 */
export const chaiRetryPlugin = function (_: typeof Chai, utils: Chai.ChaiUtils) {
    Assertion.addMethod('retry', function (retryOptions: RetryOptions = {}): PromiseLikeAssertion {
        const functionToRetry: FunctionToRetry = this._obj as FunctionToRetry;

        if (typeof functionToRetry !== 'function') {
            throw new TypeError(utils.inspect(functionToRetry) + ' is not a function.');
        }

        const assertionStack: AssertionStackItem[] = [];
        const defaultRetryOptions: Required<RetryOptions> = { timeout: 5000, retries: Infinity, delay: 0 };
        const options: Required<RetryOptions> = { ...defaultRetryOptions, ...retryOptions };
        // to handle assertions that accept a function
        let isFunctionCallHandledByChai = false;

        // Fake assertion object for catching calls of chained methods
        const proxyTarget = new Assertion({});

        const assertionProxy: PromiseLikeAssertion = Object.assign(
            new Proxy(proxyTarget, {
                get: function (target: Chai.Assertion, key: string, proxySelf: Chai.Assertion) {
                    let value: Chai.Assertion | undefined = undefined;
                    try {
                        value = target[key as keyof Chai.Assertion] as Chai.Assertion;
                        // eslint-disable-next-line
                    } catch (error) {
                        // to prevent AssertionError off getter properties
                    }

                    if (typeof value === 'function') {
                        return (...args: unknown[]) => {
                            if (key === 'then') {
                                return (value as unknown as AssertionMethod)(...args);
                            }

                            if (chaiMethodsThatHandleFunction.includes(key as keyof Chai.Assertion)) {
                                isFunctionCallHandledByChai = true;
                            }

                            assertionStack.push({
                                method: value as unknown as AssertionMethod,
                                args,
                            });

                            return proxySelf;
                        };
                    } else {
                        assertionStack.push({ propertyName: key });
                    }

                    return proxySelf;
                },
            }),
            {
                then: (resolve: () => void, reject: () => void) => {
                    return retryFunctionAndAssertions({
                        functionToRetry,
                        options,
                        assertionStack,
                        isFunctionCallHandledByChai,
                    }).then(resolve, reject);
                },
            }
        ) as unknown as PromiseLikeAssertion;

        return assertionProxy;
    });
};

export default chaiRetryPlugin;
