import Chai from 'chai';
import { assertionPropertyKeys } from './constants';
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
             * - `timeout`: The maximum duration in milliseconds to wait before failing the retry operation. Default: 5000.
             * - `retries`: The number of times to retry the function before failing. Default: Infinity.
             * - `delay`: The delay in milliseconds between retries. Default: 0.
             */
            retry(options?: RetryOptions): PromiseLikeAssertion;
        }
    }
}

/**
 * Adds the `retry` method to Chai assertions, which allows to check the return value of a function until it satisfies the chained assertions.
 * Should be applied through `Chai.use` function, for example:
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

        // Fake assertion object for catching calls of chained methods
        const proxyTarget = new Assertion({});

        const assertionProxy: PromiseLikeAssertion = Object.assign(
            new Proxy(proxyTarget, {
                get: function (target: Chai.Assertion, key: string) {
                    if (assertionPropertyKeys.includes(key)) {
                        assertionStack.push({ key });

                        return assertionProxy;
                    }

                    if (key === 'not') {
                        assertionStack.push({ isNegate: true });

                        return assertionProxy;
                    }

                    // Handle native Chai's assertion methods and 'then' call
                    const value = target[key as keyof Chai.Assertion];

                    if (typeof value === 'function') {
                        return (...args: unknown[]) => {
                            if (key === 'then') {
                                return (value as unknown as AssertionMethod)(...args);
                            }

                            assertionStack.push({ method: value as unknown as AssertionMethod, args });

                            return assertionProxy;
                        };
                    }

                    return assertionProxy;
                },
            }),
            {
                then: (resolve: () => void, reject: () => void) => {
                    return retryFunctionAndAssertions({
                        functionToRetry,
                        options,
                        assertionStack,
                    }).then(resolve, reject);
                },
            }
        ) as unknown as PromiseLikeAssertion;

        return assertionProxy;
    });
};

export default chaiRetryPlugin;
