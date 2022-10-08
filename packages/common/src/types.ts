export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
export const isMap = <K = any, V = any>(m: any): m is Map<K, V> => m instanceof Map
export const isSet = <V = any>(m: any): m is Set<V> => m instanceof Set
export function isPlainObject(value: unknown): value is object {
    return value !== null
        && typeof value === 'object'
        && Object.getPrototypeOf(value) === Object.prototype
}

export function isDefined<T>(value: T | undefined | null): value is T {
    return value !== null && value !== undefined;
}

export const toMap = (a:object) => new Map(Object.entries(a))

export type Nullable<T> = T|null|undefined