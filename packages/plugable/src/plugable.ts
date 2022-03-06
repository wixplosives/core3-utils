import { type Plugable, type Key, internals, PlugableInternals, Val } from './types';

export function createPlugable(): Plugable {
  const rec = Object.create(null) as Plugable;
  rec[internals] = {
    parent: undefined,
    listeners: new Map(),
    handlerToRec: new WeakMap(),
  };
  return rec;
}

export function inheritPlugable(rec: Plugable) {
  const inherited = Object.create(rec) as Plugable;
  inherited[internals] = Object.create(rec[internals]) as PlugableInternals;
  inherited[internals].parent = rec;
  return inherited;
}

export function createKey<V = never>(debugName?: string): Key<V> {
  return Symbol(debugName) as Key<V>;
}

export function getThrow<Value>(rec: Plugable, key: Key<Value>): Value {
  const value = get(rec, key);
  if (value === undefined || value === null) {
    throw new Error(`missing value for key ${String(key)}`);
  }
  return value;
}

export function get<Value>(rec: Plugable, key: Key<Value>): Value | undefined {
  return (rec as Record<Key<Value>, Value>)[key];
}

export function set<Value>(
  rec: Plugable,
  key: Key<Value>,
  value: Value,
  isEqual = (previous: Value | undefined, value: Value) => previous === value
) {
  if (!isEqual(get(rec, key), value)) {
    (rec as Record<Key<Value>, Value>)[key] = value;
    dispatch(rec, key, value);
  }
}

function hasOwn(obj: unknown, key: string | symbol) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function dispatch<T>(rec: Plugable, key: Key<T>, value: T) {
  const { listeners, handlerToRec } = rec[internals];
  listeners.get(key)?.forEach((listener) => shouldDispatch(rec, handlerToRec.get(listener), key) && listener(value));
}

function shouldDispatch(dispatcherRec: Plugable, handlerRec: Plugable | undefined, key: string | symbol): boolean {
  if (dispatcherRec === handlerRec) {
    return true;
  } else if (handlerRec && !hasOwn(handlerRec, key)) {
    return shouldDispatch(dispatcherRec, handlerRec[internals].parent, key);
  } else {
    return false;
  }
}

export function on<K extends Key>(rec: Plugable, key: K, listener: (value: Val<K>) => void) {
  const { listeners, handlerToRec } = rec[internals];
  let handlers = listeners.get(key);
  if (!handlers) {
    handlers = new Set();
    listeners.set(key, handlers);
  }
  handlers.add(listener);
  handlerToRec.set(listener, rec);
  return () => {
    handlers?.delete(listener);
  };
}
