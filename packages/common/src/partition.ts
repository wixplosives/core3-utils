/**
 * Partition unordered data into buckets of similar total weight
 *
 * @example
 * ```typescript
 *  partition([1, 2, 3], 2, (i) => i)) // [[3], [2, 1]];
 * ```
 * @param data
 * @param bucketsCount
 * @param predicate maps a data items to weight
 * @returns buckets of similar total weight (sorted by weights, descending)
 */
export function partition<T>(data: T[], bucketsCount: number, predicate: (item: T) => number): T[][] {
    const items = data.toSorted((a, b) => predicate(a) - predicate(b));
    const buckets = Array.from({ length: bucketsCount }, () => ({ total: 0, content: [] as T[] }));

    const findSmallest = () =>
        buckets.reduce((smallest, current) => (current.total < smallest.total ? current : smallest), buckets[0]!);

    while (items.length > 0) {
        const nextItem = items.pop() as T;
        const smallestBucket = findSmallest();
        smallestBucket.content.push(nextItem);
        smallestBucket.total += predicate(nextItem);
    }

    return buckets.toSorted((a, b) => b.total - a.total).map((bucket) => bucket.content);
}
