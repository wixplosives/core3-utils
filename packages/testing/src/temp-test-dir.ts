import { createTempDirectorySync } from 'create-temp-directory';
import { DisposalGroups } from './disposal-group';
import { createDisposalGroup, disposeAfter } from './dispose';

export const DISPOSE_OF_TEMP_DIRS = 'DISPOSE_OF_TEMP_DIRS';
createDisposalGroup(DISPOSE_OF_TEMP_DIRS, { after: DisposalGroups.DEFAULT_GROUP });

/**
 * Creates a test temporary directory
 * The directory will be deleted after the test, thus not suitable for suites ("describe")
 * @returns temp directory path
 */
export function createTestDir(prefix?: string | undefined, disposalGroup = DISPOSE_OF_TEMP_DIRS) {
    const dir = createTempDirectorySync(prefix);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    disposeAfter(dir.remove, disposalGroup);
    return dir.path;
}
