import { expect } from 'chai';
import { adjustTestTime, mochaCtx } from '../mocha-ctx';
import { timeDilation } from '../time-dilation';

describe('adjustTestTime', () => {
    let dilation: number;
    beforeEach(() => (dilation = timeDilation()));
    afterEach(() => timeDilation(dilation));

    it('increases the running test timeout', function () {
        const originalTimeout = this.timeout();
        expect(adjustTestTime(100, false)).to.equal(100);
        expect(this.timeout()).to.equal(originalTimeout + 100);
    });
    it('dilates time by default', function () {
        timeDilation(10);
        const originalTimeout = this.timeout();
        expect(adjustTestTime(100)).to.equal(1000);
        expect(this.timeout()).to.equal(originalTimeout + 1000);
    });
});

describe('mochaCtx', () => {
    it('returns the running test context', function () {
        expect(mochaCtx()).to.equal(this);
    });
});
