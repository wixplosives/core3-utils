import Chai from 'chai';

import { retryFunctionAndAssertions } from './helpers';
import type {
    Assertion,
    AssertionMethod,
    FunctionToRetry,
    AssertionStackItem,
    RetryOptions,
    PromiseLikeAssertion,
} from './types';

/**
 * Plugin that allows to re-run function passed to `expect`, in order to achieve that use new `retry` method, retrying would be performed until
 * the result will pass the chained assertion or timeout exceeded or retries limit reached.
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
 * await expect(funcToRetry).retry().have.property('value').and.be.above(4);
 * ```
 * @example
 * ```ts
 * await expect(sometimesNullFunction).retry({ retries: 5, delay: 10, timeout: 2000 }).to.be.not.null;
 * ```
 * @example
 * ```ts
 * await expect(funcToRetry).retry().and.have.property('success').and.be.true;
 * ```
 */
export const chaiRetryPlugin = function (_: typeof Chai, { flag, inspect }: Chai.ChaiUtils) {
    Object.defineProperty(Chai.Assertion.prototype, 'retry', {
        value: function (retryOptions: RetryOptions = {}): PromiseLikeAssertion {
            const functionToRetry: FunctionToRetry = flag(this as Chai.AssertStatic, 'object') as FunctionToRetry;
            const description = flag(this as Chai.AssertStatic, 'message') as string;

            if (typeof functionToRetry !== 'function') {
                throw new TypeError(inspect(functionToRetry) + ' is not a function.');
            }

            const defaultRetryOptions: Required<RetryOptions> = { timeout: 8_000, retries: Infinity, delay: 0 };
            const options: Required<RetryOptions> = { ...defaultRetryOptions, ...retryOptions };

            const assertionStack: AssertionStackItem[] = [];
            // Fake assertion object for catching calls of chained methods
            const proxyTarget = new Chai.Assertion({});

            const assertionProxy: PromiseLikeAssertion = Object.assign(
                new Proxy(proxyTarget, {
                    get: proxyGetter,
                }),
                {
                    then: (resolve: () => void, reject: () => void) => {
                        return retryFunctionAndAssertions({
                            functionToRetry,
                            options,
                            assertionStack,
                            description,
                        }).then(resolve, reject);
                    },
                }
            ) as unknown as PromiseLikeAssertion;

            return assertionProxy;

            function proxyGetter(target: Assertion, key: string, proxySelf: Assertion): Assertion {
                let value: Chai.Assertion | undefined;

                try {
                    // if `value` is a getter property that may immediately perform the assertion and throw the AssertionError
                    value = target[key as keyof Chai.Assertion] as Assertion;
                } catch {
                    //
                }

                const assertionStackItem: AssertionStackItem = {
                    propertyName: key as keyof Chai.Assertion,
                };
                assertionStack.push(assertionStackItem);
                if (typeof value === 'function') {
                    return new Proxy(value, {
                        get: function (target, key: string) {
                            return proxyGetter(target as Assertion, key as keyof Chai.Assertion, proxySelf);
                        },
                        apply: function (_, __, args: unknown[]) {
                            if (key === 'then') {
                                return (value as unknown as AssertionMethod)(...args);
                            }

                            assertionStackItem.method = value as unknown as AssertionMethod;
                            assertionStackItem.args = args;

                            return proxySelf;
                        },
                    }) as Assertion;
                }

                return proxySelf;
            }
        },
        writable: false,
        configurable: false,
    });
};
