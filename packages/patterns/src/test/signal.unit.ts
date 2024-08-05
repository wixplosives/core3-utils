import chai, { expect } from 'chai';
import { Signal } from '../signal';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);
interface ChangeEvent {
    a: string;
    b: number;
}
describe('Signal', () => {
    let signal: Signal<ChangeEvent>;
    let listener = stub();
    beforeEach(() => {
        signal = new Signal<ChangeEvent>();
        listener = stub();
    });
    it(`doesn't call listeners before "notify(...)"`, () => {
        signal.subscribe(listener);
        expect(listener.callCount, 'not calls before event dispatch').to.eql(0);
    });
    it('calls listeners after "notify(...)"', () => {
        signal.subscribe(listener);
        signal.notify({ a: 'value', b: 5 });

        expect(listener.callCount, 'calls listeners').to.eql(1);
        expect(listener.lastCall.args[0], 'event value').to.eql({ a: 'value', b: 5 });
    });
    it('ignores double subscriptions', () => {
        signal.subscribe(listener);
        signal.subscribe(listener);
        signal.subscribe(listener);

        signal.notify({ a: 'value', b: 5 });

        expect(listener.callCount, 'ignore double subscriptions').to.eql(1);
    });
    it('notifies handlers in the order they were subscribed', () => {
        const listener1 = stub();
        const listener2 = stub();
        const listener3 = stub();
        signal.subscribe(listener1);
        signal.once(listener2);
        signal.subscribe(listener3);
        signal.subscribe(listener1); // should have no effect
        signal.notify({ a: 'value', b: 5 });

        expect(listener1.calledBefore(listener2), 'listener1 called before listener2').to.eql(true);
        expect(listener2.calledBefore(listener3), 'listener2 called before listener3').to.eql(true);
    });
    describe('once', () => {
        it('calls "once" listeners only one time', () => {
            signal.once(listener);
            signal.notify({ a: 'value', b: 5 });
            signal.notify({ a: 'value', b: 6 });

            expect(listener.callCount, 'is called only once').to.eql(1);
            expect(listener.lastCall.args[0], 'with the first event').to.eql({ a: 'value', b: 5 });
        });
        it('ignores double "once" subscriptions', () => {
            signal.once(listener);
            signal.once(listener);
            signal.once(listener);

            signal.notify({ a: 'value', b: 5 });

            expect(listener.callCount, 'ignore double subscriptions').to.eql(1);
        });
        it(`doesn't call listeners after "unsubscribe"`, () => {
            signal.once(listener);
            signal.unsubscribe(listener);
            signal.notify({ a: 'value', b: 5 });
            expect(listener.callCount, 'no new calls after unsubscribe').to.eql(0);
        });
        it('throws when a handler changes from "once" to persistent', () => {
            signal.once(listener);
            expect(() => signal.subscribe(listener)).to.throw(`handler already exists as "once" listener`);
        });
        it('throws when a handler changes from persistent to "once"', () => {
            signal.subscribe(listener);
            expect(() => signal.once(listener)).to.throw(`handler already exists as persistent listener`);
        });
    });
    it(`doesn't call listeners after "unsubscribe"`, () => {
        signal.subscribe(listener);
        signal.unsubscribe(listener);
        signal.notify({ a: 'value', b: 5 });
        expect(listener.callCount, 'no new calls after unsubscribe').to.eql(0);
    });
    describe('clear', () => {
        it('removes all listeners', () => {
            signal.subscribe(listener);
            signal.clear();
            signal.notify({ a: 'value', b: 5 });
            expect(listener.callCount, 'no new calls after clear').to.eql(0);
        });
        it('removes all "once" listeners', () => {
            signal.once(listener);
            signal.clear();
            signal.notify({ a: 'value', b: 5 });
            expect(listener.callCount, 'no new calls after clear').to.eql(0);
        });
    });
});
