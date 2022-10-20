import {
    at,
    concat,
    every,
    filter,
    find,
    first,
    Flat,
    flat,
    flatMap,
    forEach,
    includes,
    isEmpty,
    last,
    map,
    Mapping,
    next,
    Predicate,
    prev,
    reduce,
    size,
    some,
    unique,
} from './iterables';
import { mapValue } from './objects';

/**
 * Chain iterable operations, each acting on the output of the previous step
 *
 * @example <caption>When the action is per item, the result is accessible as *iterable*</caption>
 * chain([0,1,2])
 *      .filter(i => i)
 *      .map(i => i**2)
 *      .iterable => [1,4]
 * @example <caption>When the action returns an element (as in first, next, reduce etc) the  the result is accessible as *value*</caption>
 * chain([0,1,2]).filter(i => i).first().value => 1
 * @example <caption>However, iterable is always accessible, as a single element iterable</caption>
 * chain([0,1,2]).filter(i => i).first().iterable => [1]
 * @example <caption>**Note** if the action returned undefined, iterable will be empty </caption>
 * chain([]).first().iterable => []
 * chain([]).first().value => undefined
 * @param value
 * @returns
 */
export function chain<T>(iterable: Iterable<T>): IterableChain<T>;
export function chain<T, V extends NotIterable<T>>(value: V): ValueChain<V>;
export function chain<T>(value: T) {
    const iterable = (
        value === undefined ? [] : value === null ? [null] : Symbol.iterator in value ? value : [value]
    ) as Iter<T>;

    return iterable === value ? chainIter(iterable) : chainElement(value);
}

function chainIter<T>(iterable: Iterable<T>): IterableChain<T> {
    const toIter = { map, flatMap, filter, concat, flat, unique };
    const toElm = { last, first, isEmpty, size, at, next, prev, find, some, includes, every, reduce };
    return {
        value: iterable,
        iterable,
        ...mapValue(
            toIter,
            (v) =>
                (...args: any[]) =>
                    chainIter(v(iterable, ...args) as Iterable<unknown>)
        ),
        ...mapValue(
            toElm,
            (v) =>
                (...args: any[]) =>
                    chainElement(v(iterable, ...args) as Iterable<unknown>)
        ),
        forEach: (mapping: Mapping<T, unknown>) => {
            forEach(iterable, mapping);
            return chainIter(iterable);
        },
    } as any as IterableChain<T>;
}

function chainElement<T>(value: T): ValueChain<T> {
    const iterable = (value === undefined ? [] : [value]) as Iterable<T>;
    return {
        ...chainIter(iterable),
        value,
    };
}

type IterableChain<T> = Chain<T> & { value: Iterable<T> };
type ValueChain<T> = Chain<T> & { value: T };
type NotIterable<T> = T extends Iterable<unknown> ? never : T;
type Iter<T> = T extends Iterable<infer E> ? Iterable<E> : Iterable<T>;
type Chain<T> = {
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
    every: (p: Predicate<T>) => ValueChain<boolean>;
    flat: () => IterableChain<Flat<T>>;
    reduce: <A>(reducer: (acc: A, item: T) => A, initial: A) => ValueChain<A>;
    iterable: Iterable<T>;
};
