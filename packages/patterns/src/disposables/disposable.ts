import { find } from '@wixc3/common';
import { timeout } from 'promise-assist';

/**
 * Disposables allow adding of disposal async functions,
 * when dispose is called, these functions will be run sequentially
 */
export function createSimpleDisposable() {
    return new Disposables();
}

export class Disposables {
    private disposables = new Map<string, NamedDisposable>();
    async dispose() {
        const _disposables = Array.from(this.disposables.values()).reverse();
        this.disposables.clear();
        for (const disposable of _disposables) {
            await timeout(
                disposeOf(disposable),
                disposable.timeout,
                `Disposal timed out: "${disposable.name}" after ${disposable.timeout}ms`
            );
        }
    }

    add(disposable: Disposable, timeout: number, name: string) {
        if (this.disposables.has(name)) {
            throw new Error(`Disposable with name "${name}" already exists`);
        }
        this.disposables.set(name, { dispose: disposable, timeout, name });
    }

    remove(disposable: Disposable): void;
    remove(name: string): void;
    remove(target: string | Disposable): void {
        const name =
            typeof target === 'string' ? target : find(this.disposables, ([_, d]) => d.dispose === target)?.[0];
        if (!name) {
            throw new Error(`Disposable not found`);
        }
        if (!this.disposables.has(name)) {
            throw new Error(`Disposable with name "${name}" not found`);
        }
        this.disposables.delete(name);
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
    dispose: Disposable;
};

async function disposeOf({ dispose }: NamedDisposable) {
    if (typeof dispose === 'function') {
        await dispose();
    } else {
        await dispose.dispose();
    }
}
