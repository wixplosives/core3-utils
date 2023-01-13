import { Path, waitForPath } from '../steps';
import { createTestDir } from '../temp-test-dir';
import fs from '@file-services/node';
import { expect, use } from 'chai';
import asPromised from 'chai-as-promised';
use(asPromised);

describe('createTestDir', () => {
    let dir: string;
    it('creates a temporary directory', async () => {
        dir = await createTestDir('test');
        await waitForPath(fs, dir, Path.isDir());
    });
    it('deletes the temporary directory', async () => {
        await waitForPath(fs, dir, Path.notExists());
    });
    it('throws when windows is defined', async () => {
        // @ts-expect-error fake window
        globalThis.window = {};
        await expect(createTestDir('test')).to.be.rejectedWith('createTestDir is not supported in browser');
    });
});
