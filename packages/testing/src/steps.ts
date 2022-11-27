import { timeout } from 'promise-assist';

/**
 * A test step
 * @see runSteps
 */
export type Step<T = unknown> = {
    timeout: number;
    description: string;
    action: Promise<T>;
};

/**
 * Step creator
 * @see runSteps
 */
export function step<T>(action: Promise<T>, timeout = 1000, description = 'none'): Step {
    return {
        action,
        timeout,
        description,
    };
}

/**
 *
 * @param steps a steps generator function
 * Creates a test that runs each yielded step with its own timeout and description
 *
 * @example
 * ```ts (runSteps)
 *  it('runs the steps', runSteps(function*(){
 *      expect(yield step(Promise.resolve(1), 10, "prep")).to.equal(1)
 *      expect(yield step(fetchServerData(), 100, "get data from server")).to.equal("server data")
 *  }))
 * ```
 */
export function runSteps(steps: () => Generator<Step, any, any>): (this: Mocha.Context) => Promise<void> {
    return async function () {
        const gen = steps();
        let val;
        let next: IteratorResult<Step<unknown>, any>;
        do {
            next = gen.next(val);
            if (!next.done) {
                const s: Step = next.value;
                val = await timeout(s.action, s.timeout, `Failed in step "${s.description}" after ${s.timeout}ms`);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return next.value;
            }
        } while (!next.done);
    };
}
