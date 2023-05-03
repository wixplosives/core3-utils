import { expect } from 'chai';
import { sleep } from 'promise-assist';
import { poll } from '../';

describe('polling when mocha timeout=0', function () {
    this.timeout(0);

    it('when the predicate passes, fulfils the poll promise', async () => {
        let predicateResult = false;
        setTimeout(() => (predicateResult = true), 50);

        let resolved = false;
        void poll(() => predicateResult, true).then(() => (resolved = true));
        await sleep(150);
        expect(resolved).to.equal(true);
    });
});
