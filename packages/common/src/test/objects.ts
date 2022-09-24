import { expect } from 'chai';
import { pick } from '..';

describe('pick', () => {
    it('pick specified keys from an object', () => {
        expect(pick({ a: 1, b: 2 }, ['a', 'b'])).to.eql({ a: 1, b: 2 });
        expect(pick({ a: 1, b: 2 }, ['a'])).to.eql({ a: 1 });
        expect(pick({ a: 1, b: 2 }, [])).to.eql({});
    });
});

