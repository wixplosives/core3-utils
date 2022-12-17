import { setFirstHook, _beforeEach } from './mocha-helpers';
import { timeDilation } from './time-dilation';

let currentTest: Mocha.Test;

/**
 * Active mocha context
 */
export function mochaCtx(): Mocha.Context|undefined {
    return currentTest.ctx;
}

/**
 * Add ms to current test timeout
 * @param allowTimeDilation when true (default) ms is multiplied by {@link timeDilation | timeDilation() }
 */
export function adjustTestTime(ms: number, allowTimeDilation = true) {
    if (allowTimeDilation) {
        ms *= timeDilation();
    }
    const ctx = mochaCtx()
    ctx?.timeout(ctx?.timeout() + ms);
    return ms;
}

/**
 * Creates a playwright locator options with timeout 
 * and adjust the current test timeout accordingly
 */
export function locatorTimeout(ms=1_000) {
    return {timeout:adjustTestTime(ms)}
}

function saveMochaCtx(this: Mocha.Context) {
    currentTest = this.currentTest!;
}

_beforeEach('save current test context', saveMochaCtx);
setFirstHook(saveMochaCtx);
