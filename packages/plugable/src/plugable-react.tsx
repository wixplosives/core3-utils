import { createContext, useContext, useEffect, useState } from 'react';
import type { Plugable, Key } from './types';
import { createPlugable, on, get } from './plugable';

export const PlugableContext = createContext<Plugable>(createPlugable());

export function usePlugable() {
  return useContext(PlugableContext);
}

export function usePlugableValue<T>(key: Key<T>): T | undefined {
  const [_, setState] = useState({});
  const map = usePlugable();
  useEffect(() => on(map, key, () => setState({})), [key]);
  return get(map, key);
}
