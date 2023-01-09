import { createDisposables, Disposable } from '@wixc3/patterns';
import { _afterEach } from './mocha-helpers';

const disposables = {
    first: createDisposables(),
    normal: createDisposables(),
    last: createDisposables(),
} as const;

type BUCKET = keyof typeof disposables;

/**
 * Disposes of test resources after the test is done
 * @example
 * ```ts
 * it('test', () => {
 *      const listener = () =>{}
 *      someService.on('event', listener)
 *      disposeAfter(() => someService.off('event', listener))
 * })
 * ```
 */
export function disposeAfter(disposable: Disposable, bucket: BUCKET = 'normal') {
    disposables[bucket].add(disposable);
}

_afterEach('disposing', async () => {
    await disposables['first'].dispose();
    await disposables['normal'].dispose();
    await disposables['last'].dispose();
});
