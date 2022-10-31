import { sleep } from 'promise-assist';
import { chain } from './chain';
import type { UnionToIntersection } from './types';

export function exclude<R>(...excluded: R[]) {
    return function <T>(t: T): t is Exclude<T, R> {
        for (const item of excluded) {
            if ((item as unknown) === t) {
                return false;
            }
        }
        return true;
    };
}
/**
 * returns an object composed of the picked object properties
 * @example
 * ```ts
 * pick({ a: 1, b: 2 }, ['a']) // => { a: 1 }
 * ```
 */
export function pick<O extends object, K extends keyof O>(record: O, keys: Iterable<K>): Pick<O, K> {
    const subset = {} as Pick<O, K>;
    for (const key of keys) {
        subset[key] = record[key];
    }
    return subset;
}

/**
 * Maps key value pairs of a plain object
 */
export function mapObject(obj: object, mapping: (entry: [string, any]) => [string, any]) {
    return Object.fromEntries(Object.entries(obj).map(mapping));
}

/**
 * Maps values of a plain object
 */
export function mapValues<T extends object, R>(obj: T, mapping: (value: T[keyof T], k?: keyof T) => R): { [_ in keyof T]: R } {
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]: [string, T[keyof T]]) =>
            [k, mapping(v, k as keyof T)])) as { [_ in keyof T]: R };
}

/**
 * Maps values of a plain object
 */
export function mapKeys<T extends object, R extends string>(obj: object, mapping: (key: keyof T, value?: T[keyof T]) => R): Record<R, T[keyof T]> {
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]: [string, T[keyof T]]) =>
            [mapping(k as keyof T, v), v])) as Record<R, T[keyof T]>;
}

/**
 * Checks that value is a POJO
 */
export function isPlainObject(value: unknown): value is Record<string | number | symbol, unknown> {
    return value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * Logs an error
 */
export function reportError(ex: unknown) {
    // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
    console.error(ex);
}

/**
 * Awaits a record of promises, and returns a record of their results.
 */
export async function awaitRecord<
    In extends Record<Key, Promise<any>>,
    Out extends {
        // this has a problem of unwrapping only one level of promise
        // https://github.com/microsoft/TypeScript/pull/37610 should solve the problem in future
        [K in keyof In]: In[K] extends Promise<infer U> ? U : never;
    },
    Key extends string
>(obj: In): Promise<Out> {
    const out = {} as Record<string, any>;
    for (const [key, promise] of Object.entries(obj)) {
        out[key] = await promise;
    }
    return out as Out;
}

export function getCartesianProductOfArrays<T>(arrays: T[][]): T[][] {
    if (arrays.length === 0) {
        return [];
    } else if (arrays.length === 1) {
        return arrays[0]!.map((elem) => [elem]);
    } else {
        const otherCombinations = getCartesianProductOfArrays(arrays.slice(1));
        const finalCombinations: T[][] = [];
        for (const elem of arrays[0]!) {
            for (const combo of otherCombinations) {
                finalCombinations.push([elem, ...combo]);
            }
        }
        return finalCombinations;
    }
}

export const newMacrotask = () => sleep(0);

/**
 * Reverses keys-values of an object, ignoring falsy values.
 * First takes on value collisions.
 * @returns a new object with the values as keys and the keys as values
 * @example
 * ```ts
 * reverseObject({ a: 'y', b: 'z'}) // => { y: 'a', z: 'b' }
 * ```
 */
export function reverseObject(obj: Record<string, string | false | undefined>) {
    const reversedObject: Record<string, string> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (value) {
            reversedObject[value] ||= key;
        }
    }

    return reversedObject;
}

/**
 * Returns an object where missing keys and values/keys
 * that satisfy shouldUseDefault
 * to the value in shouldUseDefault.
 *
 * @example
 * ```ts
 * defaults({}, {a:0}) // => {a:0}
 * defaults({a:1}, {a:0}) // => {a:1}
 * defaults({a:{}}, {a:{b:1}}) // => {a:{b:1}}
 * ```
 * by default, any undefined value will be replaced
 * @param deep - [true] perform a deep comparison
 * @example
 * ```ts
 * defaults({a:{}}, {a:{b:1}}, false) // => {a:{}}
 * ```
 * @param shouldUseDefault - value/key for which shouldUseDefault
 * returns true will be taken from defaultValues,
 * ignoring source.
 * k is provided as a dot separated path
 * @example
 * ```ts
 * defaults({a:{b:1}}, {a:{b:2}}, true, (_,k)=>k==='a.b') // => {a:{b:2}}
 * defaults({a:1}, {a:2}, true, v=>v===1) // => {a:2}
 * ```
 * @returns a new object with merged source and defaultValues
 */
export function defaults<S, D>(
    _source: S,
    _defaultValues: D,
    deep = true,
    shouldUseDefault = (v: unknown, _key: string) => v === undefined
): S & D {
    const parseObj = (src: unknown, dft: unknown, parentKey = ''): Record<string, unknown> => {
        if (isPlainObject(src)) {
            const result = {} as Record<string, any>;
            for (const [key, value] of Object.entries(src)) {
                const fullKey = (parentKey ? parentKey + '.' : '') + key;
                const _default = isPlainObject(dft)
                    ? dft[key]
                    : undefined;

                if (shouldUseDefault(value, fullKey)) {
                    result[key] = _default;
                } else {
                    result[key] = deep ? parseObj(value, _default, fullKey) : value;
                }
            }
            if (isPlainObject(dft)) {
                for (const [key, _default] of Object.entries(dft)) {
                    if (!(key in src)) {
                        result[key] = _default;
                    }
                }
            }
            return result;
        } else {
            // @ts-expect-error non object values should only affect type when misused
            return shouldUseDefault(src) ? dft : src;
        }
    };
    return parseObj(_source, _defaultValues) as S & D;
}

/**
 * @param obj - The object to query
 * @param path - The path of the property to get.
 * @returns The value at `path` of `object` id exists, `undefined` otherwise
 * @example
 * ```ts
 * getIn({ a: { b: 'c' } }, ['a', 'b']) // => c
 * ```
 */
export function getIn(obj: Record<string, any>, path: string[]): unknown {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return path.reduce((value, key) => value?.[key], obj);
}

const DELETE = Symbol();
export type Remap<T> = Partial<Record<keyof T, string | typeof DELETE>>;
export type Remapped<T extends object, R> = UnionToIntersection<
    R extends Partial<Record<keyof T, string | typeof DELETE>>
    ? {
        [K in keyof T]: K extends keyof R
        ? R[K] extends string
        ? { [L in R[K]]: T[K] }
        : never
        : { [L in K]: T[L] };
    }[keyof T]
    : never
>;

export type RemapFunc = {
    <T extends object, R extends Remap<T>>(obj: T, rename: R): Remapped<T, R>;
    readonly DELETE: typeof DELETE;
};
/**
 * remaps keys of obj based on rename map object,
 * @param rename - key:key name in obj, value: new name (string) OR remap.DELETE
 * @returns
 */
export const remap: RemapFunc = <T extends object, R extends Remap<T>>(obj: T, rename: R): Remapped<T, R> =>
    Object.fromEntries(
        chain(Object.entries(obj))
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .filter(([key]) => (rename as any)[key] !== remap.DELETE)
            .map(
                ([key, value]) =>
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    [(rename as any)[key] || key, value] as [string, any]
            ).iterable
    ) as Remapped<T, R>;
// @ts-expect-error setting the DELETE const
remap.DELETE = DELETE;
