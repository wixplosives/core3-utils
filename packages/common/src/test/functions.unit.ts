import chai, { expect } from 'chai';
import { delayed, enforceSequentialExecution, memoize, once } from '..';
import Sinon, { stub } from 'sinon';
import sinonChai from 'sinon-chai';
import { sleep } from 'promise-assist';
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

describe('enforceSequentialExecution', () => {
    let clock: Sinon.SinonFakeTimers;
    beforeEach(() => {
        clock = Sinon.useFakeTimers();
    });
    afterEach(() => clock.restore());
    it('executes calls AFTER the previous call was fulfilled', async () => {
        const results: number[] = [];
        const fn = enforceSequentialExecution(async (delay: number) => {
            results.push(delay);
            await sleep(delay);
            results.push(delay);
            return delay;
        });
        void fn(101);
        void fn(102);
        await clock.tickAsync(1);
        expect(results).to.eql([101]);
        await clock.tickAsync(101);
        expect(results).to.eql([101, 101, 102]);
        await clock.tickAsync(102);
        expect(results).to.eql([101, 101, 102, 102]);
    });
    it('resolves the returned promise with the returned value', async () => {
        const fn = enforceSequentialExecution(async (delay: number) => {
            await sleep(delay);
            return delay;
        });
        const r1 = fn(1);
        const r2 = fn(2);
        await clock.tickAsync(10);
        expect(await r1).to.equal(1);
        expect(await r2).to.equal(2);
    });
});

describe('delayed', () => {
    let clock: Sinon.SinonFakeTimers;
    beforeEach(() => {
        clock = Sinon.useFakeTimers();
    });
    afterEach(() => clock.restore());
    it('waits before executing subsequent calls', async () => {
        const results: number[] = [];
        const fn = delayed((id: number) => {
            results.push(id);
        }, 100);
        void fn(0);
        void fn(1);
        void fn(2);
        expect(results).to.eql([0]);
        await clock.tickAsync(10);
        expect(results).to.eql([0]);
        await clock.tickAsync(100);
        expect(results).to.eql([0, 1]);
        await clock.tickAsync(100);
        expect(results).to.eql([0, 1, 2]);
    });
    it('resolves the returned promise with the returned value', async () => {
        const fn = delayed((id: number) => id, 100);
        const r1 = fn(1);
        const r2 = fn(2);
        await clock.tickAsync(100);
        expect(await r1).to.equal(1);
        expect(await r2).to.equal(2);
    });
});

describe('memoize', () => {
    it('runs fn only once per given args', () => {
        let callCount = 0;
        const fn = (num: number) => {
            callCount++;
            return `${num}-${callCount}`;
        };
        const memoized = memoize(fn);
        expect(memoized(1)).to.equal('1-1');
        expect(memoized(1)).to.equal('1-1');
        expect(memoized(2)).to.equal('2-2');
        expect(memoized(2)).to.equal('2-2');
    });
    it('with a custom hash', () => {
        let callCount = 0;
        const fn = (num: number, ..._args: any[]) => {
            callCount++;
            return `${num}-${callCount}`;
        };
        const hashOnlyFirstArg = (args: any[]) => `${args[0]}`;
        const memoized = memoize(fn, hashOnlyFirstArg);
        expect(memoized(1, 1)).to.equal('1-1');
        expect(memoized(1, 2)).to.equal('1-1');
        expect(memoized(2, 1)).to.equal('2-2');
        expect(memoized(2, 2)).to.equal('2-2');
    });
    it('uses __cache property', () => {
        let callCount = 0;
        const fn = (num: number) => {
            callCount++;
            return `${num}-${callCount}`;
        };
        const memoized = memoize(fn);
        expect(memoized(1)).to.equal('1-1');
        memoized.__cache.clear();
        expect(memoized(1)).to.equal('1-2');
    });
});