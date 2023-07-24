import { mochaCtx } from './mocha-ctx';
import { timeDilation } from './time-dilation';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const debug = (globalThis as { process?: { env: { DEBUG?: string } } })?.process?.env?.DEBUG;
if (debug === 'true' || parseInt(debug || '0') > 0) {
    // eslint-disable-next-line no-console
    console.log('Testing in debug mode');
    timeDilation(Number.POSITIVE_INFINITY);
    (globalThis as { mocha?: Mocha })?.mocha?.timeout(Number.POSITIVE_INFINITY);
}

export function isDebugMode() {
    return debug || mochaCtx()?.timeout() === 0;
}
