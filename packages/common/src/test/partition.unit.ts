import { expect } from 'chai';
import { partition } from '../partition.js';

describe('partition', () => {
    it('one item', () => {
        expect(partition([1], 1, (i) => i)).to.eql([[1]]);
        expect(partition([1], 3, (i) => i)).to.eql([[1], [], []]);
    });
    it('multiple equal items', () => {
        expect(partition([1, 1, 1, 1], 2, (i) => i)).to.eql([
            [1, 1],
            [1, 1],
        ]);
        expect(partition([1, 1, 1, 1, 1], 2, (i) => i)).to.eql([
            [1, 1, 1],
            [1, 1],
        ]);
    });
    it('multiple items', () => {
        expect(partition([1, 2, 3], 2, (i) => i)).to.eql([[3], [2, 1]]);
        expect(partition([1, 2, 3], 3, (i) => i)).to.eql([[3], [2], [1]]);
        expect(partition([1, 2, 3], 4, (i) => i)).to.eql([[3], [2], [1], []]);
    });
    it('large input', () => {
        const length = 10 ** 5;
        const buckets = 5;
        const expected = (0.5 * length) / buckets;
        const tolerance = expected / 100;
        const data = Array.from({ length }, () => Math.random());
        const result = partition(data, buckets, (i) => i);
        expect(result).to.have.length(5);
        expect(result[0]?.reduce((acc, i) => acc + i, 0)).to.be.closeTo(expected, tolerance);
        expect(result[1]?.reduce((acc, i) => acc + i, 0)).to.be.closeTo(expected, tolerance);
        expect(result[2]?.reduce((acc, i) => acc + i, 0)).to.be.closeTo(expected, tolerance);
        expect(result[3]?.reduce((acc, i) => acc + i, 0)).to.be.closeTo(expected, tolerance);
        expect(result[4]?.reduce((acc, i) => acc + i, 0)).to.be.closeTo(expected, tolerance);
    });
});
