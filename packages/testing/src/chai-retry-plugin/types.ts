import type { PromiseLikeAssertion } from '../types.js';

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
             * @default { timeout: 8000, delay: 0, retries: Infinity }
             *
             * **Times are affected by DEBUG and TIME_SCALE environment variables**
             */
            retry(options?: RetryOptions): PromiseLikeAssertion<Assertion>;
        }
    }
}

export interface Assertion extends Chai.Assertion {
    (...args: unknown[]): Chai.Assertion;
}

export type AssertionMethod = (...args: unknown[]) => Assertion | Promise<Assertion>;

// Function provided as argument of `expect`
export type FunctionToRetry = (...args: unknown[]) => unknown;

export type AssertionStackItem = {
    propertyName: keyof Chai.Assertion;
    method?: AssertionMethod;
    args?: unknown[];
};

export type RetryAndAssertArguments = {
    functionToRetry: FunctionToRetry;
    options: Required<RetryOptions>;
    assertionStack: AssertionStackItem[];
    description: string;
};

/**
 * The retry options for the `chaiRetryPlugin`.
 *
 * @typedef {Object} RetryOptions
 * @property {number} [timeout] - The maximum duration in milliseconds to wait before failing the retry operation.
 * @property {number} [retries] - The number of times to retry the function before failing.
 * @property {number} [delay] - The delay in milliseconds between retries.
 */
export type RetryOptions = {
    retries?: number;
    delay?: number;
    timeout?: number;
};
