import { forEach } from '@wixc3/common';
import { getCtxRoot, getMochaRunnables, _beforeEach, _before } from './mocha-helpers';
import { isDebugMode } from './debug-tests';
import { scaleTimeout } from './timeouts';

let currentMochaCtx: Mocha.Context | undefined;

/**
 * Active mocha context
 */
export function mochaCtx() {
    return currentMochaCtx;
}

/**
 * Add ms to current test timeout
 */
export function adjustTestTime(ms: number) {
    if (isDebugMode()) return 0;
    const ctx = mochaCtx();
    ctx?.timeout(ctx?.timeout() + scaleTimeout(ms));
    return ms;
}

/**
 * Creates a playwright locator options with {@link scaleTimeout| scaled } timeout
 * and adjust the current test timeout accordingly
 */
export function locatorTimeout(ms = 10_000) {
    return { timeout: adjustTestTime(scaleTimeout(ms)) };
}

function saveMochaCtx(this: Mocha.Context) {
    const root = getCtxRoot(this);
    forEach(getMochaRunnables(root), (runnable) => {
        const fn = runnable.fn as Mocha.AsyncFunc;
        runnable.fn = function (this: Mocha.Context) {
            currentMochaCtx = runnable.ctx || this;
            return fn.call(this);
        };
    });
}

_before('wrap mocha runnables to save ctx', saveMochaCtx);
