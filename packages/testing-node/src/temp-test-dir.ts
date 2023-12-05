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
    disposalOptions?: string | Omit<DisposableOptions, 'dispose'>,
    disposeAfter = disposeAfterTest
) {
    const dir = createTempDirectorySync(prefix);
    const isOptions = typeof disposalOptions !== 'string';

    // we don't want to allow empty strings as ids or group names hence the "||"
    const group = (isOptions ? disposalOptions?.group : disposalOptions) || DISPOSE_OF_TEMP_DIRS;
    const id = (isOptions ? disposalOptions?.name : undefined) || `creating test dir: ${dir.path}`;
    // on numbers we can accept 0 as a valid timeout
    const timeout = (isOptions ? disposalOptions?.timeout : undefined) ?? 2_000;

    disposeAfter(() => retry(() => dir.remove(), { retries: Number.POSITIVE_INFINITY, delay: 100 }), {
        name: id,
        group,
        timeout,
    });
    return fs.realpathSync.native(dir.path);
}
