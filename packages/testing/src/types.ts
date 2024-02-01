// Helper type to convert a type T into a Promise-like version of itself
type Promisify<T> = {
    [Key in keyof T]: T[Key] extends (...args: any) => any
        ? keyof T[Key] extends never
            ? (...args: Parameters<T[Key]>) => Promisify<ReturnType<T[Key]>> & PromiseLike<any>
            : Promisify<T[Key]> &
                  PromiseLike<any> & { (...args: Parameters<T[Key]>): Promisify<ReturnType<T[Key]>> & PromiseLike<any> }
        : Promisify<T[Key]> & PromiseLike<any>;
};

export type PromiseLikeAssertion<T extends Chai.Assertion = Chai.Assertion> = Promisify<T> & PromiseLike<void>;
