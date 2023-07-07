import { timeout } from 'promise-assist';

/**
 * Disposables allow adding of disposal async functions,
 * when dispose is called, these functions will be run sequentially
 */
export function createSimpleDisposable() {
    return new Disposables();
}

export class Disposables {
    private disposables = new Map<Disposable, NamedDisposable>();
    async dispose() {
        const _disposables = Array.from(this.disposables).reverse();
        this.disposables.clear();
        for (const [disposable, details] of _disposables) {
            await timeout(
                disposeOf(disposable),
                details.timeout,
                `Disposal timed out: "${details.name}" after ${details.timeout}ms`
            );
        }
    }

    add(disposable: Disposable, timeout: number, name: string) {
        if (this.disposables.has(disposable)) {
            throw new Error(`Disposable already added`);
        }
        this.disposables.set(disposable, { timeout, name });
        return () => this.disposables.delete(disposable);
    }

    remove(target: Disposable): void {
        this.disposables.delete(target);
    }

    list() {
        return Array.from(this.disposables.values()).map((d) => ({ name: d.name, timeout: d.timeout }));
    }
}

export type DisposeFunction = () => unknown;
export type Disposable = { dispose: DisposeFunction } | DisposeFunction;

export type NamedDisposable = {
    timeout: number;
    name: string;
};

async function disposeOf(dispose: Disposable) {
    if (typeof dispose === 'function') {
        await dispose();
    } else {
        await dispose.dispose();
    }
}
