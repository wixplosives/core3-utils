import { errorWithTrace } from '@wixc3/common';
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
            try {
                await timeout(disposeOf(disposable), details.timeout, message(details));
            } catch (e) {
                if ((e as Error).message === message(details)) {
                    throw errorWithTrace(message(details), details.trace);
                }
                throw errorWithTrace(`Disposal failed: "${details.name}"`, details.trace, {
                    cause: e,
                });
            }
        }
    }

    add(disposable: DisposableItem, timeout: number, name: string, trace: string) {
        if (this.disposables.has(disposable)) {
            throw new Error(`Disposable already added`);
        }
        this.disposables.set(disposable, { timeout, name, trace });
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
    trace: string;
};

function message(details: NamedDisposable): string {
    return `Disposal timed out: "${details.name}" after ${details.timeout}ms`;
}

async function disposeOf(dispose: DisposableItem) {
    if (typeof dispose === 'function') {
        await dispose();
    } else {
        await dispose.dispose();
    }
}
