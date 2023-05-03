import { wrapPromise } from './common';
import type { Info, PromiseStep } from './types';

export function createPromiseStep<T>(src: Promise<T>): PromiseStep<T> {
    const { p } = wrapPromise<T, Info, PromiseStep<T>>(src, {});
    return p;
}
