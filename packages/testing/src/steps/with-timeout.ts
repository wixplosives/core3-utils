import { wrapPromise } from './common';
import { TimeoutError } from './errors';
import { adjustTestTime, mochaCtx } from '../mocha-ctx';
import type { Info, PromiseWithTimeout } from './types';

export function createTimeoutStep<T>(
    src: Promise<T>,
    rejectAfterTimeout: boolean,
    adjustTestTime = true,
): PromiseWithTimeout<T> {
    let timerId: number;
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
    if (adjust) adjustTestTime(diff);
    return ms;
}
