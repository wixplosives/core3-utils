import Chai, { expect } from 'chai';
import { sleep } from 'promise-assist';
import { chaiRetryPlugin } from '../chai-retry-plugin/chai-retry-plugin';

Chai.use(chaiRetryPlugin);

describe('chai-retry-plugin', () => {
    it('should retry a function that eventually succeeds', async () => {
        const { funcToRetry, getAttempts } = withCallCount((attempts: number) => {
            if (attempts < 3) {
                throw new Error('Failed');
            }
            return 'Success';
        });

        await expect(funcToRetry).to.retry().to.equal('Success');
        expect(getAttempts()).to.equal(3);
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
            const { funcToRetry } = withCallCount((attempts) => attempts);

            try {
                await expect(funcToRetry).retry({ retries: 10 }).to.be.above(100);
                throw new Error('This should not be called');
            } catch (error: unknown) {
                expect((error as Error).message).to.includes('Limit of 10 retries exceeded!');
            }
        });

        it('should apply delay correctly', async () => {
            let attempts = 0;
            let end = 0;
            const funcToRetry = () => {
                attempts++;

                if (attempts === 5) {
                    end = Date.now();
                }

                return attempts;
            };

            const start = Date.now();
            await expect(funcToRetry).retry({ delay: 100 }).to.equal(5);

            const elapsed = end - start;
            const lowerBound = 400;
            const upperBound = 450;

            expect(elapsed).to.be.within(
                lowerBound,
                upperBound,
                `Elapsed time should be within ${lowerBound}-${upperBound} ms`
            );
        });

        it('should throw an error if timeout is negative', async () => {
            try {
                await expect(() => {
                    return undefined;
                }).retry({ timeout: -1 }).to.be.undefined;
            } catch (error: unknown) {
                expect((error as Error).message).to.equal('`timeout` option should be greater than 0.');
            }
        });
    });

    describe('should work with negated assertions:', () => {
        it('assert object with a property `status` that does not match a specific value', async () => {
            const { funcToRetry, getAttempts } = withCallCount((attempts) => ({
                status: attempts === 3 ? 'success' : 'pending',
            }));

            await expect(funcToRetry).retry().and.have.property('status').and.not.equal('pending');

            expect(getAttempts()).to.equal(3);
        });

        it('assert number with `not` on the beginning of chain', async () => {
            const { funcToRetry, getAttempts } = withCallCount((attempts) => attempts);

            await expect(funcToRetry).retry().to.not.lessThanOrEqual(5).to.equal(6);

            expect(getAttempts()).to.equal(7);
        });

        it('assert array that does not include a specific element', async () => {
            let attempts = 0;
            const array: number[] = [1, 2, 3, 4, 5];

            const funcToRetry = () => {
                attempts++;
                array.shift();
                return array;
            };

            await expect(funcToRetry).retry({ retries: 4 }).to.not.include(4);

            expect(attempts).to.equal(4);
        });
    });

    describe('should work with chained properties:', () => {
        it('.deep', async () => {
            const { funcToRetry, getAttempts } = withCallCount((attempts) =>
                attempts !== 5 ? null : { c: { b: { a: 1 } } }
            );

            await expect(funcToRetry)
                .retry()
                .to.deep.equal({ c: { b: { a: 1 } } });

            expect(getAttempts()).to.equal(5);
        });

        it('.nested', async () => {
            const { funcToRetry, getAttempts } = withCallCount((attempts) =>
                attempts !== 5 ? null : { a: { b: ['x', 'y'] } }
            );

            await expect(funcToRetry).retry().to.have.nested.property('a.b[1]');

            expect(getAttempts()).to.equal(5);
        });
    });

    describe('should pass the assertions that ends with properties:', () => {
        it('.null', async () => {
            const { funcToRetry, getAttempts } = withCallCount((attempts) => (attempts !== 5 ? null : 'not-null'));

            await expect(funcToRetry).retry().to.be.not.null;

            expect(getAttempts()).to.equal(5);
        });

        it('.undefined', async () => {
            const { funcToRetry, getAttempts } = withCallCount((attempts) =>
                attempts !== 5 ? 'not-undefined' : undefined
            );

            await expect(funcToRetry).retry().to.be.undefined;

            expect(getAttempts()).to.equal(5);
        });

        it('.empty', async () => {
            const { funcToRetry, getAttempts } = withCallCount((attempts) => (attempts !== 5 ? [1, 2, 3] : []));

            await expect(funcToRetry).retry().to.be.empty;

            expect(getAttempts()).to.equal(5);
        });

        it('.property(), .true', async () => {
            const { funcToRetry, getAttempts } = withCallCount((attempts) => {
                if (attempts < 3) {
                    throw new Error('Failed');
                }
                return { success: true };
            });

            await expect(funcToRetry).retry().and.have.property('success').and.be.true;

            expect(getAttempts()).to.equal(3);
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
            const { funcToRetry, getAttempts } = withCallCount((attempts) => ({
                attempts,
            }));

            await expect(funcToRetry)
                .retry()
                .to.satisfy((obj: { attempts: number }) => obj.attempts > 3);

            expect(getAttempts()).to.equal(4);
        });

        it('.have.property(), and.be.above()', async () => {
            const { funcToRetry, getAttempts } = withCallCount((attempts) =>
                attempts < 4 ? { notValue: 2 } : { value: attempts }
            );

            await expect(funcToRetry).retry().have.property('value').and.be.above(4);

            expect(getAttempts()).to.equal(5);
        });

        it('.to.increase(), .by()', async () => {
            let attempts = 0;
            const myObj = { val: 1 };

            const addTwo = () => {
                attempts++;
                myObj.val += 2;
            };

            await expect(addTwo).retry().to.increase(myObj, 'val').by(2);

            expect(attempts).to.equal(1);
        });

        it('.oneOf()', async () => {
            const { funcToRetry, getAttempts } = withCallCount((attempts) => attempts);

            await expect(funcToRetry).retry().to.not.be.oneOf([1, 2, 3]);
            expect(getAttempts()).to.equal(4);
        });

        it('.change()', async () => {
            let attempts = 0;
            const myObj = { dots: '', comas: '' };

            const addDot = () => {
                attempts++;
                myObj.dots += '.';
            };

            await expect(addDot).retry().to.change(myObj, 'dots');
            await expect(addDot).retry().to.not.change(myObj, 'comas');

            expect(attempts).to.equal(2);
        });
    });
});

const withCallCount = (func: (attempts: number) => unknown) => {
    let callCount = 0;

    const wrapperFunc = () => {
        callCount++;
        return func(callCount);
    };

    return {
        funcToRetry: wrapperFunc,
        getAttempts: () => {
            return callCount;
        },
    };
};