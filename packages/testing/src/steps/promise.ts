export function promiseStep<T, S extends PromiseStep<T>>(
    src: Promise<T>,
    ctx: Mocha.Context,
    rejectAfterTimeout: boolean,
    timeDilation: number
): S {
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
                const err = new Error(
                    `Error in step "${p.description.current}"\ncause: ${
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        reason?.message || reason
                    }\n${p.stack}`,
                    { cause: reason }
                );
                err.stack = p.stack || err.stack;
                reject(err);
            }
        );
    }) as S;

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
                const err = new Error(
                    `Timed out in step "${p.description.current}" after ${ms}ms${p.info ? `\nInfo: ${p.info}` : ''}`
                );
                err.stack = p.stack || err.stack;
                reject(err);
            } else {
                resolve(null as T);
            }
        }, ms);
        return p;
    };
    _timeout.current = 0;
    p.timeout = _timeout;

    const _description = (_description: string) => {
        p.description.current = _description;
        return p;
    };
    _description.current = '';
    p.description = _description;

    return p;
}

export interface Timeout<T> {
    (ms: number, adjustToMachinePower?: boolean): T;
    current: number;
}
export interface Description<T> {
    (description: string): T;
    current: Readonly<string>;
}

export type PromiseStep<T> = Promise<T> & {
    timeout: Timeout<PromiseStep<T>>;
    description: Description<PromiseStep<T>>;
    info: any;
    stack: string;
};
