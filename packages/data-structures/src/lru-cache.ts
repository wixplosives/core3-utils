export interface LRUCacheConfig {
    maxSize?: number;
}

/**
 * BASIC (not optimal) implementation of the LRU cache
 */
export class LRUCache<K, V> {
    private cache = new Map<K, V>();
    private keys: K[] = [];
    private maxSize: number;

    constructor(private config: LRUCacheConfig = {}) {
        this.maxSize = config.maxSize ?? Infinity;

        if (this.maxSize < 1) {
            throw new Error('LRUCache max size must be larger than 0');
        }
    }

    public set(key: K, value: V): void {
        this.updateKeysOrder(key);

        if (this.keys.length > this.maxSize) {
            const removedKey = this.keys.shift();
            this.cache.delete(removedKey!);
        }

        this.cache.set(key, value);
    }

    public get(key: K): V | undefined {
        if (!this.cache.has(key)) {
            return;
        }

        this.updateKeysOrder(key);

        return this.cache.get(key);
    }

    public delete(key: K): void {
        const keyIndex = this.keys.indexOf(key);
        if (keyIndex > -1) {
            this.keys.splice(keyIndex, 1);
        }

        this.cache.delete(key);
    }

    public has(key: K): boolean {
        return this.cache.has(key);
    }

    public size(): number {
        return this.cache.size;
    }

    public clear(): void {
        this.cache.clear();
        this.keys = [];
    }

    private updateKeysOrder(key: K) {
        const keyIndex = this.keys.indexOf(key);
        if (keyIndex > -1) {
            this.keys.splice(keyIndex, 1);
        }
        this.keys.push(key);
    }
}
