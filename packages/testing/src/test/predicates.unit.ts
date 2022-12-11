import { createNodeFs } from '@file-services/node';
import type { IFileSystem } from '@file-services/types';
import { expect, use } from 'chai';
import asPromised from 'chai-as-promised';
import { createTempDirectorySync } from 'create-temp-directory';
import { defaults, poll, Expected, disposeAfter, Path, waitForPath } from '..';

use(asPromised);

describe('Expected', () => {
    it('includes', async () => {
        defaults().poll.interval = 1;
        defaults().step.timeout = 50;
        await poll(() => [{}, { a: {} }], Expected.includes({ a: {} }));
        await expect(poll(() => [{}, { a: {} }], Expected.includes({ b: {} }))).to.eventually.rejectedWith(
            `expected [ {}, { a: {} } ] to deep include { b: {} }`
        );
    });
    it('includesStrict', async () => {
        defaults().poll.interval = 1;
        defaults().step.timeout = 50;
        await poll(() => [1, 3], Expected.includesStrict(1));
        await expect(poll(() => [{}, { a: {} }], Expected.includesStrict({ a: {} }))).to.eventually.rejectedWith(
            `expected [ {}, { a: {} } ] to include { a: {} }`
        );
    });
    it('containsDeep', async () => {
        defaults().poll.interval = 1;
        defaults().step.timeout = 50;
        await poll(() => ({ a: { b: {} }, c: 4 }), Expected.contains({ a: { b: {} } }));
        await expect(poll(() => ({ a: { b: {} }, c: 4 }), Expected.contains({ b: {} }))).to.eventually.rejectedWith(
            `expected { a: { b: {} }, c: 4 } to have deep property 'b'`
        );
        await expect(poll(() => ({ a: { b: {} }, c: 4 }), Expected.contains({ c: 0 }))).to.eventually.rejectedWith(
            `expected { a: { b: {} }, c: 4 } to have deep property 'c' of +0, but got 4`
        );
    });
    it('contains', async () => {
        defaults().poll.interval = 1;
        defaults().step.timeout = 50;
        const instance = {};
        await poll(() => ({ a: instance, c: 4 }), Expected.containsStrict({ a: instance }));
        await poll(() => ({ a: {}, c: 4 }), Expected.containsStrict({ c: 4 }));
        await expect(poll(() => ({ a: {}, c: 4 }), Expected.containsStrict({ a: {} }))).to.eventually.rejectedWith(
            `expected { a: {}, c: 4 } to have property 'a' of {}, but got {}`
        );
    });
    it('size', async () => {
        defaults().poll.interval = 1;
        defaults().step.timeout = 50;
        await poll(() => [], Expected.size(0));
        await expect(poll(() => [1], Expected.size(0))).to.eventually.rejectedWith('expected 1 to equal +0');
    });
});

describe('Path', ()=>{
    let tempDir:string
    , file:string
    , fs:IFileSystem
    
    beforeEach(()=>{
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const {path:_path, remove} = createTempDirectorySync()
        tempDir = _path
         fs = createNodeFs();
        file = fs.join(tempDir, 'file.tmp' )
        disposeAfter(remove)
        defaults().poll.interval = 10
        defaults().step.timeout = 200
    })

    it('exists', async () => {
        await expect(waitForPath(fs, file , Path.exists())).to.eventually.be.rejectedWith(`Timed out`)
        const step = waitForPath(fs, file , Path.exists())
        fs.writeFileSync(file, 'created')
        return step
    });

    it('isFile', async () => {
        fs.writeFileSync(file, 'created')
        await expect(waitForPath(fs, fs.join(tempDir, 'missing') , Path.isFile())).to.eventually.be.rejectedWith(`Timed out`)
        await expect(waitForPath(fs, tempDir , Path.isFile())).to.eventually.be.rejectedWith(`Timed out`)
        await waitForPath(fs, file , Path.isFile())
    });
   
    it('isDir', async () => {
        fs.writeFileSync(file, 'created')
        await expect(waitForPath(fs, fs.join(tempDir, 'missing') , Path.isDir())).to.eventually.be.rejectedWith(`Timed out`)
        await expect(waitForPath(fs, file , Path.isDir())).to.eventually.be.rejectedWith(`Timed out`)
        await waitForPath(fs, tempDir , Path.isDir())
    });
    
    it('isFileWithContent', async () => {
        await expect(waitForPath(fs, file , Path.hasContent('missing'))).to.eventually.be.rejectedWith(`Timed out`)
        await expect(waitForPath(fs, file , Path.hasContent('wrong'))).to.eventually.be.rejectedWith(`Timed out`)
        const step = waitForPath(fs, file , Path.hasContent('success'))
        fs.writeFileSync(file, 'success')
        return step
    });
})
