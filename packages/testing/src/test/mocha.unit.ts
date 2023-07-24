import { expect } from 'chai';
import { adjustTestTime, mochaCtx } from '../mocha-ctx';

describe('adjustTestTime', () => {
    it('increases the running test timeout', function () {
        const originalTimeout = this.timeout();
        expect(adjustTestTime(100)).to.equal(100);
        expect(this.timeout()).to.equal(originalTimeout + 100);
    });
});

describe('mochaCtx', () => {
    it('returns the running test context', function () {
        expect(mochaCtx()).to.equal(this);
    });
});
