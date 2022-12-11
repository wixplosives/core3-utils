import { timeDilation } from "./time-dilation";

let currentTest: Mocha.Test;

/**
 * Active mocha context
 */
 export function mochaCtx(): Mocha.Context {
    if (!currentTest?.ctx) {
        throw new Error(`Invalid use of the testing package: no mocha test context`);
    }
    return currentTest.ctx;
}

/**
 * Add ms to current test timeout
 */
export function adjustTestTime(ms:number, allowTimeDilation=true) {
    mochaCtx().timeout(mochaCtx().timeout() + ms * (allowTimeDilation ? timeDilation() :1));
    return ms;
}

beforeEach('save current test context', function () {
    currentTest = this.currentTest!;
});