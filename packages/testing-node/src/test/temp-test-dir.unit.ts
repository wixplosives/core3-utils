import fs from '@file-services/node';
import { expect } from 'chai';
import { createTestDir } from '../temp-test-dir';

describe('createTestDir', () => {
    let dirPath: string;
    it('creates a temporary directory', () => {
        dirPath = createTestDir('test');
        expect(fs.statSync(dirPath, { throwIfNoEntry: true }).isDirectory()).to.equal(true);
    });
    it('deletes the temporary directory', () => {
        expect(fs.existsSync(dirPath)).to.equal(false);
    });
});
