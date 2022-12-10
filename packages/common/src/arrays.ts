/**
 * Shuffles an array
 * @returns a new array with the same elements in a random order
 */
export function shuffle<T>(array: T[]): T[] {
    const order = randomizedOrder(array.length);
    return array.map((_, i) => array[order[i]!]!);
}

/**
 *
 * @returns an array of integers in range [0..size-1] in random order
 */
export function randomizedOrder(size: number) {
    const arr = new Array(size).fill(0).map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        swap(arr, i, j);
    }
    return arr;
}

/**
 * Swaps elements of an array in place
 */
export function swap<T>(array: T[], i: number, j: number) {
    const temp = array[i]!;
    array[i] = array[j]!;
    array[j] = temp;
}

/**
 * @example
 * ```ts
 * getCartesianProduct([
                [1, 2],
                [3, 4],
            ]); // => [[1, 3], [1, 4], [2, 3], [2, 4]]
 * ```
 * @returns an array containing all the combinations of one element from each array
 */
export function getCartesianProduct<T>(arrays: T[][]): T[][] {
    if (arrays.length === 0) {
        return [];
    } else if (arrays.length === 1) {
        return arrays[0]!.map((elem) => [elem]);
    } else {
        const otherCombinations = getCartesianProduct(arrays.slice(1));
        const finalCombinations: T[][] = [];
        for (const elem of arrays[0]!) {
            for (const combo of otherCombinations) {
                finalCombinations.push([elem, ...combo]);
            }
        }
        return finalCombinations;
    }
}
