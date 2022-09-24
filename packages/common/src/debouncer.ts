// avoid including 'dom'/'node' libs
declare function clearTimeout(id:number):void;
declare function setTimeout(cb:Function, timeout:number, ...args:any[]):number;

export class Debouncer<T extends (...args: any[]) => any> {
    private timeout: number | undefined;
    private maxTimeout: number | undefined;
    constructor(
        private cb: T,
        private waitTime: number,
        private maxWaitTime: number,
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        private _setTimeout: (cb: () => void, wait: number) => number = (...args) => setTimeout(...args) as any,
        private _clearTimeout: (id: number) => void = (id) => clearTimeout(id)
    ) {}
    trigger(...args: Parameters<T>) {
        return new Promise<ReturnType<T>>((res, rej) => {
            if (this.timeout) {
                this._clearTimeout(this.timeout);
            }
            this.timeout = this._setTimeout(() => {
                try {
                    res(this.cb(...args));
                } catch (ex) {
                    rej(ex);
                }
                if (this.maxTimeout) {
                    this._clearTimeout(this.maxTimeout);
                }
            }, this.waitTime) as any;
            if (!this.maxTimeout) {
                this.maxTimeout = this._setTimeout(() => {
                    try {
                        res(this.cb(...args));
                    } catch (ex) {
                        rej(ex);
                    }
                    if (this.timeout) {
                        this._clearTimeout(this.timeout);
                    }
                }, this.maxWaitTime) as any;
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
