import { defaults, noop } from '@wixc3/common';
import { deferred } from 'promise-assist';
import { Disposables } from './create-disposables.js';

const DELAY_DISPOSAL = 'DELAY_DISPOSAL';
const DISPOSAL_GUARD_DEFAULTS = {
    name: 'disposalGuard',
    timeout: 5_000,
    usedWhileDisposing: false,
};
/**
 * @deprecated
 * A base class for disposable objects
 * @example
 * ```ts
 * class MyDisposable extends Disposable {
 *    constructor() {
 *       super();
 *       this.disposables.add(() => console.log('disposed'));
 *       this.setTimeout(() => console.log('will be canceled upon disposal'), 1000);
 *    }
 *    async doSomething() {
 *      // will throw if disposed, delays disposal until done is called
 *      const done = this.disposalGuard(false, true);
 *      try {
 *         // do something
 *      } finally {
 *        // disposal can begin (if dispose was called)
 *        done();
 *      }
 *    }
 * }
 */
export class Disposable {
    private _isDisposed = false;
    private _isDisposing = false;
    public readonly disposables: Disposables;
    private timeouts = new Set<ReturnType<typeof setTimeout>>();
    private intervals = new Set<ReturnType<typeof setInterval>>();
    constructor(name?: string) {
        this.disposables = new Disposables(name ?? this.constructor.name);
        this.disposables.registerGroup(DELAY_DISPOSAL, { before: 'default' });
        this.disposables.add('dispose timeouts and intervals', () => {
            this.timeouts.forEach((t) => clearTimeout(t));
            this.intervals.forEach((i) => clearInterval(i));
        });
    }

    /**
     * Starts instance disposal:
     *
     * **phase 1: disposing**
     * - isDisposed === true
     * - disposalGuard() will throw
     * - disposalGuard(true) will not throw (for methods that are used in the disposal process)
     * - disposable.dispose is awaited
     *
     * **phase 2: disposed done**
     * - disposalGuard(true) will throw
     */
    async dispose() {
        if (!this.isDisposed && !this._isDisposing) {
            this._isDisposing = true;
            await this.disposables.dispose();
            this._isDisposed = true;
            this._isDisposing = false;
        }
    }

    /**
     * returns true if the disposal process started
     */
    get isDisposed(): boolean {
        return this._isDisposed || this._isDisposing;
    }

    /**
     * - throws if disposal started/finished
     * - in async mode, delays disposal until the returned fn called
     * @example async mode
     * ```ts
     *  // this will throw if disposed
     * const done = this.disposalGuard({timeout: 1000, name:'something'});
     * try {
     *    // do something
     * } finally {
     *    // disposal can begin (if dispose was called)
     *    done();
     * }
     * @example sync mode
     * ```ts
     *  // will throw if disposed
     * this.disposalGuard({async:false});
     * @example usedWhileDisposing
     * ```ts
     *  // will not throw if disposal didn't finished yet, even if dispose was called
     * this.disposalGuard({usedWhileDisposing:true, async:false});
     */
    disposalGuard(
        options: {
            async: never;
        } & Partial<typeof DISPOSAL_GUARD_DEFAULTS>,
    ): () => void;
    disposalGuard(): () => void;
    disposalGuard(options: { async: false; usedWhileDisposing?: boolean }): void;
    disposalGuard(options?: { async?: boolean } & Partial<typeof DISPOSAL_GUARD_DEFAULTS>) {
        const { async, usedWhileDisposing, name, timeout } = defaults(options || {}, {
            ...DISPOSAL_GUARD_DEFAULTS,
            async: true,
        });

        if (this.isDisposed && !(this._isDisposing && usedWhileDisposing)) {
            throw new Error('Instance was disposed');
        }
        if (async) {
            const { promise: canDispose, resolve: done } = deferred();
            const remove = this.disposables.add({
                group: DELAY_DISPOSAL,
                name,
                timeout,
                dispose: () => canDispose,
            });
            canDispose.then(remove).catch(noop);
            return done;
        }
        return;
    }

    /**
     * a disposal safe setTimeout
     * checks disposal before execution and clears the timeout when the instance is disposed
     */
    setTimeout(fn: () => void, timeout: number): ReturnType<typeof setTimeout> {
        this.disposalGuard({ async: false });
        const handle = globalThis.setTimeout(() => {
            this.timeouts.delete(handle);
            if (!this.isDisposed) {
                fn();
            }
        }, timeout);
        this.timeouts.add(handle);
        return handle;
    }

    /**
     * a disposal safe setInterval
     * checks disposal before execution and clears the interval when the instance is disposed
     */
    setInterval(fn: () => void, interval: number): ReturnType<typeof setInterval> {
        this.disposalGuard({ async: false });
        const handle = globalThis.setInterval(() => {
            if (!this.isDisposed) {
                fn();
            }
        }, interval);
        this.intervals.add(handle);
        return handle;
    }
}
