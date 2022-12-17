import { createDisposables, Disposable } from '@wixc3/patterns';
import { _afterEach } from './mocha-helpers';

const disposables = createDisposables();

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
export function disposeAfter(disposable: Disposable) {
    disposables.add(disposable);
}

_afterEach('disposing', () => {
    return disposables.dispose();
});
