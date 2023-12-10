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

        expect(listener.callCount, 'not calls before event dispatch').to.eql(1);
        expect(listener.lastCall.args[0], 'event value').to.eql({ a: 'value', b: 5 });
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
});
