import { forEach } from '@wixc3/common';
import { getCtxRoot, getMochaRunnables, _before } from './mocha-helpers';

let currentMochaCtx: Mocha.Context | undefined;

/**
 * Active mocha context
 */
export function mochaCtx() {
    return currentMochaCtx;
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
