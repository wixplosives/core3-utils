import { it, describe } from "mocha";
import { expect } from "chai";
import { test1 } from "..";

describe('@example ref', () => {
    it('tests the example', () => {
        // {@label Example1
        expect(test1()).to.equal(1)
        // @}
    })
})  