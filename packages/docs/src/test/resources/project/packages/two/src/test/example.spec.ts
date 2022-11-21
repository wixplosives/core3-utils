import { it, describe } from 'mocha';
import { expect } from 'chai';
import { test1, test3 } from '..';

describe('@example ref', () => {
    it('tests the example', () => {
        // {@label Example1
        expect(test1()).to.equal(1);
        // @}
    });
    it('tests the example', () => {
        expect(
            // {@label Example3
            test3() // => 3
            // @}
        ).to.equal(3);
    });
});
