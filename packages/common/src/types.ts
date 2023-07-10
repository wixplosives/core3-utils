/**
 * The resolved value of T (if a promise, otherwise simply T)
 */
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

/**
 * T or null/undefined
 */
export type Nullable<T> = T | null | undefined;

/**
 * union of all fields of T
 * @example
 * ValueOf<Record<string, number>> === number
 */
export type ValueOf<T> = T[keyof T];

/**
 * Validates s is an instance of Map
 * @returns true if s is a Map
 */
export const isMap = <K = any, V = any>(m: any): m is Map<K, V> => m instanceof Map;

/**
 * Validates s is an instance of Set
 * @returns true if s is a Set
 */
export const isSet = <V = any>(s: any): s is Set<V> => s instanceof Set;

/**
 * Given a value of type Nullable<T>, validates value is T
 * @returns true if value is defined (not null or undefined)
 */
export function isDefined<T>(value: Nullable<T>): value is T {
    return value !== null && value !== undefined;
}

/**
 * Coverts and object into a Map
 * @param obj - POJO
 * @returns A map with the same entries as obj
 */
export const toMap = (obj: object) => new Map(Object.entries(obj));

/**
 * Make an intersection type from union
 * @example
 * ```ts
 * const a:UnionToIntersection<{a:string}|{b:string}> = {a:'ok', b:'also ok'}
 * ```
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
