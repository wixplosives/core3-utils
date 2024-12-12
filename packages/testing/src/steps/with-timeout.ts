import { wrapPromise } from './common.js';
import { TimeoutError } from './errors.js';
import { mochaCtx } from '../mocha-ctx.js';
import type { Info, PromiseWithTimeout } from './types.js';
import { adjustCurrentTestTimeout } from '../timeouts.js';

export function createTimeoutStep<T>(
    src: Promise<T>,
    rejectAfterTimeout: boolean,
    adjustTestTime = true,
): PromiseWithTimeout<T> {
    let timerId: ReturnType<typeof setTimeout>;
    const clearPromiseTimeout = () => clearTimeout(timerId);
    const { p, resolve, reject } = wrapPromise<T, Info & { timeout: number }, PromiseWithTimeout<T>>(
        src,
        { timeout: 0 },
        clearPromiseTimeout,
    );

    p.timeout = (ms: number) => {
        ms = adjustTimeout<T>(ms, p, adjustTestTime);
        if (mochaCtx()?.timeout() || !rejectAfterTimeout) {
            clearPromiseTimeout();
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            timerId = setTimeout(async () => {
                if (rejectAfterTimeout) {
                    await reject(TimeoutError);
                } else {
                    resolve(null as T);
                }
            }, ms);
        }
        return p;
    };
    return p;
}

function adjustTimeout<T>(ms: number, p: PromiseWithTimeout<T>, adjust: boolean) {
    const diff = ms - p.info.timeout;
    p.info.timeout = ms;
    if (adjust) adjustCurrentTestTimeout(diff);
    return ms;
}
