import { forEach, chain } from '@wixc3/common';

/**
 * Maps two keys to a value
 * @example
 * ```ts
 * const m = new SetMultiMap([['a', 1, 'one'],['a', 2, 'two'])
 * m.add('a', 3, 'three')
 *
 * m.has('a', 1) // => true
 * m.has('a',2) // => true
 * m.has('a',3) // => true
 * m.has('a',4) // => false
 *
 * m.get('a', 1) // => 'one'
 * m.get('a',2) // => 'two'
 * m.get('a',3) // => 'three'
 * m.get('a',4) // => undefined
 *
 * m.delete('a', 1) // => true
 * m.has('a', 1) // => false
 *
 * ```
 */
export class MultiMap<K1, K2, V> implements Iterable<[[K1, K2], V]> {
    private map = new Map<K1, Map<K2, V>>();

    constructor(entries?: Iterable<[K1, K2, V]>) {
        forEach(entries, ([key1, key2, val]: [K1, K2, V]) => {
            this.set(key1, key2, val);
        });
    }

    public get size(): number {
        return chain(this.map)
            .map(([_, { size }]) => size)
            .reduce((sum: number, size: number) => sum + size, 0).value;
    }

    public get(key1: K1, key2: K2): V | undefined {
        return this.map.get(key1)?.get(key2);
    }

    public set(key1: K1, key2: K2, value: V): this {
        const innerMap = this.map.get(key1);
        if (innerMap) {
            innerMap.set(key2, value);
        } else {
            this.map.set(key1, new Map([[key2, value]]));
        }
        return this;
    }

    public clear(): void {
        this.map.clear();
    }

    public delete(key1: K1, key2: K2): boolean {
        const innerMap = this.map.get(key1);
        if (innerMap) {
            const wasInSet = innerMap.delete(key2);
            if (innerMap.size === 0) {
                this.map.delete(key1);
            }
            return wasInSet;
        }
        return false;
    }

    public has(key1: K1, key2: K2): boolean {
        const innerMap = this.map.get(key1);
        return innerMap ? innerMap.has(key2) : false;
    }

    public [Symbol.iterator](): IterableIterator<[[K1, K2], V]> {
        return this.entries();
    }

    public *entries(): IterableIterator<[[K1, K2], V]> {
        const { map } = this;
        for (const [key1, innerMap] of map.entries()) {
            for (const [key2, value] of innerMap.entries()) {
                yield [[key1, key2], value];
            }
        }
    }

    public *values(): IterableIterator<V> {
        const { map } = this;
        for (const innerMap of map.values()) {
            yield* innerMap.values();
        }
    }

    public *keys(): IterableIterator<[K1, K2]> {
        const { map } = this;
        for (const [key1, innerMap] of map.entries()) {
            for (const key2 of innerMap.keys()) {
                yield [key1, key2];
            }
        }
    }

    public getInnerMap(key1: K1): Map<K2, V> | undefined {
        return this.map.get(key1);
    }

    public deleteInnerMap(key1: K1): boolean {
        return this.map.delete(key1);
    }
}

export function isMultiMap<K1, K2, V>(x: any): x is MultiMap<K1, K2, V> {
    return x instanceof MultiMap;
}
