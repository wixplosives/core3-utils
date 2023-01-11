import { createTempDirectorySync } from 'create-temp-directory';
import { disposeAfter } from './dispose';

/**
 * Creates a test temporary directory
 * The directory will be deleted after the test, thus not suitable for suites ("describe")
 * @returns temp directory path
 */
export function createTestDir(prefix?: string | undefined) {
    const dir = createTempDirectorySync(prefix);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    disposeAfter(dir.remove);
    return dir.path;
}
