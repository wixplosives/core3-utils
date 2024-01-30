// Helper type to convert a type T into a Promise-like version of itself
export type Promisify<T> = {
    [Key in keyof T]: T[Key] extends T
        ? Promisify<T[Key]> & PromiseLike<any>
        : T[Key] extends (...args: any) => any
          ? (...args: Parameters<T[Key]>) => Promisify<ReturnType<T[Key]>> & PromiseLike<any>
          : Promisify<T[Key]> & PromiseLike<any>;
};

export type PromiseLikeAssertion = Promisify<Chai.Assertion> & PromiseLike<void>;
