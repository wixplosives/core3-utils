export function createDisposables() {
  const disposables = new Set<{dispose:() => unknown, blocking:boolean}>();

  return {
    async dispose() {
      const toDispose = Array.from(disposables).reverse();
      disposables.clear();
      for (const d of toDispose) {
        d.blocking ? await d.dispose() : d.dispose()        
      }
    },
    add(disposable: Disposable) {
      if (typeof disposable === 'function') {
        disposables.add({
          dispose: () => (disposable(), disposable.toString()),
          blocking: false
        });
      } else {
        disposables.add({
          dispose: () => (disposable.dispose(), disposable.id),
          blocking: false
        });
      }
    },
    addBlocking(disposable: Disposable) {
      if (typeof disposable === 'function') {
        disposables.add({
          dispose: disposable,
          blocking: true
        });
      } else {
        disposables.add({
          dispose: () => disposable.dispose(),
          blocking: true
        });
      }
    },
  };
}

export type DisposeFunction = () => unknown;
export type Disposable = { dispose: DisposeFunction, id: string } | DisposeFunction;
export type Disposables = ReturnType<typeof createDisposables>;
