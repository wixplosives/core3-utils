import Chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { sleep } from 'promise-assist';

import { chaiRetryPlugin } from '../chai-retry-plugin/chai-retry-plugin';

Chai.use(chaiRetryPlugin);
// `chai-as-promised` should be used in order to test collision between plugins
Chai.use(chaiAsPromised);

describe('chai-retry-plugin', () => {
    it('should retry a function that eventually succeeds', async () => {
        const { resultFunction, getCallCount } = withCallCount((callCount: number) => {
            if (callCount < 3) {
                throw new Error('Failed');
            }
            return 'Success';
        });

        await expect(resultFunction).to.retry().to.equal('Success');
        expect(getCallCount()).to.equal(3);
    });

    describe('options should work correctly:', () => {
        it('timeout after the specified duration', async () => {
            const funcToRetry = async () => {
                await sleep(250);
                return 'Success';
            };

            try {
                await expect(funcToRetry).retry({ timeout: 700 }).to.equal('Failure');
                throw new Error('This should not be called');
            } catch (error: unknown) {
                expect((error as Error).message).includes('Timed out after 700ms');
            }
        });

        it('throw an error when retries limit exceeded', async () => {
            const { resultFunction } = withCallCount((callCount) => callCount);

            try {
                await expect(resultFunction, 'Custom description').retry({ retries: 10 }).to.be.above(100);
                throw new Error('This should not be called');
            } catch (error: unknown) {
                const msg = (error as Error).message;
                expect(msg).to.include('Custom description');
                expect(msg).to.includes('Limit of 10 retries exceeded!');
                expect(msg).to.include('to be above 100');
            }
        });

        it('should apply delay correctly', async () => {
            const { resultFunction, getCallCount } = withCallCount(() => {
                throw new Error('Im throwing');
            });

            try {
                await expect(resultFunction).retry({ delay: 50, timeout: 500 }).to.equal(5);
            } catch (error: unknown) {
                expect((error as Error).message).includes('Timed out after 500ms. Error: Im throwing');
                expect(getCallCount()).to.be.within(9, 10);
            }
        });

        it(`should extend total test timeout`, async function () {
            this.timeout(100);
            const { resultFunction } = withCallCount((callCount: number) => {
                if (callCount < 3) {
                    throw new Error('Failed');
                }
                return 'Success';
            });

            await expect(resultFunction).retry({ delay: 200 }).to.equal('Success');
        });

        it('should return value that was asserted successfully', async () => {
            const { resultFunction } = withCallCount((callCount: number) => {
                if (callCount < 3) {
                    throw new Error('Failed');
                }
                return 'Success';
            });

            const result = await expect(resultFunction).retry();

            expect(result).to.equal('Success');
        });
    });

    describe('should work with negated assertions:', () => {
        it('assert object with a property `status` that does not match a specific value', async () => {
            const { resultFunction, getCallCount } = withCallCount((callCount) => ({
                status: callCount === 3 ? 'success' : 'pending',
            }));

            await expect(resultFunction).retry().and.have.property('status').and.not.equal('pending');
            expect(getCallCount()).to.equal(3);
        });

        it('assert number with `not` on the beginning of chain', async () => {
            const { resultFunction, getCallCount } = withCallCount((callCount) => callCount);

            await expect(resultFunction).retry().to.not.lessThanOrEqual(5).to.equal(6);
            expect(getCallCount()).to.equal(7);
        });

        it('assert array that does not include a specific element', async () => {
            const array: number[] = [1, 2, 3, 4, 5];

            const { resultFunction, getCallCount } = withCallCount(() => {
                array.shift();
                return array;
            });

            await expect(resultFunction).retry({ retries: 4 }).to.not.include(4);
            expect(getCallCount()).to.equal(4);
        });
    });

    describe('should work with chained properties:', () => {
        it('.deep.equal()', async () => {
            const { resultFunction, getCallCount } = withCallCount((callCount) =>
                callCount !== 5 ? null : { c: { b: { a: 1 } } }
            );

            await expect(resultFunction)
                .retry()
                .to.deep.equal({ c: { b: { a: 1 } } });

            expect(getCallCount()).to.equal(5);
        });

        it('.nested.property()', async () => {
            const { resultFunction, getCallCount } = withCallCount((callCount) =>
                callCount !== 5 ? null : { a: { b: ['x', 'y'] } }
            );

            await expect(resultFunction).retry().to.have.nested.property('a.b[1]');
            expect(getCallCount()).to.equal(5);
        });
    });

    describe('should pass the assertions that ends with properties:', () => {
        it('.null', async () => {
            const { resultFunction, getCallCount } = withCallCount((callCount) =>
                callCount !== 5 ? null : 'not-null'
            );

            await expect(resultFunction).retry().to.be.not.null;
            expect(getCallCount()).to.equal(5);
        });

        it('.undefined', async () => {
            const { resultFunction, getCallCount } = withCallCount((callCount) =>
                callCount !== 5 ? 'not-undefined' : undefined
            );

            await expect(resultFunction).retry().to.be.undefined;
            expect(getCallCount()).to.equal(5);
        });

        it('.empty', async () => {
            const { resultFunction, getCallCount } = withCallCount((callCount) => (callCount !== 5 ? [1, 2, 3] : []));

            await expect(resultFunction).retry().to.be.empty;
            expect(getCallCount()).to.equal(5);
        });

        it('.true', async () => {
            const { resultFunction, getCallCount } = withCallCount((callCount) => {
                if (callCount < 3) {
                    throw new Error('Failed');
                }
                return { success: true };
            });

            await expect(resultFunction).retry().and.have.property('success').and.be.true;
            expect(getCallCount()).to.equal(3);
        });

        it('.sealed', async () => {
            const sealedObject = Object.seal({ prop1: 'value1', prop2: 'value2' });

            await expect(() => sealedObject).retry().to.be.sealed;
        });

        it('.not.sealed', async () => {
            const notSealedObject = { prop1: 'value1', prop2: 'value2' };

            try {
                await expect(() => notSealedObject).retry({ retries: 3 }).to.be.sealed;
            } catch (error: unknown) {
                expect((error as Error).message).to.include('3 retries');
            }
        });
    });

    describe('should work with various assertion methods:', () => {
        it('.satisfy()', async () => {
            const { resultFunction, getCallCount } = withCallCount((callCount) => ({
                callCount,
            }));

            await expect(resultFunction)
                .retry()
                .to.satisfy((obj: { callCount: number }) => obj.callCount > 3);

            expect(getCallCount()).to.equal(4);
        });

        it('.have.property(), and.be.above()', async () => {
            const { resultFunction, getCallCount } = withCallCount((callCount) =>
                callCount < 4 ? { notValue: 2 } : { value: callCount }
            );

            await expect(resultFunction).retry().have.property('value').and.be.above(4);
            expect(getCallCount()).to.equal(5);
        });

        it('.to.increase(), .by()', async () => {
            const myObj = { val: 1 };
            const { resultFunction, getCallCount } = withCallCount(() => {
                myObj.val += 2;
            });

            await expect(resultFunction).retry().to.increase(myObj, 'val').by(2);
            expect(getCallCount()).to.equal(1);
        });

        it('.oneOf()', async () => {
            const { resultFunction, getCallCount } = withCallCount((callCount) => callCount);

            await expect(resultFunction).retry().to.not.be.oneOf([1, 2, 3]);
            expect(getCallCount()).to.equal(4);
        });

        it('.change()', async () => {
            const myObj = { dots: '', comas: '' };
            const { resultFunction, getCallCount } = withCallCount(() => {
                myObj.dots += '.';
            });

            await expect(resultFunction).retry().to.change(myObj, 'dots');
            await expect(resultFunction).retry().to.not.change(myObj, 'comas');
            expect(getCallCount()).to.equal(2);
        });

        it('.respondTo()', async () => {
            const service: { test?: () => null } = {};

            setTimeout(() => {
                service.test = () => null;
            }, 900);

            await expect(() => service, 'should respond')
                .retry({ timeout: 1000 })
                .to.respondTo('test');
        });

        it('.keys()', async () => {
            const { resultFunction, getCallCount } = withCallCount((count) =>
                count === 4 ? { a: 1, b: 2, c: 3, d: 4 } : { a: 1, b: 2, c: 3 }
            );

            await expect(resultFunction).retry().to.have.keys(['a', 'b', 'c', 'd']);
            expect(getCallCount()).to.equal(4);
        });
    });
});

const withCallCount = (func: (callCount: number) => unknown) => {
    let callCount = 0;

    const wrapperFunc = () => {
        callCount++;
        return func(callCount);
    };

    return {
        resultFunction: wrapperFunc,
        getCallCount: () => callCount,
    };
};
