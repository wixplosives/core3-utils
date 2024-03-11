import { expect } from 'chai';
import { mochaCtx } from '../mocha-ctx';
import { adjustCurrentTestTimeout, overrideDebugMode } from '../timeouts';

describe('adjustTestTime', () => {
    it('increases the running test timeout', function () {
        overrideDebugMode(false);
        const originalTimeout = this.timeout();
        expect(adjustCurrentTestTimeout(100)).to.equal(100);
        expect(this.timeout()).to.equal(originalTimeout + 100);
    });
});

describe('mochaCtx', () => {
    it('returns the running test context', function () {
        expect(mochaCtx()).to.equal(this);
    });
});
