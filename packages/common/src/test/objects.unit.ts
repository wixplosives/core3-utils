import { expect } from 'chai';
import { defaults, isPlainObject, pick, remap } from '../objects';

describe('pick', () => {
    it('pick specified keys from an object', () => {
        expect(pick({ a: 1, b: 2 }, ['a', 'b'])).to.eql({ a: 1, b: 2 });
        expect(pick({ a: 1, b: 2 }, ['a'])).to.eql({ a: 1 });
        expect(pick({ a: 1, b: 2 }, [])).to.eql({});
    });
});

describe(`defaults`, () => {
    it(`merges to POJOs`, () => {
        expect(defaults({ a: 0, b: 1 }, { a: 1, b: 2, c: 3 })).to.eql({ a: 0, b: 1, c: 3 })
    })
    it(`deep=true (default)`, () => {
        expect(defaults({ a: { a: 10, b: 20 } }, { a: { a: 20, c: 30 } })).to.eql({ a: { a: 10, b: 20, c: 30 } })
    })
    it(`deep=false`, () => {
        expect(defaults({ a: { a: 10 } }, { a: { b: 20 } }, false)).to.eql({ a: { a: 10 } })
    })
    it(`shouldUseDefault arg`, () => {
        expect(defaults({ a: { a: 10, b: 20 } }, { a: { a: 20, c: 30 } }, true, i => i === 10)).to.eql({ a: { a: 20, b: 20, c: 30 } })
        expect(defaults({ a: { a: 10, b: 20 } }, { a: { a: 20, c: 30 } }, true, (_, key) => key === 'a.a')).to.eql({ a: { a: 20, b: 20, c: 30 } })
    })
})

describe('remap', () => {
    it('changes given keys', () => {
        const input = { a: 0, b: 1 };
        const output: { c: number, b: number } = remap(input, { a: 'c' })
        expect(output).to.eql({ c: 0, b: 1 })
    })
    it('removes keys mapped to remap.DELETE', () => {
        const input = { a: 0, b: 1 };
        const output: { b: number } = remap(input, { a: remap.DELETE })
        expect(output).to.eql({ b: 1 })
    })
})

describe('isPlainObject', () => {
    it('returns true for POJO', () => {
        class A { }
        expect(isPlainObject({})).to.be.true
        expect(isPlainObject(null)).to.be.false
        expect(isPlainObject(undefined)).to.be.false
        expect(isPlainObject(new A())).to.be.false
        expect(isPlainObject(new Map())).to.be.false
    })
    it('allows direct access to fields', () => {
        const a = { a: 1 }
        expect(isPlainObject(a) && a.a).to.eql(1)        
    })
})