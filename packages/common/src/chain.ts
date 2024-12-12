import {
    at,
    concat,
    every,
    filter,
    find,
    first,
    type Flat,
    flat,
    flatMap,
    forEach,
    includes,
    isEmpty,
    join,
    last,
    map,
    type Mapping,
    next,
    type Predicate,
    prev,
    reduce,
    size,
    skip,
    some,
    sort,
    unique,
} from './iterables.js';
import { mapValues } from './objects.js';

/**
 * {@label Iter}
 * Chain iterable operations, each acting on the output of the previous step
 * @example When the action is per item, the result is accessible as *iterable*
 * ```
 * chain([0,1,2])
 *      .filter(i => i)
 *      .map(i => i**2)
 *      .iterable
 * // => [1,4]
 * ```
 * @example When the action returns an element (as in first, next, reduce etc) the  the result is accessible as *value*
 * ```
 * chain([0,1,2]).filter(i => i).first().value
 * // => 1
 * ```
 * @example Iterable is always accessible, as a single element iterable
 * ```
 * chain([0,1,2]).filter(i => i).first().iterable
 * // => [1]
 * ```
 * @example <b>Note</b> if the action returned undefined, iterable will be empty
 * ```
 * chain([]).first().iterable // => []
 * chain([]).first().value // => undefined
 * ```
 * @param value - initial iterable
 * @returns Chainable action on iterable
 */
export function chain<T>(value: Iterable<T>): IterableChain<T>;

/**
 * {@label Iter}
 * Chain iterable operations, each acting on the output of the previous step
 * @example When the action is per item, the result is accessible as *iterable*
 * ```
 * chain([0,1,2])
 *      .filter(i => i)
 *      .map(i => i**2)
 *      .iterable
 * // => [1,4]
 * ```
 * @example When the action returns an element (as in first, next, reduce etc) the  the result is accessible as *value*
 * ```
 * chain("hello").map(i => i.split("")).first().value
 * // => "h"
 * ```
 * @example Iterable is always accessible, as a single element iterable
 * ```
 * chain([0,1,2]).filter(i => i).first().iterable
 * // => [1]
 * ```
 * @example <b>Note</b> if the action returned undefined, iterable will be empty
 * ```
 * chain([]).first().iterable // => []
 * chain([]).first().value // => undefined
 * ```
 * @param value - initial value
 * @returns Chainable action on iterable
 */
export function chain<T, V extends NotIterable<T>>(value: V): ValueChain<V>;
export function chain<T>(value: T) {
    const iterable = (
        value === undefined
            ? []
            : value === null
              ? [null]
              : typeof value === 'object' && Symbol.iterator in value
                ? value
                : [value]
    ) as Iter<T>;

    return iterable === value ? chainIter(iterable) : chainElement(value);
}

function chainIter<T>(iterable: Iterable<T>): IterableChain<T> {
    const toIter = { skip, map, flatMap, filter, concat, flat, unique, sort } as const;
    const toElm = { join, last, first, isEmpty, size, at, next, prev, find, some, includes, every, reduce } as const;
    const boundToIter = mapValues(
        toIter,
        (v) =>
            (...args: unknown[]) =>
                chainIter(
                    (v as (iterable: Iterable<unknown>, ...args: unknown[]) => Iterable<unknown>)(iterable, ...args),
                ),
    );
    const boundToElm = mapValues(
        toElm,
        (v) =>
            (...args: unknown[]) =>
                chainElement((v as (iterable: Iterable<unknown>, ...args: unknown[]) => unknown)(iterable, ...args)),
    );

    return {
        value: iterable,
        iterable,
        get array() {
            return [...iterable];
        },
        ...boundToIter,
        ...boundToElm,
        forEach: (mapping: Mapping<T, unknown>) => {
            forEach(iterable, mapping);
            return chainIter(iterable);
        },
    } as IterableChain<T>;
}

function chainElement<T>(value: T): ValueChain<T> {
    const iterable = (value === undefined ? [] : [value]) as Iterable<T>;
    return {
        ...chainIter(iterable),
        value,
    };
}

export type IterableChain<T> = Chain<T> & { value: Iterable<T> };
export type ValueChain<T> = Chain<T> & { value: T };
export type NotIterable<T> = T extends Iterable<unknown> ? never : T;
export type Iter<T> = T extends Iterable<infer E> ? Iterable<E> : Iterable<T>;
export type Chain<T> = {
    last: () => ValueChain<T>;
    first: () => ValueChain<T>;
    isEmpty: () => ValueChain<boolean>;
    size: () => ValueChain<number>;
    at: (index: number) => ValueChain<T>;
    next: () => ValueChain<T>;
    prev: () => ValueChain<T>;
    unique: () => IterableChain<T>;
    map: <S>(m: Mapping<T, S>) => IterableChain<S>;
    flatMap: <S>(m: Mapping<T, S>) => IterableChain<Flat<S>>;
    filter: (p: Predicate<T>) => IterableChain<T>;
    concat: (...iterables: Iterable<T>[]) => IterableChain<T>;
    forEach: (fn: Mapping<T, unknown>) => IterableChain<T>;
    find: (p: Predicate<T>) => ValueChain<T>;
    includes: (element: T) => ValueChain<boolean>;
    some: (p: Predicate<T>) => ValueChain<boolean>;
    sort: (p: Predicate<T, number>) => IterableChain<T>;
    every: (p: Predicate<T>) => ValueChain<boolean>;
    flat: () => IterableChain<Flat<T>>;
    join: () => ValueChain<string>;
    skip: (count: number) => IterableChain<T>;
    reduce: <A>(reducer: (acc: A, item: T) => A, initial: A) => ValueChain<A>;
    iterable: Iterable<T>;
    get array(): T[];
};
