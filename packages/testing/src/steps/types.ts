/**
 * Errors
 */
type Info = {description:string, timeout:number}
 type StepPromise<T extends Info=Info, R=any> = Promise<R> & {
    stack:string,
    info: T,
    _parseInfoForErrorMessage:(info:T)=>string
}

export class StepError<T extends Info> extends Error {
    constructor(message:string, p:StepPromise<T>, cause?:unknown) {
        super(message, {cause})
        this.info = p.info
        this.stack = p.stack || this.stack
    }
    info:T
}

export class TimeoutError<T extends Info> extends StepError<T> {
    constructor(p:StepPromise<T>) {
        super(`Timed out in step "${p.info.description}" after ${p.info.timeout}ms${p.info ? `\nInfo: ${p._parseInfoForErrorMessage(p.info)}` : ''}`, p)
    }
}

export class RejectedError<T extends Info> extends StepError<T>{
    constructor(p:StepPromise<T>, reason:any) {
        super( `Error in step "${p.info.description}"\ncause: ${
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            reason?.message || reason
        }\n${p.stack}`, p, reason)
    }
}

/**
 * PromiseWithTimeout
 */
export type Timeout<T> =
    (ms: number, adjustToMachinePower?: boolean)=> T;

    export type Description<T> = (description: string) => T;

export type PromiseWithTimeout<T> = StepPromise<Info, T> & {
    timeout: Timeout<PromiseWithTimeout<T>>;
    description: Description<PromiseWithTimeout<T>>;
    info: Info;
    stack: string;
};


/**
 * PollStep
 */
 export type PollStep<T> =  StepPromise<PollInfo, T> &  {
    timeout: Timeout<PollStep<T>>;
    description: Description<PollStep<T>>;
    interval: (ms: number) => PollStep<T>;
    allowErrors: (action?: boolean, predicate?: boolean) => PollStep<T>;
    stack: string;
    info: PollInfo
};
export type Stage = 'action'|'predicate'
export type AllowedErrors = {[_ in Stage]:boolean}
export interface PollInfo extends Info  {
    polledValues:({'action':any}|{'predicate':any})[];
    interval:number;
    timeout:number;
    allowErrors:AllowedErrors
}
export type Predicate<T> = (a: Awaited<T>) => boolean | Chai.Assertion | void;
