export class Debouncer<T extends (...args: unknown[]) => unknown> {
    private timeout: number | undefined;
    private maxTimeout: number | undefined;
    constructor(
        private cb: T,
        private waitTime: number,
        private maxWaitTime: number,
        private _setTimeout: (cb: () => void, wait: number) => number = (...args) =>
            // eslint-disable-next-line 
            setTimeout(...args),
        private _clearTimeout: (id: number) => void = (id) =>
            // eslint-disable-next-line 
            clearTimeout(id)
    ) { }
    trigger(...args: Parameters<T>) {
        return new Promise<ReturnType<T>>((res, rej) => {
            if (this.timeout) {
                this._clearTimeout(this.timeout);
            }
            this.timeout = this._setTimeout(() => {
                try {
                    res(this.cb(...args) as ReturnType<T>);
                } catch (ex) {
                    rej(ex);
                }
                if (this.maxTimeout) {
                    this._clearTimeout(this.maxTimeout);
                }
            }, this.waitTime);
            if (!this.maxTimeout) {
                this.maxTimeout = this._setTimeout(() => {
                    try {
                        res(this.cb(...args) as ReturnType<T>);
                    } catch (ex) {
                        rej(ex);
                    }
                    if (this.timeout) {
                        this._clearTimeout(this.timeout);
                    }
                }, this.maxWaitTime);
            }
        });
    }
    cancel() {
        if (this.timeout) {
            this._clearTimeout(this.timeout);
        }
        if (this.maxTimeout) {
            this._clearTimeout(this.maxTimeout);
        }
    }
}
