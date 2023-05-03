import { createNodeFs } from '@file-services/node';
import { expect } from 'chai';
import { waitForPath } from '../path-step';
import { createTestDir } from '../temp-test-dir';

describe('waitForPath', () => {
    const fs = createNodeFs();

    it('resolves when the predicate is satisfied', async () => {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        const path = createTestDir();
        const file = fs.join(path, 'file.tmp');
        const step = waitForPath(file, ({ stats }) => {
            expect(stats).not.to.be.null;
        });
        fs.writeFileSync(file, 'create');
        return step;
    });
});
