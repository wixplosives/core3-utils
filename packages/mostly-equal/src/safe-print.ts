import type { UnknownObjectRecord, LookupPath, Formatter } from './types';

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
    passedSet = new Set<unknown>(),
) => {
    const childSet = new Set(passedSet);
    childSet.add(target);
    passedMap.set(target, path);
    return childSet;
};
export const isGetter = (target: Record<string, unknown>, key: string) => {
    const desc = Object.getOwnPropertyDescriptor(target, key);
    return !!desc && !!desc.get;
};

// Formatters can be used to replace the value before printing

export const safePrint = (
    target: unknown,
    maxDepth = 10,
    formatters: Formatter[] = [],
    depth = 0,
    passedMap = new Map<unknown, LookupPath>(),
    passedSet = new Set<unknown>(),
    path: LookupPath = [],
): string => {
    if (passedSet.has(target)) {
        return JSON.stringify(`circular data removed, path: ${printPath(path)}`);
    }
    const formatter = formatters.find((r) => r.isApplicable(target, path));
    if (formatter) {
        return JSON.stringify(formatter.format(target, path));
    }
    if (Array.isArray(target)) {
        if (depth >= maxDepth) {
            return `[ /* array content truncated, max depth reached */ ]`;
        }
        if (target.length === 0) {
            return '[]';
        }

        const childSet = registerChildSet(target, path, passedMap, passedSet);
        const arrContent = target.map((item, idx) => {
            return safePrint(item, maxDepth, formatters, depth + 1, passedMap, childSet, [...path, idx]);
        });
        return `[\n${spaces(depth + 1)}${arrContent.join(`,\n${spaces(depth + 1)}`)}\n${spaces(depth)}]`;
    }

    if (isPlainObj(target)) {
        if (depth >= maxDepth) {
            return `{ /* object content truncated, max depth reached */ }`;
        }
        const names = Object.getOwnPropertyNames(target);
        if (names.length === 0) {
            return '{}';
        }
        const childSet = registerChildSet(target, path, passedMap, passedSet);

        const objContent = names
            .map((key) => {
                if (isGetter(target, key)) {
                    return `\n${spaces(depth + 1)}"${key}": "getter value removed"`;
                }
                return `\n${spaces(depth + 1)}"${key}": ${safePrint(
                    target[key],
                    maxDepth,
                    formatters,
                    depth + 1,
                    passedMap,
                    childSet,
                    [...path, key],
                )}`;
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
    if (typeof target === 'function') {
        return JSON.stringify(target.toString());
    }
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return JSON.stringify(String(target));
};
