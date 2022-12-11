import { RejectedError, StepError } from './errors';
import type { StepBase } from './types';

export function wrapPromise<T, S extends StepBase<any, T>>(src: Promise<T>, dispose: () => void = () => void 0) {
    let resolve!: (value: T) => void;
    let reject!: (reason?: any) => void;

    const p = new Promise<T>((_resolve, _reject) => {
        resolve = (value: T) => {
            dispose();
            _resolve(value);
        };
        reject = (reason: any) => {
            dispose();
            _reject(reason instanceof StepError ? reason : new RejectedError(p, reason));
        };
        src.then(resolve, reject);
    }) as S;

    return { p, resolve, reject };
}

export const parseInfoJson = (info: any) => JSON.stringify(info, null, 2);
