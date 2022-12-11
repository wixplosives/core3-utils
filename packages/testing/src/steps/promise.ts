import { RejectedError, StepError, TimeoutError } from './errors';
import type { PromiseWithTimeout } from './types';

export function createTimeoutStep<T>(
    src: Promise<T>,
    ctx: Mocha.Context,
    rejectAfterTimeout: boolean,
    timeDilation: number
): PromiseWithTimeout<T> {
    let timerId: number;
    const clearPromiseTimeout = () => clearTimeout(timerId)
    const {p,resolve,reject} = createTimeoutPromise(src, clearPromiseTimeout)

    p._parseInfoForErrorMessage = (info: any) => JSON.stringify(info, null, 2);
    p.info = { description: '', timeout: 0 };

    p.timeout = (ms: number, adjustToMachinePower = true) => {
        ms = adjustMochaTimeout<T>(adjustToMachinePower, ms, timeDilation, p, ctx);
        clearPromiseTimeout()
        timerId = setTimeout(() => {
            if (rejectAfterTimeout) {
                reject(new TimeoutError(p));
            } else {
                resolve(null as T);
            }
        }, ms);
        return p;
    };

    p.description = (_description: string) => {
        p.info.description = _description;
        return p;
    };

    return p;
}


function adjustMochaTimeout<T>(adjustToMachinePower: boolean, ms: number, timeDilation: number, p: PromiseWithTimeout<T>, ctx: Mocha.Context) {
    if (adjustToMachinePower) {
        ms = ms * timeDilation;
    }
    const diff = ms - p.info.timeout;
    p.info.timeout = ms;
    ctx.timeout(ctx.timeout() + diff);
    return ms;
}

function createTimeoutPromise<T>(src:Promise<T>, clearPromiseTimeout:()=>void){
    let resolve!: (value: T) => void;
    let reject!: (reason?: any) => void;

    const p = new Promise<T>((_resolve, _reject) => {
        resolve = (value:T)=>{
            clearPromiseTimeout()
            _resolve(value);
        }
        reject = (reason:any)=>{
            clearPromiseTimeout()
            _reject(reason instanceof StepError 
                ? reason 
                : new RejectedError(p, reason))
        }
        src.then(resolve, reject);
    }) as PromiseWithTimeout<T>;

    return {p, resolve, reject}
}