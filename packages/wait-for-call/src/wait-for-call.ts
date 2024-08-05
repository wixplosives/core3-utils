import { waitFor } from 'promise-assist';
import sinon from 'sinon';
import { expect } from 'chai';

export function createWaitForCall<F extends (...args: any[]) => any>(name?: string, f?: F) {
    let callNum = 1;
    const spy = f ? sinon.spy<F>(f) : sinon.spy();
    const addName = (message: string) => (name ? name + ' ' + message : message);
    return {
        waitForCall: async (
            cb: (...argsHistory: Parameters<F>[]) => void,
            message = addName(`waiting for call ${callNum}`),
        ) => {
            await waitFor(
                () => {
                    expect(spy.callCount, message).to.equal(callNum);
                },
                { timeout: 100 },
            );
            const argsHistory = [...spy.getCalls()].reverse().map<Parameters<F>>((call) => call.args as Parameters<F>);
            cb(...argsHistory);
            callNum++;
        },
        spy,
        expectCall: (cb: (...argsHistory: Parameters<F>[]) => void, message = addName(`expecting call ${callNum}`)) => {
            expect(spy.callCount, message).to.equal(callNum);
            const argsHistory = [...spy.getCalls()].reverse().map((call) => call.args as Parameters<F>);
            cb(...argsHistory);
            callNum++;
        },
    };
}
