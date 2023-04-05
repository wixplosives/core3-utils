// Type of `this` in `addMethod` function
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
};

/**
 * The retry options for the `chaiRetryPlugin`.
 *
 * @typedef {Object} RetryOptions
 * @property {number} [retries] - The number of times to retry the function before failing.
 * @property {number} [delay] - The delay in milliseconds between retries.
 * @property {number} [timeout] - The maximum duration in milliseconds to wait before failing the retry operation.
 */
export type RetryOptions = {
    retries?: number;
    delay?: number;
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
