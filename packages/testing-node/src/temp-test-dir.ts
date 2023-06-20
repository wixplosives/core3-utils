import { createTempDirectorySync } from 'create-temp-directory';
import { createDisposalGroup, disposeAfter, DEFAULT_DISPOSAL_GROUP } from '@wixc3/testing';
import fs from '@file-services/node';
export const DISPOSE_OF_TEMP_DIRS = 'DISPOSE_OF_TEMP_DIRS';
try {
    createDisposalGroup(DISPOSE_OF_TEMP_DIRS, { after: DEFAULT_DISPOSAL_GROUP });
} catch {
    // eslint-disable-next-line no-console
    console.warn('DISPOSE_OF_TEMP_DIRS disposal group already exists');
}

/**
 * Creates a test temporary directory
 * The directory will be deleted after the test, thus not suitable for suites ("describe")
 * @returns temp directory path
 */
export function createTestDir(prefix?: string | undefined, disposalGroup = DISPOSE_OF_TEMP_DIRS) {
    const dir = createTempDirectorySync(prefix);
    disposeAfter(() => dir.remove(), { group: disposalGroup });
    return fs.realpathSync.native(dir.path);
}
