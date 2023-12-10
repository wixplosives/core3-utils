import { Disposables } from '.';
import { deferred } from 'promise-assist';

export type IDisposable = {
    dispose: () => unknown;
};

const DELAY_DISPOSAL = 'unreleased disposal guard - did you forget to use "using _ = this.guard()"?';
const DISPOSAL_GUARD_DEFAULTS = {
    name: 'unsafe execution: instance was disposed',
    timeout: 5_000,
    usedWhileDisposing: false,
};
/**
 * Adds dispose-safe methods to Disposables:
 *  
 *  - setInterval/setTimeout
 *  - guard
 * @example
 * ```ts
 * export class MyDisposable implements IDisposable {
 *     private disposables = new SafeDisposable(MyDisposable.name)
 *     dispose: () => Promise<void>;
 *
 *     constructor() {
 *         this.disposables.add('log', () => console.log('disposed'));
 *         this.disposables.setTimeout(() => console.log('will be canceled upon disposal'), 1000);
 *         this.dispose = () => this.disposables.dispose()
 *     }
 *
 *     async doSomething() {
 *         // will throw if disposed, delays disposal until done is called
 *         using _ = this.disposables.guard()
 *         await somePromise // if dispose is called while the code awaits, new guards will throw, but actual disposal will not begin
 *     } // after the method exists, disposal may begin
 * }
 * ```
 */
export class SafeDisposable extends Disposables implements IDisposable {
    private _isDisposed = false;
    private _isDisposing = false;
    private timeouts = new Set<ReturnType<typeof setTimeout>>();
    private intervals = new Set<ReturnType<typeof setInterval>>();
    constructor(name: string) {
        super(name);
        this.registerGroup(DELAY_DISPOSAL, { before: 'default' });
        this.add('dispose timeouts and intervals', () => {
            this.timeouts.forEach((t) => clearTimeout(t));
            this.intervals.forEach((i) => clearInterval(i));
        });
    }

    /**
     * Starts instance disposal:
     *
     * **phase 1: disposing**
     * - isDisposed === true
     * - guard() // will throw
     * - guard({usedWhileDisposing:true}) // will not throw (for methods that are used in the disposal process)
     * - all guards are awaited
     * - disposable.dispose is awaited
     *
     * **phase 2: disposed done**
     * - guard({usedWhileDisposing:true}) // will throw
     */
    override async dispose() {
        if (!this.isDisposed && !this._isDisposing) {
            this._isDisposing = true;
            await super.dispose();
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
     * After disposal starts, it's necessary to avoid executing some code. `guard` is used for those cases.
     *
     * <b>for example:</b> after fileRemover.dispose(), fileRemover.remove() should throw.
     *
     * `guard` will:
     *
     * - throws if disposal started/finished
     * - delays disposal actual until the current flow is done
     * @example with "using" keyword
     * ```ts
     * {
     *      // this will throw if disposed
     *      using _ = this.guard({timeout: 1000, name:'something'});
     *      // do something
     * }
     * // disposal may begin
     * ```
     *
     * @example without THE "using" keyword
     * ```ts
     *  // this will throw if disposed
     * const done = this.guard({timeout: 1000, name:'something'});
     * try {
     *    // do something
     * } finally {
     *    // disposal can begin (if dispose was called)
     *    done();
     *    // disposal may begin
     * }
     * ```
     */
    guard(options?: Partial<typeof DISPOSAL_GUARD_DEFAULTS>) {
        const { usedWhileDisposing, name, timeout } = {
            ...DISPOSAL_GUARD_DEFAULTS,
            ...(options ?? {}),
        };

        if (this.isDisposed && !(this._isDisposing && usedWhileDisposing)) {
            throw new Error('Instance was disposed');
        }
        const { promise: canDispose, resolve: done } = deferred();
        const removeGuard = this.add({
            group: DELAY_DISPOSAL,
            name,
            timeout,
            dispose: () => canDispose,
        });
        canDispose.then(removeGuard, removeGuard);

        return Object.assign(done, { [Symbol.dispose]: done });
    }

    /**
     * a disposal safe setTimeout
     * checks disposal before execution and clears the timeout when the instance is disposed
     */
    setTimeout(fn: () => void, timeout: number): ReturnType<typeof setTimeout> {
        using _ = this.guard();
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
        using _ = this.guard();
        const handle = setInterval(() => {
            if (!this.isDisposed) {
                fn();
            }
        }, interval);
        this.intervals.add(handle);
        return handle;
    }
}
