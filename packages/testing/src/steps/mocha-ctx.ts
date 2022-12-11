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
 * @param allowTimeDilation when true (default) ms is multiplied by {@link timeDilation | timeDilation() }
 */
export function adjustTestTime(ms:number, allowTimeDilation=true) {
    if (allowTimeDilation) {
        ms *= timeDilation()
    }
    mochaCtx().timeout(mochaCtx().timeout() + ms);
    return ms;
}

beforeEach('save current test context', function () {
    currentTest = this.currentTest!;
});