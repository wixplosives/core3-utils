/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

export const spaces = (indent: number) => {
  const arr = new Array(indent);
  arr.fill('    ');
  return arr.join('');
};

export interface SafePrintResults {
  main: string;
  refs: Record<string, string>;
}

type Path = Array<string | number>;
export const printPath = (p: Path) => {
  return `actual${p.map((item) => (typeof item === 'number' ? `[${item.toString()}]` : `.${item}`)).join('')}`;
};

export const safePrint = (
  target: any,
  depth = 0,
  passedMap = new Map<any, Path>(),
  passedSet = new Set<any>(),
  path: Array<string | number> = []
) => {
  return safePrintRecurse(target, depth, passedMap, passedSet, path);
};

export const safePrintRecurse = (
  target: any,
  depth: number,
  passedMap: Map<any, Path>,
  passedSet = new Set<any>(),
  path: Array<string | number>
): string => {
  if (passedSet.has(target)) {
    return `"circular data removed, path: ${printPath(path)}"`;
  }
  if (Array.isArray(target)) {
    if (target.length === 0) {
      return '[]';
    }
    const childSet = new Set(passedSet);
    childSet.add(target);
    passedMap.set(target, path);

    const arrContent = target.map((item, idx) =>
      safePrintRecurse(item, depth + 1, passedMap, childSet, [...path, idx])
    );
    return `[\n${spaces(depth + 1)}${arrContent.join(`,\n${spaces(depth + 1)}`)}\n${spaces(depth)}]`;
  }

  if (target instanceof Object) {
    const entries = Object.entries(target);
    if (entries.length === 0) {
      return '{}';
    }
    const childSet = new Set(passedSet);
    childSet.add(target);
    passedMap.set(target, path);

    const objContent = entries
      .map(
        ([key, val]) =>
          `\n${spaces(depth + 1)}"${key}": ${safePrintRecurse(val, depth + 1, passedMap, childSet, [...path, key])}`
      )
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
    return `"${target}"`;
  }
  return target.toString();
};
