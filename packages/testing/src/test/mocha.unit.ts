import { expect } from 'chai';
import { adjustTestTime, mochaCtx } from '../mocha-ctx';
import { isDebugMode } from '../debug-tests';

describe('adjustTestTime', () => {
    it('increases the running test timeout', function () {
        if (isDebugMode()) {
            // in DEBUG mode retry won't throw
            return this.skip();
        }
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
