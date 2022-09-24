const _process = (globalThis as any)['process'];
const _navigator = (globalThis as any)['navigator'];
const platform = _process?.platform;

export const isMac = platform ? platform === 'darwin' : _navigator?.platform.includes('Mac');
export const isWindows = platform ? platform === 'win32' : _navigator?.platform.includes('Win32');
export const isElectronRendererProcess = typeof _process === 'object' && (_process as any).type === 'renderer';
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
