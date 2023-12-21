import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { isErrorLikeObject, getStackTrace, errorWithTrace } from '../errors';
import { deferred } from 'promise-assist';

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

describe('getStackTrace', () => {
    it('default', () => {
        const stack = getStackTrace();

        expect(stack.split('\n')[0]).to.match(/.*errors\.unit\.ts/);
    });
    it('removes this package internals from stacktrace', () => {
        const stack = getStackTrace({ skipLines: 1 });

        expect(stack.split('\n')[0]).to.match(/.*errors\.ts/);
    });
    it(`removes lines that don't match filterPattern`, () => {
        const stack = getStackTrace({ filterPattern: /.*errors\.unit\.ts/ });
        expect(stack.split('\n')).to.have.lengthOf(1);
        expect(stack).to.match(/.*errors\.unit\.ts/);
    });
});

describe('errorWithTrace', () => {
    it('returns an error has the given stack trace', async () => {
        const trace = getStackTrace();
        const err = deferred<Error>();
        setTimeout(() => {
            try {
                throw errorWithTrace('err', trace, { cause: 'test' });
            } catch (e) {
                err.resolve(e as Error);
            }
        }, 1);
        const { stack, message, cause } = await err.promise;
        expect(stack).to.match(/Error: err\n\s+at Context\.<anonymous>.*errors\.unit\.ts.*\n/);
        expect(message).to.equal('err');
        expect(cause).to.equal('test');
    });
});