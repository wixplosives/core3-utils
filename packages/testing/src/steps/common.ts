import { RejectedError, StepError } from './errors';
import type { Info, StepBase } from './types';

export function wrapPromise<T, I extends Info, S extends StepBase<I, T>>(
    src: Promise<T>,
    info: Omit<I, keyof Info>,
    dispose: () => void = () => void 0
) {
    let resolve!: (value: T) => void;
    let reject!: (reason?: any) => Promise<void>;
    let isSettled = false;
    let extraInfo: (() => string | object | Promise<string | object>) | undefined;

    const p = new Promise<T>((_resolve, _reject) => {
        resolve = (value: T) => {
            if (isSettled) throw 'Already settled';
            isSettled = true;
            dispose();
            _resolve(value);
        };
        reject = async (reason: any) => {
            if (isSettled) throw 'Already settled';
            isSettled = true;
            if (extraInfo) {
                p.info.extra = await Promise.resolve(extraInfo());
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (typeof reason === 'function' && typeof reason.constructor === 'function') {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                reason = new reason(p);
            }
            dispose();
            _reject(reason instanceof StepError ? reason : new RejectedError(p, reason));
        };
        src.then(resolve, reject);
    }) as S;

    p._parseInfoForErrorMessage = parseInfoJson;
    p.info = { description: '', ...info } as I;
    p.description = (_description: string, _extraInfo?: () => string | object | Promise<string | object>) => {
        p.info.description = _description;
        extraInfo = _extraInfo;
        return p;
    };

    return { p, resolve, reject };
}

export const parseInfoJson = (info: any) => JSON.stringify(info, null, 2);
