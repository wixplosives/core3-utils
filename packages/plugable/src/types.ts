const secret = Symbol();
export const internals = Symbol('internals');

export type Key<V = unknown> = symbol & { [secret]: V | undefined };
export type Val<T> = T extends Key<infer V> ? V : never;

export type PlugableInternals = {
    parent: Plugable | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly listeners: Map<Key, Set<(value: any) => void>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly handlerToRec: WeakMap<(value: any) => void, Plugable>;
};

export type PlugableApi = {
    getThrow<Value>(key: Key<Value>): Value;
    get<Value>(key: Key<Value>): Value | undefined;
    set<Value>(key: Key<Value>, value: Value, isEqual?: (previous: Value | undefined, value: Value) => boolean): void;
    on<K extends Key>(key: K, listener: (value: Val<K>) => void): () => void;
};

export type Plugable = PlugableApi & {
    [internals]: PlugableInternals;
};
