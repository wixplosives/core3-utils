import { parseInfoJson, wrapPromise } from './common';
import type { PromiseStep } from './types';

export function createPromiseStep<T>(src: Promise<T>): PromiseStep<T> {
    const { p } = wrapPromise<T, PromiseStep<T>>(src);

    p._parseInfoForErrorMessage = parseInfoJson;
    p.info = { description: '' };

    p.description = (_description: string) => {
        p.info.description = _description;
        return p;
    };

    return p;
}
