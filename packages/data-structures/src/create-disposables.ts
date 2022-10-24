/**
 * Disposables allow adding of disposal async functions,
 * when dispose is called, these functions will be run sequentially
 */
export function createDisposables() {
    const disposables = new Set<() => unknown>();

    return {
        async dispose() {
            const toDispose = Array.from(disposables).reverse();
            disposables.clear();
            for (const dispose of toDispose) {
                await dispose();
            }
        },
        add(disposable: Disposable) {
            if (typeof disposable === 'function') {
                disposables.add(disposable);
            } else {
                disposables.add(() => disposable.dispose());
            }
        },
    };
}

export type DisposeFunction = () => unknown;
export type Disposable = { dispose: DisposeFunction } | DisposeFunction;
export type Disposables = ReturnType<typeof createDisposables>;
