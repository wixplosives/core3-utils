import { createContext, useContext, useEffect, useState } from 'react';
import type { Plugable, Key } from './types';
import { on, get } from './plugable';

export const PlugableContext = createContext<Plugable | undefined>(undefined);

export function usePlugable() {
  const plugable = useContext(PlugableContext);
  if (!plugable) {
    throw new Error('PlugableContext is not initialized');
  }
  return plugable;
}

function toggle(v: boolean) {
  return !v;
}

export function usePlugableValue<T>(key: Key<T>): T | undefined {
  const [_, setState] = useState(true);
  const map = usePlugable();
  useEffect(() => on(map, key, () => setState(toggle)), [key]);
  return get(map, key);
}
