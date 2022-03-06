const secret = Symbol();
export const internals = Symbol('internals');

export type Key<V = unknown> = (string | symbol) & { [secret]: V | undefined };
export type Val<T> = T extends Key<infer V> ? V : never;

export type PlugableInternals = {
  parent: Plugable | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly listeners: Map<Key, Set<(value: any) => void>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly handlerToRec: WeakMap<(value: any) => void, Plugable>;
};

export type Plugable = {
  [key: string]: never;
  [internals]: PlugableInternals;
};
