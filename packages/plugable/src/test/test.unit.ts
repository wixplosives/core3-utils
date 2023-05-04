import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { createPlugable, createKey, inheritPlugable, set, get, on, getThrow } from '../plugable';
chai.use(chaiAsPromised);

describe('Plugable', () => {
    it('set and get', () => {
        const rec = createPlugable();
        const key = createKey<string>();

        set(rec, key, 'hello');
        expect(get(rec, key)).to.equal('hello');
    });

    it('getThrow', () => {
        const rec = createPlugable();
        const key = createKey<string>();

        expect(() => {
            getThrow(rec, key);
        }).to.throw(`missing value for key`);

        set(rec, key, 'hello');
        expect(get(rec, key)).to.equal('hello');
    });

    it('emit on set', () => {
        const rec = createPlugable();
        const key = createKey<string>();
        const res = new Array<string>();

        on(rec, key, res.push.bind(res));
        set(rec, key, 'hello');

        expect(res[0]).to.equal('hello');
    });

    it('same value does not trigger event', () => {
        const rec = createPlugable();
        const key = createKey<string>();
        const res = new Array<string>();

        on(rec, key, res.push.bind(res));
        set(rec, key, 'hello');
        set(rec, key, 'hello');
        expect(res[0]).to.equal('hello');
        expect(res).to.have.length(1);
    });

    it('remove listener', () => {
        const rec = createPlugable();
        const key = createKey<string>();
        const res = new Array<string>();

        const off = on(rec, key, res.push.bind(res));
        set(rec, key, 'hello');
        off();
        set(rec, key, 'world');
        expect(res).to.have.length(1);
    });

    it('multiple listeners', () => {
        const rec = createPlugable();
        const key = createKey<string>();
        const resA = new Array<string>();
        const resB = new Array<string>();

        const offA = on(rec, key, resA.push.bind(resA));
        const offB = on(rec, key, resB.push.bind(resB));
        set(rec, key, 'hello');
        offA();
        set(rec, key, 'world');

        expect(resA).to.have.length(1);
        expect(resB).to.have.length(2);

        offB();

        set(rec, key, 'goodbye');

        expect(resA).to.have.length(1);
        expect(resB).to.have.length(2);
    });

    it('emit on child when set', () => {
        const parent = createPlugable();
        const child = inheritPlugable(parent);
        const key = createKey<string>();
        const res = new Array<string>();

        on(child, key, res.push.bind(res));
        set(child, key, 'hello');

        expect(res[0]).to.equal('hello');
    });

    it('child does not affect parent', () => {
        const parent = createPlugable();
        const child = inheritPlugable(parent);
        const key = createKey<string>();
        const res = new Array<string>();

        on(parent, key, res.push.bind(res));
        set(child, key, 'hello');

        expect(res).to.eql([]);
        expect(get(parent, key)).to.equal(undefined);
    });

    it('emit on child when set on parent (no child override)', () => {
        const parent = createPlugable();
        const child = inheritPlugable(parent);
        const key = createKey<string>();
        const res = new Array<string>();

        on(child, key, res.push.bind(res));
        set(parent, key, 'hello');

        expect(res[0]).to.equal('hello');
    });

    it('no emit on child when set on parent (when there is override)', () => {
        const parent = createPlugable();
        const child = inheritPlugable(parent);
        const key = createKey<string>();
        const res = new Array<string>();

        set(child, key, 'world');
        on(child, key, res.push.bind(res));
        set(parent, key, 'hello');

        expect(res).to.be.empty;
    });

    it('no emit on grandChild when set on parent (when there is override on child)', () => {
        const parent = createPlugable();
        const child = inheritPlugable(parent);
        const grandChild = inheritPlugable(child);
        const key = createKey<string>();
        const res = new Array<string>();

        set(child, key, 'world');
        on(grandChild, key, res.push.bind(res));
        set(parent, key, 'hello');

        expect(res).to.be.empty;

        const value = get(grandChild, key);
        expect(value).to.equal('world');
    });

    it('emit on grandChild when set on parent (when there is no override on child)', () => {
        const parent = createPlugable();
        const child = inheritPlugable(parent);
        const grandChild = inheritPlugable(child);
        const key = createKey<string>();
        const res = new Array<string>();

        on(grandChild, key, res.push.bind(res));
        set(parent, key, 'hello');

        expect(res[0]).to.equal('hello');
    });
});

describe('Plugable (prototype api)', () => {
    it('set and get and on', () => {
        const rec = createPlugable();
        const key = createKey<string>();
        const res = new Array<string>();

        rec.on(key, res.push.bind(res));
        rec.set(key, 'hello');
        expect(rec.get(key)).to.equal('hello');
        expect(res[0]).to.equal('hello');
    });
});
