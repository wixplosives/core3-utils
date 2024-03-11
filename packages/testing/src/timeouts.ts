import { mochaCtx } from './mocha-ctx';

const getDebug = () => {
    const debug = (globalThis as { process?: { env: { DEBUG?: string } } })?.process?.env?.DEBUG;
    return debug === 'true' || parseInt(debug || '0') > 0;
};

if (getDebug()) {
    // eslint-disable-next-line no-console
    console.log('Testing in debug mode');
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

const forcedTimeoutScale = new Map<Mocha.Context, number>();
/**
 *
 * @returns the TIMEOUT_MULTIPLIER environment variable, or 1 if not set
 */
export function getTimeoutScale() {
    const ctx = mochaCtx();
    if (ctx && forcedTimeoutScale.has(ctx)) {
        return forcedTimeoutScale.get(ctx)!;
    }

    const multiplierEnv = (globalThis as { process?: { env: { TIMEOUT_MULTIPLIER?: string } } })?.process?.env
        ?.TIMEOUT_MULTIPLIER;
    const multiplier = parseFloat(multiplierEnv || '1');

    if (multiplier <= 0 || isNaN(multiplier)) {
        throw new Error(`Invalid TIMEOUT_MULTIPLIER: "${multiplierEnv}" (must be a positive number)
        To disable timeouts, use DEBUG=1`);
    }

    return multiplier;
}

if (getTimeoutScale() !== 1) {
    // eslint-disable-next-line no-console
    console.log(`Timeout scaling: ${getTimeoutScale()}`);
}

/**
 * Scales a timeout based on the TIMEOUT_MULTIPLIER and DEBUG environment variable
 * @param timeout
 * @returns 0 in debug mode, or timeout * TIMEOUT_MULTIPLIER
 */
export function scaleTimeout(timeout: number) {
    if (isDebugMode()) {
        return 0;
    }
    return timeout * getTimeoutScale();
}

/**
 * Overrides the TIMEOUT_MULTIPLIER for the current test
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
 * Adjust tests timeouts based on DEBUG and TIMEOUT_MULTIPLIER environment variables
 */
export function adjustTestsTimeouts() {
    beforeEach(`adjust test timeout to env: DEBUG & TIMEOUT_MULTIPLIER `, function () {
        if (isDebugMode()) {
            this.timeout(0);
        } else {
            this.timeout(this.timeout() * getTimeoutScale());
        }
    });
}
