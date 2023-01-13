import fs from '@file-services/node';
import { defaults } from '@wixc3/testing';
import { expect, use } from 'chai';
import asPromised from 'chai-as-promised';
import { createTestDir, Path, waitForPath } from '..';

use(asPromised);

describe('Path', () => {
    let tempDir: string, file: string;

    beforeEach(() => {
        tempDir = createTestDir();
        file = fs.join(tempDir, 'file.tmp');
        defaults().poll.interval = 10;
        defaults().step.timeout = 200;
    });

    it('exists', async () => {
        await expect(waitForPath(file, Path.exists())).to.eventually.be.rejectedWith(`Timed out`);
        const step = waitForPath(file, Path.exists());
        fs.writeFileSync(file, 'created');
        await step;
    });

    it('notExists', async () => {
        await waitForPath(file, Path.notExists());
        fs.writeFileSync(file, 'created');
        await expect(waitForPath(file, Path.notExists())).to.eventually.be.rejectedWith(`Timed out`);
    });

    it('isFile', async () => {
        fs.writeFileSync(file, 'created');
        await expect(waitForPath(fs.join(tempDir, 'missing'), Path.isFile())).to.eventually.be.rejectedWith(
            `Timed out`
        );
        await expect(waitForPath(tempDir, Path.isFile())).to.eventually.be.rejectedWith(`Timed out`);
        await waitForPath(file, Path.isFile());
    });

    it('isDir', async () => {
        fs.writeFileSync(file, 'created');
        await expect(waitForPath(fs.join(tempDir, 'missing'), Path.isDir())).to.eventually.be.rejectedWith(`Timed out`);
        await expect(waitForPath(file, Path.isDir())).to.eventually.be.rejectedWith(`Timed out`);
        await waitForPath(tempDir, Path.isDir());
    });

    it('isFileWithContent', async () => {
        await expect(waitForPath(file, Path.hasContent('missing'))).to.eventually.be.rejectedWith(`Timed out`);
        await expect(waitForPath(file, Path.hasContent('wrong'))).to.eventually.be.rejectedWith(`Timed out`);
        const step = waitForPath(file, Path.hasContent('success'));
        fs.writeFileSync(file, 'success');
        await step;
    });
});
