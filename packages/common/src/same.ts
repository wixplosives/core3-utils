import { histogram, isIterable, size } from './iterables';
import { isPlainObject } from './objects';
import { isMap, isSet } from './types';

/**
 * Deep comparison of two items

 * @example 
 * ```ts
 * same({a:1, b:2},{b:2, a:1}) // => true
 * same(new Map([['a',1],['b',2]]), new Map([['b',2],['a',1]])) // => true
 * same(new Map([[{a:1},{b:1}]]]), new Map([[{a:1},{b:1}]]])) // => true
 * same([0,1], [1,0]) // => false
 * same([0,1], [1,0], true) // => true
 * ```
 * @remarks
 * items are "the same" if:
 * 
 * - a === b (for anything other than iterables & POJO)

 * - a and b are POJO with same entries (order ignored, {@link same} used to compare values)
 * 
 * - a and b are Maps with same entries (order ignored,  {@link same} used to compare keys & values)
 * 
 * - a and b are Sets with same values (order ignored,  {@link same} used to compare values)
 * 
 * - a and b are iterable (that are not Set or Map) with the same values, order checked if unordered=false (default)
 * 
 * @param unordered - [false] Note: relevant only in array like iterables. objects, sets and maps are *never checked for order* of entries
 */
export function same<T>(a: T, b: T, unordered = false): boolean {
    if (a === b) return true;
    if (!isIterable(a) || !isIterable(b)) {
        if (isPlainObject(a) && isPlainObject(b)) {
            return sameIgnoreOrder(Object.entries(a), Object.entries(b), unordered);
        }
        return a === b;
    }
    return unordered || (isMap(a) && isMap(b)) || (isSet(a) && isSet(b))
        ? sameIgnoreOrder(a, b, unordered)
        : sameInOrder(a, b, unordered);
}

function sameInOrder<T>(a: T, b: T, unordered: boolean) {
    if (!isIterable(a) || !isIterable(b)) {
        if (isPlainObject(a) && isPlainObject(b)) {
            return sameIgnoreOrder(Object.entries(a), Object.entries(b), unordered);
        }
        return a === b;
    }
    const itA = a[Symbol.iterator]();
    const itB = b[Symbol.iterator]();

    for (let [aa, bb] = [itA.next(), itB.next()]; ; [aa, bb] = [itA.next(), itB.next()]) {
        if (!same(aa.value, bb.value, unordered)) {
            return false;
        }
        if (aa.done !== bb.done) {
            return false;
        }
        if (aa.done) {
            return true;
        }
    }
}

function sameIgnoreOrder<T>(a: Iterable<T>, b: Iterable<T>, unordered: boolean) {
    const [aa, bb] = [histogram(a), histogram(b)];
    if (size(aa) !== size(bb)) {
        return false;
    }
    for (const [key, count] of aa) {
        let wasFound = false;
        for (const [bkey, bcount] of bb) {
            if (same(key, bkey, unordered)) {
                wasFound = true;
                if (bcount !== count) {
                    return false;
                } else {
                    break;
                }
            }
        }
        if (!wasFound) {
            return false;
        }
    }
    return true;
}
