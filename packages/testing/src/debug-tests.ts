import { mochaCtx } from './mocha-ctx';
const getDebug = () => {
    const debug = (globalThis as { process?: { env: { DEBUG?: string } } })?.process?.env?.DEBUG;
    return debug === 'true' || parseInt(debug || '0') > 0;
};

if (getDebug()) {
    // eslint-disable-next-line no-console
    console.log('Testing in debug mode');
}

if (getDebug()) {
    beforeEach('wrap mocha runnables to save ctx', function () {
        this.currentTest?.timeout(0);
    });
}

const forcedDebugModes = new Map<Mocha.Context, boolean>();

/**
 *
 * @returns true if DEBUG=positive int/true or mocha is running in debug mode
 */
export function isDebugMode() {
    const ctx = mochaCtx();
    if (ctx && forcedDebugModes.has(ctx)) {
        return forcedDebugModes.get(ctx);
    }
    return getDebug() || mochaCtx()?.timeout() === 0;
}

/**
 * override the DEBUG environment variable for the current test
 * @param value
 */
export function overrideDebugMode(value: boolean) {
    const ctx = mochaCtx();
    if (!ctx) {
        throw new Error('No mocha context');
    }
    forcedDebugModes.set(ctx, value);
}