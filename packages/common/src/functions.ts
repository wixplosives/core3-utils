export const noop = () => undefined;
export const asyncNoop = () => Promise.resolve();

/**
 * 
 * @param fn 
 * @returns fn, wrapped to run only upon first execution
 */
export const once = <T extends (...args:unknown[])=>unknown>(fn:T):T => {
    let run = false;
    let result:ReturnType<T>;
    return ((...args:unknown[]) => {
        if (!run) {
            run = true;
            result = fn(...args) as ReturnType<T>
        }
        return result;
    }) as T
}
