import { expect, use } from 'chai';
import asPromised from 'chai-as-promised';
import { defaults, poll, Expected } from '../steps';

use(asPromised);

describe('Expected', () => {
    it('includesDeep', async () => {
        defaults().poll.interval = 1;
        defaults().step.timeout = 50;
        await poll(() => [{}, { a: {} }], Expected.includesDeep({ a: {} }));
        await expect(poll(() => [{}, { a: {} }], Expected.includesDeep({ b: {} }))).to.eventually.rejectedWith(
            `expected [ {}, { a: {} } ] to deep include { b: {} }`
        );
    });
    it('includes', async () => {
        defaults().poll.interval = 1;
        defaults().step.timeout = 50;
        await poll(() => [1, 3], Expected.includes(1));
        await expect(poll(() => [{}, { a: {} }], Expected.includes({ a: {} }))).to.eventually.rejectedWith(
            `expected [ {}, { a: {} } ] to include { a: {} }`
        );
    });
    it('containsDeep', async () => {
        defaults().poll.interval = 1;
        defaults().step.timeout = 50;
        await poll(() => ({ a: { b: {} }, c: 4 }), Expected.containsSimilar({ a: { b: {} } }));
        await expect(
            poll(() => ({ a: { b: {} }, c: 4 }), Expected.containsSimilar({ b: {} }))
        ).to.eventually.rejectedWith(`expected { a: { b: {} }, c: 4 } to have deep property 'b'`);
        await expect(
            poll(() => ({ a: { b: {} }, c: 4 }), Expected.containsSimilar({ c: 0 }))
        ).to.eventually.rejectedWith(`expected { a: { b: {} }, c: 4 } to have deep property 'c' of +0, but got 4`);
    });
    it('contains', async () => {
        defaults().poll.interval = 1;
        defaults().step.timeout = 50;
        const instance = {};
        await poll(() => ({ a: instance, c: 4 }), Expected.contains({ a: instance }));
        await poll(() => ({ a: {}, c: 4 }), Expected.contains({ c: 4 }));
        await expect(poll(() => ({ a: {}, c: 4 }), Expected.contains({ a: {} }))).to.eventually.rejectedWith(
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
