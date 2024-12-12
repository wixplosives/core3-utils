import type { Info, StepBase } from './types.js';

/**
 * Generic error in a test step
 */
export class StepError<T extends Info> extends Error {
    constructor(message: string, p: StepBase<T>, cause?: unknown) {
        super(message, { cause });
        this.info = p.info;
        this.stack = p.stack || this.stack;
    }
    info: T;
}

/**
 * Step timeout error
 */
export class TimeoutError<T extends Info & { timeout: number }> extends StepError<T> {
    constructor(p: StepBase<T>) {
        super(
            `Timed out in step "${p.info.description}" after ${p.info.timeout}ms${
                p.info ? `\nInfo: ${p._parseInfoForErrorMessage(p.info)}` : ''
            }`,
            p,
        );
    }
}

/**
 * Step promise rejection
 */
export class RejectedError<T extends Info> extends StepError<T> {
    constructor(p: StepBase<T>, reason: any) {
        super(
            `Error in step "${p.info.description}"\ncause: ${
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                reason?.message || reason
            }\n${p.stack}`,
            p,
            reason,
        );
    }
}
