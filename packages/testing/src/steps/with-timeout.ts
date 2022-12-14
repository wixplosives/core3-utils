import { parseInfoJson, wrapPromise } from './common';
import { TimeoutError } from './errors';
import { adjustTestTime } from './mocha-ctx';
import { timeDilation } from './time-dilation';
import type { PromiseWithTimeout } from './types';

export function createTimeoutStep<T>(src: Promise<T>, rejectAfterTimeout: boolean): PromiseWithTimeout<T> {
    let timerId: number;
    const clearPromiseTimeout = () => clearTimeout(timerId);
    const { p, resolve, reject } = wrapPromise<T, PromiseWithTimeout<T>>(src, clearPromiseTimeout);

    p._parseInfoForErrorMessage = parseInfoJson;
    p.info = { description: '', timeout: 0 };

    p.timeout = (ms: number) => {
        ms = adjustMochaTimeout<T>(ms, p);
        clearPromiseTimeout();
        timerId = setTimeout(() => {
            if (rejectAfterTimeout) {
                reject(new TimeoutError(p));
            } else {
                resolve(null as T);
            }
        }, ms);
        return p;
    };

    p.description = (_description: string) => {
        p.info.description = _description;
        return p;
    };

    return p;
}

function adjustMochaTimeout<T>(ms: number, p: PromiseWithTimeout<T>) {
    ms = ms * timeDilation();
    const diff = ms - p.info.timeout;
    p.info.timeout = ms;
    adjustTestTime(diff, false);
    return ms
}
