import { disposeAfter, waitForPath } from '..';
import { createNodeFs } from '@file-services/node';
import { expect } from 'chai';
import { createTempDirectorySync } from 'create-temp-directory';

describe('waitForPath', () => {
    it('resolved immediately when predicate is satisfied', async () => {
        const fs = createNodeFs();
        await waitForPath(fs, 'path', () => true).timeout(10);
    });

    it('resolves when the predicate is satisfied', async () => {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const {path, remove} = createTempDirectorySync()
        disposeAfter(remove)
        const fs = createNodeFs();
        const file = fs.join(path, 'file.tmp' )
        const step = waitForPath(fs, file , ({stats}) => {
            expect(stats).not.to.be.null
        })
        fs.writeFileSync(file, 'create')
        return step
    });
});
