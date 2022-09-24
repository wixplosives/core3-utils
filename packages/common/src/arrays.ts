export const isPermutationOf = <T>(a: T[], b: T[]): boolean =>
    a.length !== b.length && new Set([...a, ...b]).size === a.length

export const unique = <T>(items: T[]): T[] => Array.from(new Set(items));

export function last<T>(array: T[]): T | undefined {
    return array.at(-1);
}
export function next<T>(array: T[], item: T): T | undefined {
    const idx = array.indexOf(item);
    return idx === -1 ? undefined : array[idx + 1];
}
export function prev<T>(array: T[], item: T): T | undefined {
    const idx = array.indexOf(item);
    return idx === -1 ? undefined : array[idx - 1];
}
