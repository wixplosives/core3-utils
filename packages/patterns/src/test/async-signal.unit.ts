import chai, { expect } from 'chai';
import { AsyncSignal } from '../signal';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);
interface ChangeEvent {
    a: string;
    b: number;
}

describe('Async signal', () => {
    let signal: AsyncSignal<ChangeEvent>;
    let listener = stub();
    beforeEach(() => {
        signal = new AsyncSignal<ChangeEvent>();
        listener = stub();
    });
    it('should await async handlers', async () => {
        signal.subscribe(async () => {
            listener();
            await Promise.resolve().then(() => {
                listener();
            });
        });
        await signal.notify({ a: 'value', b: 5 });

        expect(listener.callCount, 'calls listener').to.eql(2);
    });
});
