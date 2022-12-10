import { PromiseWithTimeout, RejectedError, TimeoutError } from "./types";

export function promiseStep<T>(
    src: Promise<T>,
    ctx: Mocha.Context,
    rejectAfterTimeout: boolean,
    timeDilation: number
): PromiseWithTimeout<T> {
    let timerId: number;
    let timeout = 0;
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;

    const p = new Promise<T>((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
        src.then(
            (value) => {
                clearTimeout(timerId);
                resolve(value);
            },
            (reason) => {
                clearTimeout(timerId);
                reject(new RejectedError(p,reason));
            }
        );
    }) as PromiseWithTimeout<T>;
    p._parseInfoForErrorMessage = (info:any) => JSON.stringify(info, null, 2)
    p.info = {description:'', timeout:0}

    const _timeout = (ms: number, adjustToMachinePower = true) => {
        if (adjustToMachinePower) {
            ms = ms * timeDilation;
        }
        const diff = ms - timeout;
        timeout = ms;
        ctx.timeout(ctx.timeout() + diff);
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            if (rejectAfterTimeout) {
                reject(new TimeoutError(p));
            } else {
                resolve(null as T);
            }
        }, ms);
        return p;
    };
    _timeout.current = 0;
    p.timeout = _timeout;

    const _description = (_description: string) => {
        p.info.description = _description;
        return p;
    };
    _description.current = '';
    p.description = _description;

    return p;
}

