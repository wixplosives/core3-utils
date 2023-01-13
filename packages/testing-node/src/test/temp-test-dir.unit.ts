import { Path, waitForPath } from '..';
import { createTestDir } from '../temp-test-dir';

describe('createTestDir', () => {
    let dir: string;
    it('creates a temporary directory', async () => {
        dir = createTestDir('test');
        await waitForPath(dir, Path.isDir());
    });
    it('deletes the temporary directory', async () => {
        await waitForPath(dir, Path.notExists());
    });
});
