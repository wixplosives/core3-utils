import { forEach } from '@wixc3/common';
import { MultiMap } from './multi-map';

/**
 * Maps keys to a set of values
 * @example
 * ```ts
 * const m = new SetMultiMap([['a',1],['a',2]])
 * m.add('a',3)
 * m.has('a',1) // => true
 * m.has('a',2) // => true
 * m.has('a',3) // => true
 * m.has('a',4) // => false
 * ```
 */
export class SetMultiMap<K, V> implements Iterable<[K, V]> {
    private map = new MultiMap<K, V, boolean>();

    constructor(entries?: Iterable<[K, V]>) {
        forEach(entries, ([key, val]: [K, V]) => {
            this.add(key, val);
        });
    }

    public get size(): number {
        return this.map.size;
    }

    public get(key: K): ReadonlySet<V> | undefined {
        const innerKeys = this.map.getInnerMap(key)?.keys();
        return innerKeys ? new Set(innerKeys) : undefined;
    }

    public add(key: K, value: V): this {
        this.map.set(key, value, true);
        return this;
    }

    public clear(): void {
        this.map.clear();
    }

    public delete(key: K, value: V): boolean {
        return this.map.delete(key, value);
    }

    public deleteKey(key: K): boolean {
        return this.map.deleteInnerMap(key);
    }

    public has(key: K, value: V): boolean {
        return this.map.has(key, value);
    }

    public hasKey(key: K): boolean {
        const existingSet = this.get(key);
        return !!existingSet && existingSet.size > 0;
    }

    public [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }

    public *entries(): IterableIterator<[K, V]> {
        const { map } = this;
        yield* map.keys();
    }

    public *values(): IterableIterator<V> {
        const { map } = this;
        for (const [_key, value] of map.keys()) {
            yield value;
        }
    }

    public *keys(): IterableIterator<K> {
        const { map } = this;
        for (const [key, _value] of map.keys()) {
            yield key;
        }
    }
}

export function isSetMultiMap<K, V>(x: any): x is SetMultiMap<K, V> {
    return x instanceof SetMultiMap;
}
