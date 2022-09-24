export const noop = () => undefined;
export const asyncNoop = () => Promise.resolve();
export const once = <T extends (...args:any[])=>any>(fn:T):T => {
    let run = false;
    let result:any;
    return ((...args:any[]) => {
        if (!run) {
            run = true;
            result = fn(...args)
        }
        return result;
    }) as T
}
