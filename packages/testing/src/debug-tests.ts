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

/**
 *
 * @returns true if DEBUG=positive int/true or mocha is running in debug mode
 */
export function isDebugMode() {
    return getDebug() || mochaCtx()?.timeout() === 0;
}
