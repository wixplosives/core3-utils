export type PromiseStep<T> = Promise<T> & {
    timeout: (ms: number) => PromiseStep<T>;
    description: (description: string) => PromiseStep<T>;
    _description: Readonly<string>;
    info: any;
    stack: string;
};

export function promiseStep<T, S extends PromiseStep<T>>(src: Promise<T>, ctx: Mocha.Context): S {
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
                    `Error in step "${p._description}"\ncause: ${
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

    p.timeout = (ms: number) => {
        const diff = ms - timeout;
        timeout = ms;
        ctx.timeout(ctx.timeout() + diff);
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            const err = new Error(
                `Timed out in step "${p._description}" after ${ms}ms${p.info ? `\nInfo: ${p.info}` : ''}`
            );
            err.stack = p.stack || err.stack;
            reject(err);
        }, ms);
        return p;
    };

    p.description = (_description: string) => {
        p._description = _description;
        return p;
    };

    return p;
}
