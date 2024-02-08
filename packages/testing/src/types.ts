type PromisifiedType<T> = Promisify<T> & PromiseLike<any>;

// Helper type to convert a type T into a Promise-like version of itself
type Promisify<T> = {
    [Key in keyof T]: T[Key] extends (...args: any) => any
        ? keyof T[Key] extends never
            ? (...args: Parameters<T[Key]>) => PromisifiedType<ReturnType<T[Key]>>
            : PromisifiedType<T[Key]> & { (...args: Parameters<T[Key]>): PromisifiedType<ReturnType<T[Key]>> }
        : PromisifiedType<T[Key]>;
};

export type PromiseLikeAssertion<T extends Chai.Assertion = Chai.Assertion> = Promisify<T> & PromiseLike<void>;
