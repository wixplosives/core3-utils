import { deferred } from 'promise-assist';
/**
 * Cancelable debouncing of calls to trigger

 * @example <caption>waitTime</caption>
 * ```ts
 * const debounced = new Debouncer(a => console.log(a), 1, 100)
 * debounce.trigger('first')
 * debounce.trigger('second')
 * // after 1ms
 * // => 'second'
 * ```
 * @example <caption>maxWaitTime</caption>
 * ```ts
 * const debounced = new Debouncer(a => console.log(a), 3, 4)
 * debounce.trigger('first')
 * // after 1ms
 * debounce.trigger('second')
 * // after 1ms
 * // => 'second'
 * debounce.trigger('third')
 * // after 2ms, 4ms elapsed since the first trigger
 * // => 'third'
 * ```
 */
export class Debouncer<T extends (...args: any[]) => any> {
    private timeout: number | undefined;
    private maxTimeout: number | undefined;
    private args = [] as any as Parameters<T>;
    private defer = deferred<ReturnType<T>>();
    /**
     *
     * @param cb - trigger callback
     * @param waitTime - time to wait before invoking cb
     * @param maxWaitTime - maximum wait time from first triggering
     */
    constructor(
        private cb: T,
        private waitTime: number,
        private maxWaitTime: number,
    ) {}

    private execute() {
        try {
            const result = this.cb(...this.args) as ReturnType<T>;
            this.defer.resolve(result);
        } catch (ex) {
            this.defer.reject(ex);
        }
        this.defer = deferred();
    }

    /**
     *
     * @param args - arguments to pass to cb
     * @returns Promised resolved with cb return value
     */
    trigger(...args: Parameters<T>) {
        this.args = args;

        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.execute();
            if (this.maxTimeout) {
                clearTimeout(this.maxTimeout);
            }
        }, this.waitTime);
        if (!this.maxTimeout) {
            this.maxTimeout = setTimeout(() => {
                this.execute();
                if (this.timeout) {
                    clearTimeout(this.timeout);
                }
            }, this.maxWaitTime);
        }
        return this.defer.promise;
    }
    /**
     * Cancels pending invocation of cb
     * @example
     * ```ts
     * const debounced = new Debouncer(a => console.log(a), 3, 4)
     * debounce.trigger('first')
     * debounce.cancel()
     * // console.log will not be invoked
     * ```
     */
    cancel() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (this.maxTimeout) {
            clearTimeout(this.maxTimeout);
        }
    }
}
