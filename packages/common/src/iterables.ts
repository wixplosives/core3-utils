import { isNotNull } from "./objects"

export type Mapping<S, T> = (src: S) => T
export type Predicate<S, V = boolean> = (src: S) => V
export type Flat<T> = T extends Iterable<infer A> ? A : T

/**
 * @param iterable 
 * @returns the last element of iterable
 */
export function last<T>(iterable: Iterable<T>): T | undefined {
    let last!: T
    for (const value of iterable) {
        last = value
    }
    return last;
}

/**
 * @param iterable 
 * @returns the first element of iterable
 */
export const first = <T>(iterable: Iterable<T>): T | undefined =>
    at(iterable, 0)

/**
 * @param iterable 
 * @returns the first element of iterable
 */
export function isEmpty(iterable: Iterable<unknown>): boolean {
    for (const _ of iterable) {
        return false
    }
    return true
}

/**
 * @param iterable 
 * @returns the elements count of iterable
 */
export function size(iterable: Iterable<unknown>): number {
    let size = 0
    for (const _ of iterable) {
        size++;
    }
    return size
}

/**
 * @see Array.at
 * @param iterable 
 * @param index 
 * @returns the element at the given index
 */
export function at<T>(iterable: Iterable<T>, index: number): T | undefined {
    if (index < 0) {
        return Array.from(iterable).at(index)
    }
    let i = 0;
    for (const v of iterable) {
        if (i++ === index) {
            return v
        }
    }
    return undefined
}

/**
 * @param iterable 
 * @param item 
 * @returns the element after item, undefined if last or not found
 */
export function next<T>(iterable: Iterable<T>, item: T): T | undefined {
    let wasFound = false
    for (const v of iterable) {
        if (wasFound) {
            return v
        }
        if (v === item) {
            wasFound = true
        }
    }
    return undefined
}

/**
 * @param iterable 
 * @param item 
 * @returns the elements before item, undefined if first or not found
 */
export function prev<T>(iterable: Iterable<T>, item: T): T | undefined {
    let prev!: T
    for (const v of iterable) {
        if (v === item) {
            return prev
        }
        prev = v
    }
    return undefined
}

/**
 * @param iterable 
 * @param by an element identifier function
 * @returns an iterable with unique elements
 */
export function* unique<T>(iterable: Iterable<T>, by: Predicate<T, unknown> = i => i): Iterable<T> {
    const known = new Set<unknown>()
    for (const v of iterable) {
        if (!known.has(by(v))) {
            known.add(by(v))
            yield v;
        }
    }
    known.clear()
}

/**
 * @see Array.map
 * @param iterable 
 * @param mapFn 
 * @returns a mapped iterable
 */
export function* map<S, T>(iterable: Iterable<S>, mapFn: Mapping<S, T>): Iterable<T> {
    for (const v of iterable) {
        yield mapFn(v)
    }
}

/**
 * @see Array.flatMap
 * @param iterable 
 * @param mapFn 
 * @returns a mapped, flattened iterables
 */
export function* flatMap<S, T>(iterable: Iterable<S>, mapFn: Mapping<S, T | Iterable<T>>): Iterable<Flat<T>> {
    yield* flat(map(iterable, mapFn))
}

/**
 * @see Array.filter
 * @param iterable 
 * @param predicate 
 * @returns a filtered iterable
 */
export function* filter<T>(iterable: Iterable<T>, predicate: Predicate<T>): Iterable<T> {
    for (const v of iterable) {
        if (predicate(v)) {
            yield v
        }
    }
}

/**
 * @see Array.concat
 * @param iterables 
 * @returns a concatenated iterable
 */
export function* concat<T>(...iterables: Iterable<T>[]): Iterable<T> {
    for (const v of iterables) {
        yield* v;
    }
}

/**
 * @see Array.forEach
 * @param iterable 
 * @param fn 
 */
export function forEach<T>(iterable: Iterable<T>, fn: Mapping<T, unknown>): void {
    for (const v of iterable) {
        fn(v)
    }
}

/**
 * @see Array.find
 * @param iterable 
 * @param predicate 
 * @returns the first element the satisfies the predicate
 */
export function find<T>(iterable: Iterable<T>, predicate: Predicate<T>): T | undefined {
    for (const v of iterable) {
        if (predicate(v)) {
            return v
        }
    }
    return undefined
}

/**
 * @see Array.includes
 * @param iterable 
 * @param item 
 * @returns item is an element of iterable
 */
export function includes<T>(iterable: Iterable<T>, item: T): boolean {
    return !!find(iterable, i => i === item)
}

/**
 * @see Array.some
 * @param iterable 
 * @param predicate 
 * @returns there is an element satisfies the predicate
 */
export function some<T>(iterable: Iterable<T>, predicate: Predicate<T>): boolean {
    return !!find(iterable, predicate)
}

/**
 * @see Array.every
 * @param iterable 
 * @param predicate 
 * @returns true is all elements satisfy the predicate
 */
export function every<T>(iterable: Iterable<T>, predicate: Predicate<T>): boolean {
    for (const v of iterable) {
        if (!predicate(v)) {
            return false
        }
    }
    return true
}

/**
 * @see Array.flat
 * @param deep if true, repeat the flattening until all elements are not iterable
 * @param iterable 
 * @returns a flattened iterable, 
 *      where elements that are iterable are spread into the result
 */
export function* flat<T>(iterable: Iterable<T | Iterable<T>>, deep = false): Iterable<Flat<T>> {
    for (const v of iterable) {
        if (isIterable(v)) {
            // @ts-expect-error v is definitely iterable
            yield* (deep ? flat(v) : v)
        } else {
            yield v as Flat<T>;
        }
    }
}

/**
 * 
 * @param iterable 
 * @returns an histogram map (element=>count)
 */
export function histogram<T>(iterable:Iterable<T>) {
    const histogram = new Map<T,number>()
    forEach(iterable, i => {
        const count = histogram.get(i) || 0
        histogram.set(i, count +1)
    })
    return histogram;
}

/**
 * 
 * @param x 
 * @returns true if x is iterable
 */
export function isIterable(x:any): x is Iterable<unknown> {
    return isNotNull(x) && typeof x === 'object' && (Symbol.iterator in x)
}

/**
 * 
 * @param iterable 
 * @param by comparator
 */
export function sort<T>(iterable:Iterable<T>, by?:(a:T,b:T)=>number) {
    [...iterable].sort(by)
}
