import { histogram, isIterable, size } from "./iterables"
import { isPlainObject } from "./objects"
import { isMap, isSet } from "./types"

/**
 * deep comparison of two items
 * @param a 
 * @param b 
 * @param unordered Note: relevant only in array like. objects, sets and maps are always not unordered 
 * @returns 
 */
export function same<T>(a: T, b: T, unordered = false): boolean {
    if (!isIterable(a) || !isIterable(b)) {
        if (isPlainObject(a) && isPlainObject(b)) {
            return same(Object.entries(a), Object.entries(b), false)
        }
        return a === b
    }
    return unordered ||
        (isMap(a) && isMap(b)) ||
        (isSet(a) && isSet(b))
        ? sameIgnoreOrder(a, b) : sameInOrder(a, b)
}

function sameInOrder<T>(a: Iterable<T>, b: Iterable<T>) {
    const itA = a[Symbol.iterator]()
    const itB = b[Symbol.iterator]()

    for (let [aa, bb] = [itA.next(), itB.next()]; ; [aa, bb] = [itA.next(), itB.next()]) {
        if (!same(aa.value, bb.value)) {
            return false
        }
        if (aa.done !== bb.done) {
            return false
        }
        if (aa.done) {
            return true
        }
    }
}

function sameIgnoreOrder<T>(a: Iterable<T>, b: Iterable<T>) {
    const [aa, bb] = [histogram(a), histogram(b)]
    if (size(aa) !== size(bb)) {
        return false
    }
    for (const [key, count] of aa) {
        let wasFound = false
        for (const [bkey, bcount] of bb) {
            if (same(key,bkey)) {
                wasFound = true
                if (bcount !== count) {
                    return false
                } else {
                    break
                }
            }
        }
        if (!wasFound) {
            return false
        }
    }
    return true
}

