import { createDisposables } from '@wixc3/patterns';
import { mochaCtx } from './mocha-ctx';

/**
 * Creates a disposable group that will be disposed after the test is done
 * @param disposeHook mocha hook to dispose the group, defaults to "afterEach" passing "after" will dispose after all tests
 */

export function createTestDisposables(disposeHook = afterEach) {
    if (mochaCtx()?.currentTest) {
        throw new Error('createMochaDisposables must not be called inside a test only at describe or module');
    }
    const disposables = createDisposables();
    disposeHook('createTestDisposables', () => disposables.dispose());
    return disposables;
}
