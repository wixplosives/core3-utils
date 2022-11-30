import { createDisposables } from '@wixc3/patterns';

const disposables = createDisposables();

// eslint-disable-next-line @typescript-eslint/unbound-method
export const disposeAfter = disposables.add

afterEach('disposing', () => {
    return disposables.dispose();
});
