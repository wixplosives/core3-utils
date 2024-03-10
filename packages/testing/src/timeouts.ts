import { isDebugMode } from './debug-tests';
import { mochaCtx } from './mocha-ctx';

const forcedTimeoutScale = new Map<Mocha.Context, number>();
const getTimeoutScale = () => {
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
 * overrides the TIMEOUT_SCALE for the current test
 * @param timeout
 */
export function overrideTimeoutScale(scale: number) {
    const ctx = mochaCtx();
    if (!ctx) {
        throw new Error('No mocha context');
    }
    forcedTimeoutScale.set(ctx, scale);
}