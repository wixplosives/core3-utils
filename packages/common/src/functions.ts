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
        return result;
    }) as T;
}
