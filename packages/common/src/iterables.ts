import { isDefined, Nullable } from './types';

export type Mapping<S, T> = (src: S) => T;
export type Predicate<S, V = boolean> = (src: S) => V;
export type Flat<T> = T extends Iterable<infer A> ? A : T;

/**
 * Picks the last element of an iterable
 * @returns undefined for null/empty iterable
 */
export function last<T>(iterable: Nullable<Iterable<T>>): T | undefined {
    let last!: T;
    if (iterable) {
        for (const value of iterable) {
            last = value;
        }
    }
    return last;
}

/**
 * Picks the first element of an iterable
 * @returns undefined for null/empty iterable
 */
export function first<T>(iterable: Nullable<Iterable<T>>): T | undefined {
    return at(iterable, 0);
}

/**
 * Checks if an iterable is empty
 */
export function isEmpty(iterable: Iterable<unknown>): boolean {
    for (const _ of iterable) {
        return false;
    }
    return true;
}

/**
 * Evaluate the size of an iterable
 * @returns elements count of iterable, 0 if null
 */
export function size(iterable: Nullable<Iterable<unknown>>): number {
    let size = 0;
    if (iterable) {
        for (const _ of iterable) {
            size++;
        }
    }
    return size;
}

/**
 * Finds element by index, including negative index
 * @see Array.at
 * @returns undefined if invalid index or null iterable
 */
export function at<T>(iterable: Nullable<Iterable<T>>, index: number): T | undefined {
    if (iterable) {
        if (index < 0) {
            return Array.from(iterable).at(index);
        }
        let i = 0;
        for (const v of iterable) {
            if (i++ === index) {
                return v;
            }
        }
    }
    return undefined;
}

/**
 * Find the element following an item
 * @returns undefined if item is last or not found
 */
export function next<T>(iterable: Nullable<Iterable<T>>, item: T): T | undefined {
    let wasFound = false;
    if (iterable) {
        for (const v of iterable) {
            if (wasFound) {
                return v;
            }
            if (v === item) {
                wasFound = true;
            }
        }
    }
    return undefined;
}

/**
 * Find the element before an item
 * @returns undefined if item is first or not found
 */
export function prev<T>(iterable: Nullable<Iterable<T>>, item: T): T | undefined {
    let prev!: T;
    if (iterable) {
        for (const v of iterable) {
            if (v === item) {
                return prev;
            }
            prev = v;
        }
    }
    return undefined;
}

/**
 * Creates iterable of unique elements
 * @param by - an element identifier (hash) function
 */
export function* unique<T>(iterable: Nullable<Iterable<T>>, by: Predicate<T, unknown> = (i) => i): Iterable<T> {
    const known = new Set<unknown>();
    if (iterable) {
        for (const v of iterable) {
            if (!known.has(by(v))) {
                known.add(by(v));
                yield v;
            }
        }
        known.clear();
    }
}

/**
 * Map iterable elements
 * @see Array.map
 */
export function* map<S, T>(iterable: Nullable<Iterable<S>>, mapFn: Mapping<S, T>): Iterable<T> {
    if (iterable) {
        for (const v of iterable) {
            yield mapFn(v);
        }
    }
}

/**
 * @see Array.flatMap
 * @returns a mapped, flattened iterables
 */
export function* flatMap<S, T>(iterable: Nullable<Iterable<S>>, mapFn: Mapping<S, T | Iterable<T>>): Iterable<Flat<T>> {
    yield* flat(map(iterable, mapFn));
}

/**
 * @see Array.filter
 */
export function* filter<T>(iterable: Nullable<Iterable<T>>, predicate: Predicate<T>): Iterable<T> {
    if (iterable) {
        for (const v of iterable) {
            if (predicate(v)) {
                yield v;
            }
        }
    }
}

/**
 * @see Array.concat
 * @returns a concatenated iterable
 */
export function* concat<T>(...iterables: Nullable<Iterable<T>>[]): Iterable<T> {
    for (const v of iterables) {
        if (v) {
            yield* v;
        }
    }
}

/**
 * @see Array.forEach
 */
export function forEach<T>(iterable: Nullable<Iterable<T>>, fn: Mapping<T, unknown>): void {
    if (iterable) {
        for (const v of iterable) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            fn(v);
        }
    }
}

/**
 * @see Array.find
 * @returns the first element the satisfies the predicate
 */
export function find<T>(iterable: Nullable<Iterable<T>>, predicate: Predicate<T>): T | undefined {
    if (iterable) {
        for (const v of iterable) {
            if (predicate(v)) {
                return v;
            }
        }
    }
    return undefined;
}

/**
 * @see Array.includes
 * @returns item is an element of iterable
 */
export function includes<T>(iterable: Nullable<Iterable<T>>, item: T): boolean {
    return !!find(iterable, (i) => i === item);
}

/**
 * @see Array.some
 * @returns there is an element satisfies the predicate
 */
export function some<T>(iterable: Nullable<Iterable<T>>, predicate: Predicate<T>): boolean {
    return !!find(iterable, predicate);
}

/**
 * @see Array.every
 * @returns true is all elements satisfy the predicate
 */
export function every<T>(iterable: Iterable<T>, predicate: Predicate<T>): boolean {
    for (const v of iterable) {
        if (!predicate(v)) {
            return false;
        }
    }
    return true;
}

/**
 * @see Array.flat
 * @param deep - if true, repeat the flattening until all elements are not iterable
 * @returns a flattened iterable,
 *      where elements that are iterable are spread into the result
 */
export function* flat<T>(iterable: Nullable<Iterable<T | Iterable<T>>>, deep = false): Iterable<Flat<T>> {
    if (iterable) {
        for (const v of iterable) {
            if (isIterable(v)) {
                // @ts-expect-error v is definitely iterable
                yield* deep ? flat(v) : v;
            } else {
                yield v as Flat<T>;
            }
        }
    }
}

/**
 * Calculate a histogram of iterable elements
 * @returns an histogram map (element=\>count)
 */
export function histogram<T>(iterable: Iterable<T>) {
    const histogram = new Map<T, number>();
    forEach(iterable, (i) => {
        const count = histogram.get(i) || 0;
        histogram.set(i, count + 1);
    });
    return histogram;
}

/**
 * @returns true if x is iterable
 */
export function isIterable(x: any): x is Iterable<unknown> {
    return isDefined(x) && typeof x === 'object' && Symbol.iterator in x;
}

/**
 * @see Array<T>.sort
 * @param by - comparator, returns a negative value if a should precede b
 */
export function sort<T>(iterable: Nullable<Iterable<T>>, by?: (a: T, b: T) => number): Iterable<T> {
    return iterable ? [...iterable].sort(by) : [];
}

/**
 * @see Array.reduce
 * @returns reduced object
 */
export function reduce<T, A>(iterable: Nullable<Iterable<T>>, reducer: (acc: A, item: T) => A, initial: A): A {
    let acc = initial;
    if (iterable) {
        for (const item of iterable) {
            acc = reducer(acc, item);
        }
    }
    return acc;
}

/**
 * @see Array.join
 */
export function join<T extends string>(iterable: Nullable<Iterable<T>>, separator: string): string {
    return reduce(iterable, (acc, item) => (acc === null ? item : acc + separator + item), null as string | null) || '';
}

/**
 * Skips the first elements of an iterable
 */
export function* skip<T>(iterable: Nullable<Iterable<T>>, count: number): Iterable<T> {
    if (iterable) {
        for (const item of iterable) {
            if (count === 0) {
                yield item;
            } else {
                count--;
            }
        }
    }
}

/**
 * Groups elements by the value of a property
 * @returns A map of the value to an array of elements
 */
export function groupBy<T, K extends keyof T>(elements: Iterable<T>, property: K): Map<T[K], T[]> {
    return reduce(
        elements,
        (acc, element) => {
            const propertyValue = acc.get(element[property]);

            if (propertyValue) {
                propertyValue.push(element);
            } else {
                acc.set(element[property], [element]);
            }

            return acc;
        },
        new Map<T[K], T[]>()
    );
}
