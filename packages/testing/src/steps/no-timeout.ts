import { wrapPromise } from './common.js';
import type { Info, PromiseStep } from './types.js';

export function createPromiseStep<T>(src: Promise<T>): PromiseStep<T> {
    const { p } = wrapPromise<T, Info, PromiseStep<T>>(src, {});
    return p;
}
