import { noop } from '@wixc3/common';
import { createDisposables } from '.';
import { deferred } from 'promise-assist';

const DELAY_DISPOSAL = 'DELAY_DISPOSAL';

/**
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
    public readonly disposables = createDisposables();
    private timeouts = new Set<ReturnType<typeof setTimeout>>();
    private intervals = new Set<ReturnType<typeof setInterval>>();
    constructor() {
        this.disposables.registerGroup(DELAY_DISPOSAL, { before: 'default' });
        this.disposables.add(() => {
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
     * throws if disposal started/finished
     * @param usedWhileDisposing when true, only throws if disposal is finished
     * @param asyncGuard when true, returns a done function. <i>this</i> will not be disposed done is called
     */
    disposalGuard(): void;
    disposalGuard(usedWhileDisposing: boolean, asyncGuard: true): () => void;
    disposalGuard(usedWhileDisposing = false, asyncGuard = false) {
        if (this.isDisposed && !(this._isDisposing && usedWhileDisposing)) {
            throw new Error('Instance was disposed');
        }
        if (asyncGuard) {
            const { promise: canDispose, resolve: done } = deferred();
            const remove = this.disposables.add(() => canDispose, {
                group: DELAY_DISPOSAL,
                name: 'disposalGuard',
                timeout: 5_000,
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
        this.disposalGuard();
        const handle = setTimeout(() => {
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
        this.disposalGuard();
        const handle = setInterval(() => {
            if (!this.isDisposed) {
                fn();
            }
        }, interval);
        this.intervals.add(handle);
        return handle;
    }
}
