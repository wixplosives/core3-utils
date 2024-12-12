import { isMap, type Nullable } from './types.js';

/**
 * Similar to Map.has, but works for plain objects, and returns false
 * for null maps
 * @see Map.has
 */
export function has<O extends object>(obj: O, key: keyof O): boolean;
/**
 * Similar to Map.has, but works for plain objects, and returns false
 * for null maps
 * @see Map.has
 */
export function has<K>(obj: Map<K, unknown>, key: K): boolean;
export function has(obj: null | undefined, key: unknown): false;
export function has(obj: Nullable<object | Map<unknown, unknown>>, key: any): boolean {
    return (
        !!obj &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (typeof (obj as any).has === 'function' ? (obj as Map<any, any>).has(key) : key in (obj as object))
    );
}

export type MapValue<T> = T extends Map<infer _, infer V> ? V : never;
export type ObjValue<O extends object, K extends keyof O = keyof O> = O[K];
/**
 * Similar to Map.get, but works for plain objects, and returns undefined
 * for null maps and missing keys
 * @see Map.get
 * @returns found value, *undefined* if map/value to not exist
 */
export function get<O extends object, K extends keyof O>(obj: O, key: K): ObjValue<O, K>;
export function get<K, V, M extends Map<K, V>>(obj: Nullable<M>, key: K): MapValue<M>;
export function get(obj: Nullable<Map<unknown, unknown> | object>, key: any): any {
    if (obj) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        return typeof (obj as any).get === 'function'
            ? (obj as Map<any, any>).get(key)
            : // @ts-expect-error definitely not a map or nullish
              obj[key as string];
    }
    return;
}

/**
 * Returns a value by key, throws if the value is missing or the map null
 */
export function getValue<T extends object>(map: T, key: keyof T, errorMessage?: string): ObjValue<T>;
export function getValue<K, V, T extends Map<K, V>>(map: T, key: K, errorMessage?: string): MapValue<T>;
export function getValue<T extends null | undefined>(map: T, key: unknown, errorMessage?: string): never;
export function getValue<T extends Map<K, V> | object, K, V>(map: Nullable<T>, key: KeyOf<T>, errorMessage?: string) {
    // @ts-expect-error hmm
    if (has(map, key)) {
        // @ts-expect-error hmmm
        return get(map, key);
    }
    throw new Error(errorMessage || `Missing map`);
}

type KeyOf<T> = T extends Map<infer K, infer _> ? K : T extends object ? keyof T : never;
/**
 * @see Map.keys
 * @see Object.keys
 * @returns an iterable of the map/object keys
 */
export function keys<K, O extends Map<K, any>>(map: O): Iterable<K>;
export function keys<O extends object>(map: O): Iterable<keyof O>;
export function keys<K, O extends object | Map<K, any>>(obj: O) {
    return isMap(obj) ? obj.keys() : Object.keys(obj);
}
/**
 * @see Map.values
 * @see Object.values
 */
export function values<K, O extends Map<K, any>>(map: O): Iterable<MapValue<O>>;
export function values<O extends object>(map: O): Iterable<ObjValue<O>>;
export function values<K, O extends object | Map<K, any>>(obj: O) {
    return isMap(obj) ? obj.values() : Object.values(obj);
}
