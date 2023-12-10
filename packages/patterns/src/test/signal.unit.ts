import chai, { expect } from 'chai';
import { Signal } from '../signal';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
    });
    it(`doesn't call listeners after "unsubscribe"`, () => {
        signal.subscribe(listener);
        signal.unsubscribe(listener);
        signal.notify({ a: 'value', b: 5 });
        expect(listener.callCount, 'no new calls after unsubscribe').to.eql(0);
    });
    it(`doesn't call listeners after unsubscribing using subscribe return value`, () => {
        const unsubscribe = signal.subscribe(listener);
        unsubscribe();
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
