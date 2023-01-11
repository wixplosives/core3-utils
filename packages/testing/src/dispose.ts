import { createDisposables, Disposable, Disposables } from '@wixc3/patterns';
import { _afterEach } from './mocha-helpers';

const disposables: Disposables[] = [];

export const NORMAL = 10;
export const BEFORE = 5;
export const AFTER = 15;
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
export function disposeAfter(disposable: Disposable, group = NORMAL) {
    if (group < 0 || group !== (group | 0)) {
        throw new Error(`Invalid disposal group ${group}, must be a non negative integer`);
    }
    const _disposables = disposables[group] || createDisposables();
    _disposables.add(disposable);
    disposables[group] = _disposables;
}

_afterEach('disposing', async () => {
    for (const disposable of disposables) {
        await disposable?.dispose();
    }
});
