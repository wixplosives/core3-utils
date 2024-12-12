import { expect } from 'chai';
import { getCartesianProduct } from '../arrays.js';

describe('getCartesianProductOfArrays', () => {
    describe('get all combinations of one from each array', () => {
        it('no arrays', () => {
            expect(getCartesianProduct([])).to.deep.equal([]);
        });
        it('one array', () => {
            expect(getCartesianProduct([[1, 2, 3]])).to.deep.equal([[1], [2], [3]]);
        });
        it('two arrays', () => {
            const combos = getCartesianProduct([
                [1, 2],
                [3, 4],
            ]);
            expect(combos).to.deep.include([1, 3]);
            expect(combos).to.deep.include([1, 4]);
            expect(combos).to.deep.include([2, 3]);
            expect(combos).to.deep.include([2, 4]);
            expect(combos).to.have.lengthOf(4);
        });
        it('three arrays', () => {
            const combos = getCartesianProduct([
                [1, 2],
                [3, 4],
                [5, 6],
            ]);
            expect(combos).to.deep.include([1, 3, 5]);
            expect(combos).to.deep.include([1, 3, 6]);
            expect(combos).to.deep.include([1, 4, 5]);
            expect(combos).to.deep.include([1, 4, 6]);
            expect(combos).to.deep.include([2, 3, 5]);
            expect(combos).to.deep.include([2, 3, 6]);
            expect(combos).to.deep.include([2, 4, 5]);
            expect(combos).to.deep.include([2, 4, 6]);
            expect(combos).to.have.lengthOf(8);
        });
    });
});
