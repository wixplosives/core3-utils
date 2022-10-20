import chai, { expect } from 'chai';
import { once } from '..';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
chai.use(sinonChai);

describe('once', () => {
    it('passes the call only once', () => {
        const fn = stub().returns(true);
        const onceFn = once(fn);
        expect(fn).to.not.have.been.called;
        expect(onceFn(1)).to.equal(true);
        expect(onceFn(2)).to.equal(true);
        expect(fn).to.have.callCount(1);
        expect(fn).to.have.been.calledWith(1);
    });
});
