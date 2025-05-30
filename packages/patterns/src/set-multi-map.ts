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
    private map = new Map<K, Set<V>>();

    constructor(entries?: Iterable<[K, V]>) {
        if (entries) {
            for (const [key, value] of entries) {
                this.add(key, value);
            }
        }
    }

    public get size(): number {
        let total = 0;
        for (const { size } of this.map.values()) {
            total += size;
        }
        return total;
    }

    public get(key: K): ReadonlySet<V> | undefined {
        return this.map.get(key);
    }

    public add(key: K, value: V): this {
        const valueSet = this.map.get(key);
        if (valueSet) {
            valueSet.add(value);
        } else {
            this.map.set(key, new Set([value]));
        }
        return this;
    }

    public clear(): void {
        this.map.clear();
    }

    public delete(key: K, value: V): boolean {
        const valueSet = this.map.get(key);
        if (valueSet) {
            const wasInSet = valueSet.delete(value);
            if (valueSet.size === 0) {
                this.map.delete(key);
            }
            return wasInSet;
        }
        return false;
    }

    public deleteKey(key: K): boolean {
        return this.map.delete(key);
    }

    public has(key: K, value: V): boolean {
        const valueSet = this.map.get(key);
        return valueSet ? valueSet.has(value) : false;
    }

    public hasKey(key: K): boolean {
        const existingSet = this.map.get(key);
        return !!existingSet && existingSet.size > 0;
    }

    public [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }

    public *entries(): IterableIterator<[K, V]> {
        const { map } = this;
        for (const [key, valueSet] of map.entries()) {
            for (const value of valueSet) {
                yield [key, value];
            }
        }
    }

    public *values(): IterableIterator<V> {
        const { map } = this;
        for (const valueSet of map.values()) {
            yield* valueSet.values();
        }
    }

    public keys(): IterableIterator<K> {
        return this.map.keys();
    }
}

export function isSetMultiMap<K, V>(x: unknown): x is SetMultiMap<K, V> {
    return x instanceof SetMultiMap;
}
