import { timeout as _timeout } from 'promise-assist';

export function createDisposables() {
  const disposables = new Set<{
    disposable: Disposable, timeout: number, trace?: string
  }>();

  return {
    async dispose() {
      const toDispose = Array.from(disposables).reverse();
      disposables.clear();
      for (const { disposable, timeout, trace } of toDispose) {
        await _timeout(Promise.resolve(disposable.dispose()),
          timeout,
          `Timeout disposing of ${disposable.id}\n\t at ${trace || '<no trace>'}`)
      }
    },

    add(disposable: Disposable | DisposeFunction, timeout = 5000) {
      if (typeof disposable === 'function') {
        disposables.add({
          disposable: {
            dispose: () => disposable(),
            id: disposable.toString()
          },
          timeout,
          trace: new Error().stack
        });
      } else {
        disposables.add({
          disposable,
          timeout,
          trace: new Error().stack
        });
      }
    }
  };
}

export type DisposeFunction = () => unknown;
export type Disposable = { dispose: DisposeFunction, id: string }
