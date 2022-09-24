import { expect } from 'chai';
import sinon from 'sinon';
import { Debouncer, reportError } from '..';

describe('Debounce', () => {
    class MockTimeout {
        private counter = 0;
        private cbCounter = 0;
        private cbMap: Map<number, { cb: () => void; time: number }> = new Map();
        setTimeout = (cb: () => void, wait: number) => {
            this.cbCounter++;
            this.cbMap.set(this.cbCounter, {
                cb,
                time: this.counter + wait,
            });
            return this.cbCounter;
        };
        clearTimeOut = (id: number) => {
            this.cbMap.delete(id);
        };
        tick(num = 1) {
            this.counter += num;
            for (const [id, { cb, time }] of this.cbMap.entries()) {
                if (this.counter === time) {
                    cb();
                    this.cbMap.delete(id);
                }
            }
        }
    }

    it('should delay call by requested timeout', () => {
        const spy = sinon.spy();
        const timeoutMock = new MockTimeout();
        const throttle = new Debouncer(spy, 1, 100, timeoutMock.setTimeout, timeoutMock.clearTimeOut);
        throttle.trigger().catch(reportError);
        expect(spy).to.have.not.been.called;
        timeoutMock.tick();
        expect(spy.callCount).to.equal(1);
    });
    it('should delay calls while there are calls coming, call cb only once', () => {
        const spy = sinon.spy();
        const timeoutMock = new MockTimeout();
        const throttle = new Debouncer(spy, 2, 100, timeoutMock.setTimeout, timeoutMock.clearTimeOut);
        throttle.trigger().catch(reportError);
        timeoutMock.tick();
        throttle.trigger().catch(reportError);
        timeoutMock.tick();
        throttle.trigger().catch(reportError);
        timeoutMock.tick();
        throttle.trigger().catch(reportError);
        expect(spy).to.have.not.been.called;
        timeoutMock.tick(2);
        expect(spy.callCount).to.equal(1);
    });
    it('if delaying call for more than max time, should trigger cb, go back to delaying', () => {
        const spy = sinon.spy();
        const timeoutMock = new MockTimeout();
        const throttle = new Debouncer(spy, 2, 6, timeoutMock.setTimeout, timeoutMock.clearTimeOut);
        for (let i = 0; i < 6; i++) {
            timeoutMock.tick();
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            throttle.trigger();
        }
        expect(spy).to.have.not.been.called;
        timeoutMock.tick();
        expect(spy.callCount).to.equal(1);
        for (let i = 0; i < 3; i++) {
            timeoutMock.tick();
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            throttle.trigger();
        }
        expect(spy.callCount).to.equal(1);
    });
});
