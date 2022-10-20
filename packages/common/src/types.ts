export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
export type Nullable<T> = T | null | undefined;
export const isMap = <K = any, V = any>(m: any): m is Map<K, V> => m instanceof Map;
export const isSet = <V = any>(m: any): m is Set<V> => m instanceof Set;
export function isDefined<T>(value: Nullable<T>): value is T {
    return value !== null && value !== undefined;
}
export const toMap = (a: object) => new Map(Object.entries(a));
