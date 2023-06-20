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

export type AssertionMethod = (...args: unknown[]) => Chai.Assertion;

// Function provided as argument of `expect`
export type FunctionToRetry = (...args: unknown[]) => unknown | Promise<unknown>;

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
 */
export type RetryOptions = {
    /**
     *  The number of times to retry the function before failing.
     */

    retries?: number;
    /**
     * The maximum duration in milliseconds to wait before failing the retry operation.
     */
    delay?: number;

    /**
     * The delay in milliseconds between retries.
     */
    timeout?: number;
};

// Helper type to convert a type T into a Promise-like version of itself
type Promisify<T> = {
    [Key in keyof T]: T[Key] extends T
        ? Promisify<T[Key]> & PromiseLike<any>
        : T[Key] extends (...args: any) => any
        ? (...args: Parameters<T[Key]>) => Promisify<ReturnType<T[Key]>> & PromiseLike<any>
        : Promisify<T[Key]> & PromiseLike<any>;
};

export type PromiseLikeAssertion = Promisify<Chai.Assertion> & PromiseLike<void>;
