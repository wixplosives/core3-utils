import { expect, use } from 'chai';
import asPromised from 'chai-as-promised';
import { defaults, poll, expectIncludes, expectIncludesDeep, expectSize } from '../steps';

use(asPromised);

describe('predicates', () => {
    it('expectIncludesDeep', async () => {
        defaults().poll.interval = 1;
        defaults().step.timeout = 50;
        await poll(() => ({ a: { b: {} } }), expectIncludesDeep({ a: { b: {} } }));
        await expect(poll(() => ({ a: { b: {} } }), expectIncludesDeep({ c: {} }))).to.eventually.rejectedWith(
            "expected { a: { b: {} } } to have deep property 'c'"
        );
    });
    it('expectIncludes', async () => {
        defaults().poll.interval = 1;
        defaults().step.timeout = 50;
        await poll(() => [1, 3], expectIncludes(1));
        await expect(poll(() => ({ a: { b: {} } }), expectIncludesDeep({ c: {} }))).to.eventually.rejectedWith(
            "expected { a: { b: {} } } to have deep property 'c'"
        );
    });
    it('expectSize', async () => {
        defaults().poll.interval = 1;
        defaults().step.timeout = 50;
        await poll(() => [], expectSize(0));
        await expect(poll(() => [1], expectSize(0))).to.eventually.rejectedWith('expected 1 to equal +0');
    });
});
