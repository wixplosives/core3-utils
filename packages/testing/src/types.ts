// Helper type to convert a type T into a Promise-like version of itself
type Promisify<T> = {
    [Key in keyof T]: T[Key] extends (...args: any) => any
        ? keyof T[Key] extends never
            ? (...args: Parameters<T[Key]>) => Promisify<ReturnType<T[Key]>> & PromiseLike<any>
            : Promisify<T[Key]> &
                  PromiseLike<any> & { (...args: Parameters<T[Key]>): Promisify<ReturnType<T[Key]>> & PromiseLike<any> }
        : Promisify<T[Key]> & PromiseLike<any>;
};

export interface Assertion extends Chai.Assertion {
    (...args: unknown[]): Chai.Assertion;
}

export type PromiseLikeAssertion = Promisify<Assertion> & PromiseLike<void>;
