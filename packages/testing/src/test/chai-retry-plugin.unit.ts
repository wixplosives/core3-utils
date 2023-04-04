import Chai, { expect } from 'chai';
import chaiRetryPlugin from '../chai-retry-plugin/chai-retry-plugin';

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

        await expect(funcToRetry).to.retry({ retries: 5, delay: 10 });
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
                await new Promise((resolve) => setTimeout(resolve, 500));
                return 'Success';
            };

            await expect(funcToRetry)
                .retry({ retries: 2, timeout: 250 })
                .then(
                    () => {
                        throw new Error('This should not be called');
                    },
                    (error: Error) => {
                        expect(error).to.be.an.instanceOf(Error);
                        expect(error.message).to.equal('timed out after 250ms');
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
                        expect(error.message).to.equal('Limit of 10 retries exceeded!');
                    }
                );
        });

        it('should retry a function that succeeds and assert the result with getter property', async () => {
            let attempts = 0;

            const funcToRetry = () => {
                attempts++;
                if (attempts < 3) {
                    throw new Error('Failed');
                }
                return { success: true };
            };

            await expect(funcToRetry).retry({ retries: 5, delay: 10 }).and.have.property('success').and.be.true;
        });
    });

    describe('should work with negated assertions:', () => {
        it('assert object with a property `status` that does not match a specific value', async () => {
            let attempts = 0;

            const funcToRetry = () => {
                attempts++;
                return { status: attempts === 3 ? 'success' : 'pending' };
            };

            await expect(funcToRetry)
                .retry({ retries: 5, delay: 10 })
                .and.have.property('status')
                .and.not.equal('pending');

            expect(attempts).to.equal(3);
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

    describe('should pass the assertions that ends with properties:', () => {
        it('null', async () => {
            let attempt = 0;
            const sometimesNullFunction = () => {
                attempt += 1;
                return attempt !== 5 ? null : 'not-null';
            };

            await expect(sometimesNullFunction).retry({ timeout: 2000 }).to.be.not.null;

            expect(attempt).to.equal(5);
        });

        it('undefined', async () => {
            let attempt = 0;
            const sometimesUndefinedFunction = () => {
                attempt += 1;
                return attempt !== 5 ? 'not-undefined' : undefined;
            };

            await expect(sometimesUndefinedFunction).retry({ timeout: 2000 }).to.be.undefined;

            expect(attempt).to.equal(5);
        });

        it('empty', async () => {
            let attempt = 0;
            const sometimes = () => {
                attempt += 1;
                return attempt !== 5 ? [1, 2, 3] : [];
            };

            await expect(sometimes).retry({ retries: 10 }).to.be.empty;

            expect(attempt).to.equal(5);
        });
    });

    describe('should work with various assertion methods:', () => {
        it('satisfy', async () => {
            let attempts = 0;

            const funcToRetry = () => {
                attempts++;
                return { attempts };
            };

            await expect(funcToRetry)
                .retry({ retries: 5, delay: 10 })
                .to.satisfy((obj: { attempts: number }) => obj.attempts > 3);

            expect(attempts).to.equal(4);
        });

        it('.have.property(), and.be.above()', async () => {
            let attempts = 0;

            const funcToRetry = () => {
                attempts++;
                return attempts < 4 ? { notValue: 2 } : { value: attempts };
            };

            await expect(funcToRetry).retry({ retries: 5, delay: 10 }).have.property('value').and.be.above(4);

            expect(attempts).to.equal(5);
        });
    });
});
