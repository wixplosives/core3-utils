import Chai, { expect } from 'chai';
import { sleep } from 'promise-assist';
import { chaiRetryPlugin } from '../chai-retry-plugin/chai-retry-plugin';

Chai.use(chaiRetryPlugin);

describe('chai-retry-plugin', () => {
    it('should retry a function that eventually succeeds', async () => {
        let attempts = 0;

        const funcToRetry = () => {
            attempts++;
            if (attempts < 3) {
                throw new Error('Failed');
            }
            return 'Success';
        };

        await expect(funcToRetry).to.retry();
        expect(attempts).to.equal(3);
    });

    it('should retry a function that always fails and throw an error', async () => {
        let attempts = 0;

        const funcToRetry = () => {
            attempts++;
            throw new Error('Failed');
        };

        try {
            await expect(funcToRetry).to.retry({ retries: 3 });

            throw new Error('This should not be called');
        } catch (error) {
            expect(error).to.be.an.instanceOf(Error);
            expect((error as Error).message).to.includes('Limit of 3 retries');
            expect(attempts).to.equal(3);
        }
    });

    describe('options should work correctly:', () => {
        it('timeout after the specified duration', async () => {
            const funcToRetry = async () => {
                await sleep(250);
                return 'Success';
            };

            await expect(funcToRetry)
                .retry({ timeout: 700 })
                .to.equal('Failure')
                .then(
                    () => {
                        throw new Error('This should not be called');
                    },
                    (error: Error) => {
                        expect(error).to.be.an.instanceOf(Error);
                        expect(error.message).includes('timed out after 700ms');
                    }
                );
        });

        it('throw an error when retries limit exceeded', async () => {
            let attempts = 0;

            const funcToRetry = () => {
                attempts++;

                return attempts;
            };

            await expect(funcToRetry)
                .retry({ retries: 10 })
                .to.be.above(100)
                .then(
                    () => {
                        throw new Error('This should not be called');
                    },
                    (error: Error) => {
                        expect(error).to.be.an.instanceOf(Error);
                        expect(error.message).to.includes('Limit of 10 retries exceeded!');
                    }
                );
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
    });

    describe('should work with negated assertions:', () => {
        it('assert object with a property `status` that does not match a specific value', async () => {
            let attempts = 0;

            const funcToRetry = () => {
                attempts++;
                return { status: attempts === 3 ? 'success' : 'pending' };
            };

            await expect(funcToRetry).retry().and.have.property('status').and.not.equal('pending');

            expect(attempts).to.equal(3);
        });

        it('assert number with `not` on the beginning of chain', async () => {
            let attempts = 0;

            const funcToRetry = () => {
                attempts++;
                return attempts;
            };

            await expect(funcToRetry).retry().to.not.lessThanOrEqual(5).to.equal(6);

            expect(attempts).to.equal(7);
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
            let attempt = 0;
            const sometimes = () => {
                attempt += 1;
                return attempt !== 5 ? null : { c: { b: { a: 1 } } };
            };

            await expect(sometimes)
                .retry()
                .to.deep.equal({ c: { b: { a: 1 } } });
        });

        it('.nested', async () => {
            let attempt = 0;
            const sometimes = () => {
                attempt += 1;
                return attempt !== 5 ? null : { a: { b: ['x', 'y'] } };
            };

            await expect(sometimes).retry().to.have.nested.property('a.b[1]');
        });
    });

    describe('should pass the assertions that ends with properties:', () => {
        it('.null', async () => {
            let attempt = 0;
            const sometimesNullFunction = () => {
                attempt += 1;
                return attempt !== 5 ? null : 'not-null';
            };

            await expect(sometimesNullFunction).retry().to.be.not.null;

            expect(attempt).to.equal(5);
        });

        it('.undefined', async () => {
            let attempt = 0;
            const sometimesUndefinedFunction = () => {
                attempt += 1;
                return attempt !== 5 ? 'not-undefined' : undefined;
            };

            await expect(sometimesUndefinedFunction).retry().to.be.undefined;

            expect(attempt).to.equal(5);
        });

        it('.empty', async () => {
            let attempt = 0;
            const sometimes = () => {
                attempt += 1;
                return attempt !== 5 ? [1, 2, 3] : [];
            };

            await expect(sometimes).retry().to.be.empty;

            expect(attempt).to.equal(5);
        });

        it('.property(), .true', async () => {
            let attempts = 0;

            const funcToRetry = () => {
                attempts++;
                if (attempts < 3) {
                    throw new Error('Failed');
                }
                return { success: true };
            };

            await expect(funcToRetry).retry().and.have.property('success').and.be.true;
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
                console.log(error);
                expect(error).to.be.an.instanceOf(Error);
                expect((error as Error).message).to.include('3 retries');
            }
        });
    });

    describe('should work with various assertion methods:', () => {
        it('.satisfy()', async () => {
            let attempts = 0;

            const funcToRetry = () => {
                attempts++;
                return { attempts };
            };

            await expect(funcToRetry)
                .retry()
                .to.satisfy((obj: { attempts: number }) => obj.attempts > 3);

            expect(attempts).to.equal(4);
        });

        it('.have.property(), and.be.above()', async () => {
            let attempts = 0;

            const funcToRetry = () => {
                attempts++;
                return attempts < 4 ? { notValue: 2 } : { value: attempts };
            };

            await expect(funcToRetry).retry().have.property('value').and.be.above(4);

            expect(attempts).to.equal(5);
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
            let attempts = 0;

            const funcToRetry = () => {
                attempts++;

                return attempts;
            };

            await expect(funcToRetry).retry().to.not.be.oneOf([1, 2, 3]);
            expect(attempts).to.equal(4);
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
