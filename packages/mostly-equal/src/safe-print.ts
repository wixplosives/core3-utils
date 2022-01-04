import type { LookupPath, UnknownObjectRecord } from './types';

export const spaces = (indent: number) => ' '.repeat(indent * 2);

export const printPath = (p: LookupPath) => {
  return `actual${p
    .map((item) => (typeof item === 'number' ? `[${item.toString()}]` : `[${JSON.stringify(item)}]`))
    .join('')}`;
};

export const isPlainObj = (value: unknown): value is UnknownObjectRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const registerChildSet = (
  target: unknown,
  path: Array<string | number>,
  passedMap: Map<unknown, LookupPath>,
  passedSet = new Set<unknown>()
) => {
  const childSet = new Set(passedSet);
  childSet.add(target);
  passedMap.set(target, path);
  return childSet;
};

export const safePrint = (
  target: unknown,
  depth = 0,
  passedMap = new Map<unknown, LookupPath>(),
  passedSet = new Set<unknown>(),
  path: LookupPath = []
): string => {
  if (passedSet.has(target)) {
    return JSON.stringify(`circular data removed, path: ${printPath(path)}`);
  }
  if (Array.isArray(target)) {
    if (target.length === 0) {
      return '[]';
    }

    const childSet = registerChildSet(target, path, passedMap, passedSet);
    const arrContent = target.map((item, idx) => {
      return safePrint(item, depth + 1, passedMap, childSet, [...path, idx]);
    });
    return `[\n${spaces(depth + 1)}${arrContent.join(`,\n${spaces(depth + 1)}`)}\n${spaces(depth)}]`;
  }

  if (isPlainObj(target)) {
    const entries = Object.entries(target);
    if (entries.length === 0) {
      return '{}';
    }
    const childSet = registerChildSet(target, path, passedMap, passedSet);

    const objContent = entries
      .map(([key, val]) => {
        const desc = Object.getOwnPropertyDescriptor(target, key);
        if (desc && desc.get) {
          return `\n${spaces(depth + 1)}"${key}": "getter value removed"`;
        }
        return `\n${spaces(depth + 1)}"${key}": ${safePrint(val, depth + 1, passedMap, childSet, [...path, key])}`;
      })
      .join(',');
    return `{${objContent}\n${spaces(depth)}}`;
  }

  if (target === undefined) {
    return 'undefined';
  }

  if (target === null) {
    return 'null';
  }
  if (typeof target === 'string') {
    return JSON.stringify(target, null, 2);
  }
  return String(target);
};
