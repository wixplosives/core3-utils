import chai, { expect } from 'chai';
import { Signal } from '../signal';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
chai.use(sinonChai);

describe('Signal', () => {
    it('should subscribe to accept events and unsubscribe to stop accepting event', () => {
        interface ChangeEvent {
            a: string;
            b: number;
        }
        const signal = new Signal<ChangeEvent>();
        const onChange = stub();

        signal.subscribe(onChange);

        expect(onChange.callCount, 'not calls before event dispatch').to.eql(0);

        signal.notify({ a: 'value', b: 5 });

        expect(onChange.callCount, 'not calls before event dispatch').to.eql(1);
        expect(onChange.lastCall.args[0], 'event value').to.eql({ a: 'value', b: 5 });

        signal.unsubscribe(onChange);

        signal.notify({ a: 'other-value', b: 10 });

        expect(onChange.callCount, 'no new calls after unsubscribe').to.eql(1);
    });
});
