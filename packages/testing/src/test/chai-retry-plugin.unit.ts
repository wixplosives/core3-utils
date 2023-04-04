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

    it('should timeout after the specified duration', async () => {
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

    it('should retry a function that always returns an object with a property that eventually becomes greater than a certain value', async () => {
        let attempts = 0;

        const funcToRetry = () => {
            attempts++;
            return attempts < 4 ? { notValue: 2 } : { value: attempts };
        };

        await expect(funcToRetry).retry({ retries: 5, delay: 10 }).have.property('value').and.be.above(4);

        expect(attempts).to.equal(5);
    });

    it('should be ', async () => {
        let attempts = 0;

        const funcToRetry = () => {
            attempts++;

            return attempts;
        };

        await expect(funcToRetry).retry({ timeout: 500, retries: 10, delay: 100 }).to.be.above(4);
    });

    it('should retry a function that eventually returns an object with a property that does not match a specific value using negate assertion', async () => {
        let attempts = 0;

        const funcToRetry = () => {
            attempts++;
            return { status: attempts === 3 ? 'success' : 'pending' };
        };

        await expect(funcToRetry).retry({ retries: 5, delay: 10 }).and.have.property('status').and.not.equal('pending');

        expect(attempts).to.equal(3);
    });

    it('should retry a function that eventually returns an array that does not include a specific element using negate assertion', async () => {
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

    it('should pass for a null assertion after retrying', async () => {
        let attempt = 0;
        const sometimesNullFunction = () => {
            attempt += 1;
            return attempt !== 5 ? null : 'not-null';
        };

        await expect(sometimesNullFunction).retry({ timeout: 2000 }).to.be.not.null;

        expect(attempt).to.equal(5);
    });

    it('should retry a function that eventually satisfies a custom assertion', async () => {
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
});
