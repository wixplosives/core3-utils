import { createTempDirectorySync } from 'create-temp-directory';
import { createDisposalGroup, disposeAfter as disposeAfterTest, DEFAULT_DISPOSAL_GROUP } from '@wixc3/testing';
import fs from '@file-services/node';
import { DisposableOptions } from '@wixc3/patterns';
import { retry } from 'promise-assist';
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
export function createTestDir(
    prefix?: string | undefined,
    disposalOptions: DisposableOptions | string = DISPOSE_OF_TEMP_DIRS,
    disposeAfter = disposeAfterTest
) {
    const dir = createTempDirectorySync(prefix);

    if (typeof disposalOptions === 'string') {
        disposalOptions = {
            group: disposalOptions,
        };
    }

    disposeAfter(() => retry(() => dir.remove(), { retries: Number.POSITIVE_INFINITY, delay: 100 }), {
        group: DISPOSE_OF_TEMP_DIRS,
        name: `removing test dir: ${dir.path}`,
        timeout: 2_000,
        ...disposalOptions,
    });
    return fs.realpathSync.native(dir.path);
}
