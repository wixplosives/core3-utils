import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { createPlugable, createKey, inheritPlugable, set, get, on } from '../plugable';
chai.use(chaiAsPromised);

describe('Plugable', () => {
  it('set and get', () => {
    const rec = createPlugable();
    const key = createKey<string>();

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

  it('emit on child when set', () => {
    const parent = createPlugable();
    const child = inheritPlugable(parent);
    const key = createKey<string>();
    const res = new Array<string>();

    on(child, key, res.push.bind(res));
    set(child, key, 'hello');

    expect(res[0]).to.equal('hello');
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
