import { forEach } from '@wixc3/common';
import { getCtxRoot, getMochaRunnables, _beforeEach, _before } from './mocha-helpers';
import { isDebugMode } from './debug-tests';

let currentMochaCtx: Mocha.Context | undefined;

/**
 * Active mocha context
 */
export function mochaCtx() {
    return currentMochaCtx;
}

/**
 * Add ms to current test timeout
 * @param allowTimeDilation when true (default) ms is multiplied by {@link timeDilation | timeDilation() }
 */
export function adjustTestTime(ms: number) {
    if (isDebugMode()) return 0;
    const ctx = mochaCtx();
    ctx?.timeout(ctx?.timeout() + ms);
    return ms;
}

/**
 * Creates a playwright locator options with timeout
 * and adjust the current test timeout accordingly
 */
export function locatorTimeout(ms = 10_000) {
    return { timeout: adjustTestTime(ms) };
}

function saveMochaCtx(this: Mocha.Context) {
    const root = getCtxRoot(this);
    forEach(getMochaRunnables(root), (rn) => {
        const fn = rn.fn as Mocha.AsyncFunc;
        rn.fn = function (this: Mocha.Context) {
            currentMochaCtx = rn.ctx || this;
            return fn.call(this);
        };
    });
}

_before('wrap mocha runnables to save ctx', saveMochaCtx);
