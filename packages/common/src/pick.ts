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
