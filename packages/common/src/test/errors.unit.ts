import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { isErrorLikeObject } from '../errors';

chai.use(sinonChai);

describe('isErrorLikeObject', () => {
    it('returns true for instances of Error', () => {
        const error = new Error();
        expect(isErrorLikeObject(error)).equal(true);
    });

    it('returns true for objects that satisfy the Error interface', () => {
        const error = { name: 'RangeError', message: 'The value is out of range' };
        expect(isErrorLikeObject(error)).equal(true);
    });

    it(`returns false for objects that don't satisfy the Error interface`, () => {
        const error = { name: undefined, message: 'The value is out of range' };
        expect(isErrorLikeObject(error)).equal(false);
    });
});
