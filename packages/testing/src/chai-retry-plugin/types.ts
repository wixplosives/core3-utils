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

export interface Assertion extends Chai.Assertion {
    (...args: unknown[]): Chai.Assertion;
}
export type AssertionMethod = (...args: unknown[]) => Chai.Assertion;

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

// Helper type to convert a type T into a Promise-like version of itself
type Promisify<T> = {
    [Key in keyof T]: T[Key] extends (...args: any) => any
        ? keyof T[Key] extends never
            ? (...args: Parameters<T[Key]>) => Promisify<ReturnType<T[Key]>> & PromiseLike<any>
            : Promisify<T[Key]> &
                  PromiseLike<any> & { (...args: Parameters<T[Key]>): Promisify<ReturnType<T[Key]>> & PromiseLike<any> }
        : Promisify<T[Key]> & PromiseLike<any>;
};

export type PromiseLikeAssertion = Promisify<Assertion> & PromiseLike<void>;
