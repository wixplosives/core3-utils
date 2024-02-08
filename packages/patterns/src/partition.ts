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
 * @returns
 */
export function partition<T>(data: T[], bucketsCount: number, predicate: (item: T) => number): T[][] {
    const items = data.toSorted((a, b) => predicate(a) - predicate(b));
    const buckets = Array.from({ length: bucketsCount }, () => [] as T[]);
    const totals = Array.from({ length: bucketsCount }, () => 0);

    const findSmallest = () => buckets.reduce((acc, _, idx) => (totals[idx]! < totals[acc]! ? idx : acc), 0);

    while (items.length > 0) {
        const nextItem = items.pop() as T;
        const smallestBucket = findSmallest();
        buckets[smallestBucket]!.push(nextItem);

        totals[smallestBucket] += predicate(nextItem);

        buckets[findSmallest()]!.push();
    }

    return buckets;
}
