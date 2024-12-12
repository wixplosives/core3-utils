import { expect } from 'chai';
import { getValue } from '../maps.js';

describe('maps', () => {
    describe('getValue', () => {
        const map = new Map([[0, 1]]);
        const obj = { '0': 1 };
        it('thrown when the value is missing', () => {
            expect(() => {
                getValue(map, 2, 'missing!');
            }).to.throw('missing!');
        });
        it('thrown when the map is nullish', () => {
            expect(() => {
                getValue(null, 2, 'no map');
            }).to.throw('no map');
        });
        it('returns the value', () => {
            expect(getValue(map, 0)).to.equal(1);
            expect(getValue(obj, '0')).to.equal(1);
        });
    });
});
