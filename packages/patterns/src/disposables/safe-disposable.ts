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

type OPTIONS = Partial<typeof DISPOSAL_GUARD_DEFAULTS>;
type GUARDED_FN_ASYNC<T> = () => Promise<T>;
type GUARDED_FN_SYNC<T> = () => T;
type GUARDED_FN<T> = GUARDED_FN_SYNC<T> | GUARDED_FN_ASYNC<T>;

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
 *         await this.disposables.guard(() =>{
 *              // do something
 *              await somePromise // if dispose is called while the code awaits, new guards will throw, but actual disposal will not begin
 *         })
 *         // disposal may begin
 *     } 
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
     *
     * @example
     * ```ts
     *  // this will throw if disposed
     *  this.guard(()=> {
     *      // do something
     *      // if dispose is called while the code executes,
     *      // new guards will throw, but actual disposal will not begin
     *  }, {timeout: 1000, name:'something'});
     *  // disposal may begin
     * ```
     */
    guard<T>(fn: GUARDED_FN_ASYNC<T>, options?: OPTIONS): Promise<T>;
    guard<T>(fn: GUARDED_FN_SYNC<T>, options?: OPTIONS): T;
    guard<_T>(options?: OPTIONS): void;
    // guard<T>(options?: OPTIONS): { [Symbol.dispose]: () => void };
    // @internal
    guard<T>(fnOrOptions?: OPTIONS | GUARDED_FN<T>, options?: OPTIONS) {
        const {
            fn,
            options: { name, timeout, usedWhileDisposing },
        } = extractArgs<T>(fnOrOptions, options);

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

        return executeCode(fn, done);

        /**
         * Support for the "using" keyword
         * uncomment when supported in browsers
         */
        // || { [Symbol.dispose]: done };
    }

    /**
     * a disposal safe setTimeout
     * checks disposal before execution and clears the timeout when the instance is disposed
     */
    setTimeout(fn: () => void, timeout: number): ReturnType<typeof setTimeout> {
        return this.guard(() => {
            const handle = setTimeout(() => {
                this.timeouts.delete(handle);
                if (!this.isDisposed) {
                    fn();
                }
            }, timeout);
            this.timeouts.add(handle);
            return handle;
        });
    }

    /**
     * a disposal safe setInterval
     * checks disposal before execution and clears the interval when the instance is disposed
     */
    setInterval(fn: () => void, interval: number): ReturnType<typeof setInterval> {
        return this.guard(() => {
            const handle = setInterval(() => {
                if (!this.isDisposed) {
                    fn();
                }
            }, interval);
            this.intervals.add(handle);
            return handle;
        });
    }

    /**
     * Support for the "using" keyword
     * uncomment when supported in browsers
     */
    // [Symbol.asyncDispose] = () => this.dispose();
}

function extractArgs<T>(fnOrOptions?: OPTIONS | GUARDED_FN<T>, options?: OPTIONS) {
    if (fnOrOptions instanceof Function) {
        return {
            fn: fnOrOptions,
            options: {
                ...DISPOSAL_GUARD_DEFAULTS,
                ...(options ?? {}),
            },
        };
    } else {
        return {
            fn: null,
            options: {
                ...DISPOSAL_GUARD_DEFAULTS,
                ...(fnOrOptions ?? {}),
            },
        };
    }
}

function executeCode<T>(fn: GUARDED_FN<T> | null, done: () => void) {
    let result: T | Promise<T>;
    if (fn) {
        try {
            result = fn();
            if (!(result instanceof Promise)) {
                done();
                return result;
            }
        } catch (e) {
            done();
            throw e;
        }

        return result.finally(done);
    }
    return done();
}
