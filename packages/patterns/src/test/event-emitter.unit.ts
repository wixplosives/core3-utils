import chai, { expect } from 'chai';
import { EventEmitter } from '../event-emitter.js';
import { spy } from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe('EventEmitter', () => {
    let emitter: EventEmitter<{ a: { data: number }; b: { data: string } }>;
    beforeEach(() => {
        emitter = new EventEmitter<{ a: { data: number }; b: { data: string } }>();
    });
    it('invoke event listeners', () => {
        const aHandler = spy();
        emitter.on('a', aHandler);
        emitter.on('b', aHandler);
        emitter.emit('a', { data: 0 });
        expect(aHandler).to.have.been.calledOnceWith({ data: 0 });
    });
    describe('off', () => {
        it('after off handler is not called', () => {
            const handler1 = spy();
            const handler2 = spy();
            emitter.on('a', handler1);
            emitter.off('a', handler1);
            emitter.once('a', handler2);
            emitter.off('a', handler2);
            emitter.emit('a', { data: 0 });
            expect(handler1).to.have.callCount(0);
            expect(handler1).to.have.callCount(0);
        });
        it('returned fn from on is same as off', () => {
            const handler1 = spy();
            const handler2 = spy();
            const off1 = emitter.on('a', handler1);
            off1();
            const off2 = emitter.once('a', handler2);
            off2();
            emitter.emit('a', { data: 0 });
            expect(handler1).to.have.callCount(0);
            expect(handler1).to.have.callCount(0);
        });
    });
    describe('once', () => {
        it('handler is called only once', () => {
            const aHandler = spy();
            emitter.once('a', aHandler);
            emitter.emit('a', { data: 0 });
            emitter.emit('a', { data: 1 });
            expect(aHandler).calledOnceWith({ data: 0 });
        });
    });
});
