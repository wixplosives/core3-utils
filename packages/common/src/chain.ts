import { at, concat, every, filter, find, first, Flat, flat, flatMap, forEach, includes, isEmpty, last, map, Mapping, next, Predicate, prev, size, some, unique } from "./iterables"
import { mapValue } from "./objects"

export function chain<T>(iterable: Iterable<T>): IterChain<T>
export function chain<T, V extends NotIterable<T>>(value: V): ElmChain<V>
export function chain<T>(value: T) {
    const iterable = (value === undefined
        ? []
        : value === null
            ? [null]
            : Symbol.iterator in value
                ? value
                : [value]) as Iter<T>

    return iterable === value
        ? chainIter(iterable)
        : chainElement(value)
}

function chainIter<T>(iterable: Iterable<T>): IterChain<T> {
    const toIter = { map, flatMap, filter, concat, flat, unique }
    const toElm = { last, first, isEmpty, size, at, next, prev, find, some, includes, every }
    return {
        value: iterable,
        iterable,
        ...mapValue(toIter, v => (...args: any[]) => chainIter(v(iterable, ...args) as Iterable<unknown>)),
        ...mapValue(toElm, v => (...args: any[]) => chainElement(v(iterable, ...args) as Iterable<unknown>)),
        forEach: (mapping: Mapping<T, unknown>) => {
            forEach(iterable, mapping)
            return chainIter(iterable)
        }
    } as any as IterChain<T>
}

function chainElement<T>(value: T|undefined): ElmChain<T> {
    const iterable = (value === undefined ? [] : [value]) as Iterable<T>
    return {
        ...chainIter(iterable),
        value
    }
}

type IterChain<T> = Chain<T> & {value:Iterable<T>}
type ElmChain<T> = Chain<T> & {value?:T}
type NotIterable<T> = T extends Iterable<unknown> ? never : T
type Iter<T> = T extends Iterable<infer E> ? Iterable<E> : Iterable<T>
type Chain<T> = {
    last: () => ElmChain<T>
    first: () => ElmChain<T>
    isEmpty: () => ElmChain<boolean>
    size: () => ElmChain<number>
    at: (index: number) => ElmChain<T>
    next: () => ElmChain<T>
    prev: () => ElmChain<T>
    unique: () => IterChain<T>
    map: <S>(m: Mapping<T, S>) => IterChain<S>
    flatMap: <S>(m: Mapping<T, S>) => IterChain<Flat<S>>
    filter: (p: Predicate<T>) => IterChain<T>
    concat: (...iterables: Iterable<T>[]) => IterChain<T>
    forEach: (fn: Mapping<T, unknown>) => IterChain<T>
    find: (p: Predicate<T>) => ElmChain<T>
    includes: (element: T) => ElmChain<boolean>
    some: (p: Predicate<T>) => ElmChain<boolean>
    every: (p: Predicate<T>) => ElmChain<boolean>
    flat: () => IterChain<Flat<T>>
    iterable: Iterable<T>
}