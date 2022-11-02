/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { expect } from 'chai';
import { spy, SinonFakeTimers, useFakeTimers, SinonSpy } from 'sinon';
import { Debouncer } from '../debouncer';

describe('Debounce', () => {
    let promises: Promise<any>[];
    let clock: SinonFakeTimers;
    let callback: SinonSpy;

    beforeEach(() => {
        promises = [];
        callback = spy();
        clock = useFakeTimers();
    });
    afterEach(async function () {
        this.timeout(100);
        clock.tick(100_000);
        clock.restore();
        await Promise.all(promises);
    });

    it('should delay call by requested timeout', () => {
        const throttle = new Debouncer(callback, 1, 100);
        promises.push(throttle.trigger());
        expect(callback).to.have.callCount(0);
        clock.tick(1);
        expect(callback).to.have.callCount(1);
    });
    it('should delay calls while there are calls coming, call cb only once', () => {
        const throttle = new Debouncer(callback, 2, 100);
        promises.push(throttle.trigger());
        clock.tick(1);
        promises.push(throttle.trigger());
        clock.tick(1);
        promises.push(throttle.trigger());
        clock.tick(1);
        promises.push(throttle.trigger());
        expect(callback).to.have.callCount(0);
        clock.tick(2);
        expect(callback).to.have.callCount(1);
    });
    it('if delaying call for more than max time, should trigger cb, go back to delaying', () => {
        const maxTimeout = 5;
        const throttle = new Debouncer(callback, 3, maxTimeout);
        for (let i = 0; i < maxTimeout + 1; i++) {
            promises.push(throttle.trigger());
            clock.tick(1);
        }
        expect(callback.callCount).to.equal(1);
        clock.tick(2);
        expect(callback.callCount).to.equal(2);
    });
    it(`passes the last trigger's arguments at waitTime`, () => {
        const throttle = new Debouncer(callback, 2, 6);
        promises.push(throttle.trigger(0));
        clock.tick(1);
        promises.push(throttle.trigger(1));
        expect(callback).to.have.callCount(0);
        clock.tick(1);
        clock.tick(1);
        expect(callback).to.have.been.calledOnceWith(1);
    });
    it(`passes the last trigger's arguments at maxWaitTime`, () => {
        const throttle = new Debouncer(callback, 2, 6);
        for (let i = 0; i < 6; i++) {
            clock.tick(1);
            promises.push(throttle.trigger(i));
        }
        expect(callback).to.have.callCount(0);
        clock.tick(1);
        expect(callback).to.have.been.calledOnceWith(5);
    });
});
