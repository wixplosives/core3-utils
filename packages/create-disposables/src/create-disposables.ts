export function createDisposables() {
  const disposables = new Set<{
    disposable: Disposable, timeout: number
  }>();

  return {
    async dispose() {
      const toDispose = Array.from(disposables).reverse();
      disposables.clear();
      for (const { disposable, timeout } of toDispose) {
        const start = performance.now()
        await disposable.dispose()
        const duration = performance.now() - start
        if (duration > timeout) {
          throw new Error(`Timeout disposing of ${disposable.id}`)
        }
      }
    },

    add(disposable: Disposable | DisposeFunction, timeout = 5000) {
      if (typeof disposable === 'function') {
        disposables.add({
          disposable: {
            dispose: () => disposable(),
            id: disposable.toString()
          },
          timeout
        });
      } else {
        disposables.add({
          disposable,
          timeout
        });
      }
    }
  };
};

export type DisposeFunction = () => unknown;
export type Disposable = { dispose: DisposeFunction, id: string }
