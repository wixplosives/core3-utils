import { isDebugMode } from './debug-tests';
import { mochaCtx } from './mocha-ctx';

const forcedTimeoutScale = new Map<Mocha.Context, number>();
/**
 * 
 * @returns the TIMEOUT_SCALE environment variable, or 1 if not set
 */
export function getTimeoutScale  ()  {
    const ctx = mochaCtx();
    if (ctx && forcedTimeoutScale.has(ctx)) {
        return forcedTimeoutScale.get(ctx)!;
    }

    const multiplierEnv = (globalThis as { process?: { env: { TIMEOUT_SCALE?: string } } })?.process?.env
        ?.TIMEOUT_SCALE;
    const multiplier = parseFloat(multiplierEnv || '1');

    if (multiplier <= 0 || isNaN(multiplier)) {
        throw new Error(`Invalid TIMEOUT_SCALE: "${multiplierEnv}" (must be a positive number)
        To disable timeouts, use DEBUG=1`);
    }

    return multiplier;
};

if (getTimeoutScale() !== 1) {
    // eslint-disable-next-line no-console
    console.log(`Timeout scaling: ${getTimeoutScale()}`);
}

/**
 * Scales a timeout based on the TIMEOUT_SCALE and DEBUG environment variable
 * @param timeout
 * @returns 0 in debug mode, or timeout * TIMEOUT_SCALE
 */
export function scaleTimeout(timeout: number) {
    if (isDebugMode()) {
        return 0;
    }
    return timeout * getTimeoutScale();
}

/**
 * Overrides the TIMEOUT_SCALE for the current test
 * @param timeout
 */
export function overrideTimeoutScale(scale: number) {
    const ctx = mochaCtx();
    if (!ctx) {
        throw new Error('No mocha context');
    }
    forcedTimeoutScale.set(ctx, scale);
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

/**
 * Manipulates the default timeouts for tests
 */
if (!isDebugMode() && getTimeoutScale() !== 1) {
    beforeEach('wrap mocha runnables to save ctx', function () {
        this.currentTest?.timeout(this.currentTest?.timeout() *  getTimeoutScale());
    });
}