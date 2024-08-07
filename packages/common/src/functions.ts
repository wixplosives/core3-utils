import { sleep } from 'promise-assist';

/**
 * @returns a no operation function
 */
export const noop = () => undefined;
/**
 * @returns a function that returns a resolved Promise
 */
export const asyncNoop = () => Promise.resolve();

/**
 * Make a function executable only once, following calls are ignored
 * @returns fn, wrapped to run only upon first execution
 */
export function once<T extends (...args: any[]) => any>(fn: T): T {
    let run = false;
    let result: ReturnType<T>;
    return ((...args: unknown[]) => {
        if (!run) {
            run = true;
            result = fn(...args) as ReturnType<T>;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result;
    }) as T;
}

/**
 * Ensures `func` will be called with at least `wait` ms between runs.
 * @example
 * ```ts
 * // if `func` is called 3 times in a row:
 * func(1); func(2); func(3);
 * // it will wait `wait` ms between each run:
 * func(1);
 * await sleep(wait);
 * func(2);
 * await sleep(wait);
 * func(3);`
 * ```
 * This is not throttling (!) since eventually all calls will be ran,
 * while in throttling the calls in the "wait" period are skipped.
 */
export function delayed<T extends (...args: any[]) => any>(
    fn: T,
    wait: number,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    let queue: Promise<ReturnType<T> | void> | null = null;
    return ((...args: Parameters<T>) => {
        if (!queue) {
            queue = Promise.resolve(fn(...args));
        } else {
            queue = queue.then(
                () => fn(...args) as ReturnType<T>,
                () => fn(...args) as ReturnType<T>,
            );
        }
        const tmp = queue;
        queue = tmp.then(() => sleep(wait));
        return tmp as Promise<ReturnType<T>>;
    }) as T;
}

/**
 * Ensures that when the async function `fn` is called twice in a row, the
 * second call only begins after the first one has finished (successfully or not).
 *
 * @example
 * ```
 *     const doWork = enforceSequentialExecution(() => {
 *         console.log('start');
 *         await sleep(1000);
 *         console.log('end');
 *     });
 *     void doWork();
 *     void doWork();
 *     // Result: start, end, start, end
 * ```
 */
export function enforceSequentialExecution<P, T extends (...args: any[]) => Promise<Awaited<P>>>(fn: T): T {
    let queue = Promise.resolve(null as P);
    return ((...args: Parameters<T>) => {
        queue = queue.then(
            () => fn(...args),
            () => fn(...args),
        );
        return queue;
    }) as T;
}

/**
 *
 * @param fn a function to memoize
 * @param argsHash a function that returns a string hash for the arguments, defaults to JSON.stringify
 * @returns a memoized version of `fn`
 */
export function memoize<T extends (...args: any[]) => any>(
    fn: T,
    argsHash: (args: Parameters<T>) => string = JSON.stringify,
): T & { __cache: Map<string, ReturnType<T>> } {
    const __cache = new Map<string, ReturnType<T>>();
    return Object.assign(
        ((...args: Parameters<T>) => {
            const key = argsHash(args);
            if (!__cache.has(key)) {
                __cache.set(key, fn(...args) as ReturnType<T>);
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return __cache.get(key);
        }) as T,
        { __cache },
    );
}
