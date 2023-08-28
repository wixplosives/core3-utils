import { timeout } from 'promise-assist';

/**
 * Disposables allow adding of disposal async functions,
 * when dispose is called, these functions will be run sequentially
 */
export class DisposablesGroup {
    private disposables = new Map<DisposableItem, NamedDisposable>();
    async dispose() {
        const _disposables = Array.from(this.disposables).reverse();
        this.disposables.clear();
        for (const [disposable, details] of _disposables) {
            await timeout(
                disposeOf(disposable),
                details.timeout,
                `Disposal timed out: "${details.name}" after ${details.timeout}ms`
            ).catch((e: Error) => {
                e.stack = `Error: ${e.message}${details.stack}`;
                throw e;
            });
        }
    }

    add(disposable: DisposableItem, timeout: number, name: string) {
        if (this.disposables.has(disposable)) {
            throw new Error(`Disposable already added`);
        }
        const [_0, _1, _2, ...userCode] = new Error().stack?.split(/\n\s+at\s+/) || ['No stacktrace :('];
        userCode.unshift('');
        const stack = userCode.join('\n    at ');

        this.disposables.set(disposable, { timeout, name, stack });
        return () => this.disposables.delete(disposable);
    }

    remove(target: DisposableItem): void {
        this.disposables.delete(target);
    }

    list() {
        return Array.from(this.disposables.values()).map((d) => ({ name: d.name, timeout: d.timeout }));
    }
}

export type DisposeFunction = () => unknown;
export type DisposableItem = { dispose: DisposeFunction } | DisposeFunction;

export type NamedDisposable = {
    timeout: number;
    name: string;
    stack: string;
};

async function disposeOf(dispose: DisposableItem) {
    if (typeof dispose === 'function') {
        await dispose();
    } else {
        await dispose.dispose();
    }
}
