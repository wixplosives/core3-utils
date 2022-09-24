import { sleep } from 'promise-assist';

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
 * @example pick({ a: 1, b: 2 }, ['a']) // => { a: 1 }
 */
 export function pick<O extends object, K extends keyof O>(record: O, keys: Iterable<K>): Pick<O, K> {
    const subset = {} as Pick<O, K>;
    for (const key of keys) {
        subset[key] = record[key];
    }
    return subset;
}

export const keys = <K,O extends object|Map<K,undefined>>(obj: O) => 
    isPlainObject(obj) 
    ? Object.keys(obj) as Iterable<keyof O>
    : (obj as Map<K,undefined>).keys()

export const values = <V,O extends Record<any, V>|Map<any, V>>(obj: O) => 
    isPlainObject(obj) 
    ? Object.values(obj) as Iterable<V>
    : (obj as Map<undefined,V>).values()

export function isPlainObject(value: unknown): value is object {
    return value !== null 
        && typeof value === 'object' 
        && Object.getPrototypeOf(value) === Object.prototype
}

export function isNotNull<T>(value: T | undefined | null) : value is T {
    return value !== null && value !== undefined;
}

// eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
export const reportError = (ex: unknown) => console.error(ex);

export function groupBy<T, K extends keyof T>(elements: T[], property: K): Map<T[K], T[]> {
    return elements.reduce<Map<T[K], T[]>>((acc, element) => {
        const propertyValue = acc.get(element[property]);

        if (propertyValue) {
            propertyValue.push(element);
        } else {
            acc.set(element[property], [element]);
        }

        return acc;
    }, new Map());
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
    for (const [key, promise] of Object.entries(obj) ) {
        out[key] = await promise
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
        for (const elem of arrays[0]!   ) {
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
 *
 * @returns a new object with the values as keys and the keys as values
 * @example { a: 'y', b: 'z'} => { y: 'a', z: 'b' }
 */
export const calculateReversedObject = (obj: Record<string, string | false | undefined>) => {
    const reversedObject: Record<string, string> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (value) {
            reversedObject[value] ||= key;
        }
    }

    return reversedObject;
};
