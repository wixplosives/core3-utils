import { expect } from 'chai';
import {
    last,
    at,
    first,
    unique,
    next,
    prev,
    concat,
    flat,
    map,
    flatMap,
    filter,
    forEach,
    find,
    includes,
    some,
    every,
    isEmpty,
    size,
    reduce,
    groupBy,
} from '..';
describe('iterables', () => {
    it('last', () => {
        expect(last([1, 2, 3])).to.equal(3);
        expect(last([])).to.equal(undefined);
    });
    it('first', () => {
        expect(first([1, 2, 3])).to.equal(1);
        expect(first([])).to.equal(undefined);
    });
    it('find', () => {
        expect(find([0, 1, 2], (i) => !!i)).to.equal(1);
    });
    it('includes', () => {
        expect(includes([0, 1, 2], 2)).to.equal(true);
    });
    it('some', () => {
        expect(some([0, 1, 2], (i) => i == 1)).to.equal(true);
        expect(some([0, 2], (i) => i == 1)).to.equal(false);
    });
    it('every', () => {
        expect(every([1, 2], (i) => !!i)).to.equal(true);
        expect(every([0, 1, 2], (i) => !!i)).to.equal(false);
    });
    describe('at', () => {
        it('returns the element at a positive index', () => {
            expect(at([1, 2, 3], 0)).to.equal(1);
            expect(at([1, 2, 3], 1)).to.equal(2);
        });
        it('returns the element at a negative index', () => {
            expect(at([1, 2, 3], -1)).to.equal(3);
        });
        it('returns undefined when out of bounds', () => {
            expect(at([1, 2, 3], 4)).to.equal(undefined);
            expect(at([1, 2, 3], -4)).to.equal(undefined);
        });
    });

    describe('unique', () => {
        it('creates an array with no repeats', () => {
            expect([...unique(['1', 1, 1, true])]).to.eql(['1', 1, true]);
            expect([...unique([0, 1, 2, 3], (i) => i % 2)]).to.eql([0, 1]);
        });
    });

    describe('next', () => {
        it('returns the following element', () => {
            expect(next([0, 1, 2], 1)).to.eql(2);
        });
        it('returns undefined when not found', () => {
            expect(next([0, 1, 2], 4)).to.eql(undefined);
        });
        it('returns undefined when last element is found', () => {
            expect(next([0, 1, 2], 2)).to.eql(undefined);
        });
    });
    describe('prev', () => {
        it('returns the previous element', () => {
            expect(prev([0, 1, 2], 1)).to.eql(0);
        });
        it('returns undefined when not found', () => {
            expect(prev([0, 1, 2], 4)).to.eql(undefined);
        });
        it('returns undefined when first element is found', () => {
            expect(prev([0, 1, 2], 0)).to.eql(undefined);
        });
    });
    it('concat', () => {
        expect([...concat([0, 1, 2], [3], [4, 5])]).to.eql([0, 1, 2, 3, 4, 5]);
    });
    it(`flat`, () => {
        expect([...flat([0, [1, 2]])]).to.eql([0, 1, 2]);
        expect([...flat([0, [1, [2]]], true)]).to.eql([0, 1, 2]);
    });
    it(`isEmpty`, () => {
        expect(isEmpty([])).to.eql(true);
        expect(isEmpty([1])).to.eql(false);
    });
    it(`size`, () => {
        expect(size([])).to.eql(0);
        expect(size([0, 1])).to.eql(2);
    });
    it(`map`, () => {
        expect([...map([0, 1, 2], (i) => i ** 2)]).to.eql([0, 1, 4]);
    });
    it(`flatMap`, () => {
        expect([...flatMap([0, 1, 2], (i) => (i ? [i, i] : i))]).to.eql([0, 1, 1, 2, 2]);
    });
    it(`filter`, () => {
        expect([...filter([0, 1, 2], (i) => !!i)]).to.eql([1, 2]);
    });
    it(`forEach`, () => {
        const r = [] as number[];
        forEach([0, 1, 2], (i) => r.push(i));
        expect(r).to.eql([0, 1, 2]);
    });
    it('reduce', () => {
        const input = [0, 1, 2, 3];
        const reducer = (acc: number, i: number) => acc + i;
        expect(reduce(input, reducer, 0)).to.equal(input.reduce(reducer, 0));
    });
    it('groupBy', () => {
        expect(groupBy([{ a: 1, b: 0 }, { a: 1, b: 1 }, { a: 2 }], 'a')).to.eql(
            new Map([
                [
                    1,
                    [
                        { a: 1, b: 0 },
                        { a: 1, b: 1 },
                    ],
                ],
                [2, [{ a: 2 }]],
            ])
        );
    });
});
