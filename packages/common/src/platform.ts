// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const _process: { type?: string; platform?: string } = (globalThis as any)['process'];
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const _navigator: { platform: string } = (globalThis as any)['navigator'];
const platform: string | undefined = _process?.platform;

export const isMac = platform ? platform === 'darwin' : _navigator?.platform.includes('Mac');
export const isWindows = platform ? platform === 'win32' : _navigator?.platform.includes('Win32');
export const isElectronRendererProcess = typeof _process === 'object' && _process?.type === 'renderer';
export const getOs = () => {
    if (platform) {
        return platform;
    }

    /** Normilizes return value to nodejs output */
    if (_navigator?.platform.includes('Mac')) {
        return 'darwin';
    }
    if (_navigator?.platform.includes('Win')) {
        return 'win32';
    }
    if (_navigator?.platform.includes('Linux')) {
        return 'linux';
    }

    return _navigator?.platform;
};
