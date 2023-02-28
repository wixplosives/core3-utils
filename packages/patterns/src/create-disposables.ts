/**
 * Disposables allow adding of disposal async functions,
 * when dispose is called, these functions will be run sequentially
 */
export function createDisposables() {
    const disposables = new Set<Disposable>();

    return {
        async dispose() {
            const toDispose = Array.from(disposables).reverse();
            disposables.clear();
            for (const dispose of toDispose) {
                if (typeof dispose === 'function') {
                    await dispose();
                } else {
                    await dispose.dispose();
                }
            }
        },
        add(disposable: Disposable) {
            disposables.add(disposable);
        },
        remove(disposable: Disposable) {
            disposables.delete(disposable);
        },
    };
}

export type DisposeFunction = () => unknown;
export type Disposable = { dispose: DisposeFunction } | DisposeFunction;
export type Disposables = ReturnType<typeof createDisposables>;
