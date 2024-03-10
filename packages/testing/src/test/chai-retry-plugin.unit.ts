import Chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { sleep } from 'promise-assist';

import { chaiRetryPlugin } from '../chai-retry-plugin/chai-retry-plugin';
import { codeMatchers } from '../code-matchers';
import { isDebugMode } from '../debug-tests';

Chai.use(chaiRetryPlugin);
// `chai-as-promised` should be used in order to test collision between plugins
Chai.use(chaiAsPromised);
Chai.use(codeMatchers);

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

    describe('options', () => {
        it('timeout after the specified duration', async function () {
            if (isDebugMode()) {
                // in DEBUG mode retry won't throw
                return this.skip();
            }
            const funcToRetry = async () => {
                await sleep(150);
                return 'Success';
            };

            try {
                await expect(funcToRetry).retry({ timeout: 100 }).to.equal('Failure');
                throw new Error('This should not be called');
            } catch (error: unknown) {
                expect((error as Error).message).includes('Timed out after 100ms');
            }
        });

        it('throw an error when retries limit exceeded', async function () {
            if (isDebugMode()) {
                // in DEBUG mode retry won't throw
                return this.skip();
            }

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

        it('should apply delay correctly', async function () {
            if (isDebugMode()) {
                // in DEBUG mode retry won't throw
                return this.skip();
            }
            const { resultFunction, getCallCount } = withCallCount(() => {
                throw new Error('Im throwing');
            });

            try {
                await expect(resultFunction).retry({ delay: 50, timeout: 500 }).to.equal(5);
            } catch (error: unknown) {
                expect((error as Error).message).includes('Timed out after 500ms.');
                expect((error as Error).stack).includes('Error: Im throwing');
                expect(getCallCount()).to.be.within(8, 10);
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
                callCount !== 5 ? null : { c: { b: { a: 1 } } },
            );

            await expect(resultFunction)
                .retry()
                .to.deep.equal({ c: { b: { a: 1 } } });

            expect(getCallCount()).to.equal(5);
        });

        it('.nested.property()', async () => {
            const { resultFunction, getCallCount } = withCallCount((callCount) =>
                callCount !== 5 ? null : { a: { b: ['x', 'y'] } },
            );

            await expect(resultFunction).retry().to.have.nested.property('a.b[1]');
            expect(getCallCount()).to.equal(5);
        });
    });

    describe('should pass the assertions that ends with properties:', () => {
        it('.null', async () => {
            const { resultFunction, getCallCount } = withCallCount((callCount) =>
                callCount !== 5 ? null : 'not-null',
            );

            await expect(resultFunction).retry().to.be.not.null;
            expect(getCallCount()).to.equal(5);
        });

        it('.undefined', async () => {
            const { resultFunction, getCallCount } = withCallCount((callCount) =>
                callCount !== 5 ? 'not-undefined' : undefined,
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

        it('.not.sealed', async function () {
            if (isDebugMode()) {
                // in DEBUG mode retry won't throw
                return this.skip();
            }
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
                callCount < 4 ? { notValue: 2 } : { value: callCount },
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
                count === 4 ? { a: 1, b: 2, c: 3, d: 4 } : { a: 1, b: 2, c: 3 },
            );

            await expect(resultFunction).retry().to.have.keys(['a', 'b', 'c', 'd']);
            expect(getCallCount()).to.equal(4);
        });
    });

    describe('mocha test timeout adjustment', () => {
        const BASE_TIMEOUT = 200;
        const RETRY_TIMEOUT = 100;

        it('upon failure', async function () {
            if (isDebugMode()) {
                // in DEBUG mode test have no timeout
                return this.skip();
            }
            this.timeout(BASE_TIMEOUT);
            try {
                await expect(() => sleep(20))
                    .retry({ timeout: RETRY_TIMEOUT })
                    .to.equal(false);
            } catch {
                //
            }
            expect(this.timeout(), 'test timeout').to.be.approximately(BASE_TIMEOUT + RETRY_TIMEOUT, 50);
        });

        it('upon success', async function () {
            this.timeout(BASE_TIMEOUT);
            const SUCCESS_TIME = 10;
            try {
                await expect(() => sleep(SUCCESS_TIME).then(() => true))
                    .retry({ timeout: RETRY_TIMEOUT })
                    .to.equal(true);
            } catch {
                //
            }
            expect(this.timeout(), 'test timeout').to.be.approximately(BASE_TIMEOUT + SUCCESS_TIME, 10);
        });
    });

    describe('debug mode - mocha test time is 0', () => {
        it('does not time out', async () => {
            await expect(() => sleep(50).then(() => true), 'should not time out').retry({ timeout: 10 }).to.be.true;
        }).timeout(0);
        it('does not stop after the max retries', async () => {
            let count = 0;
            await expect(() => count++, 'should not stop retrying')
                .retry({ retries: 10 })
                .to.eql(12);
        }).timeout(0);
    });

    describe('TIMEOUT_SCALE env variable', () => {
        let timeout: string | undefined;
        before(() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            timeout = (globalThis as any).process.env.TIMEOUT_SCALE;
        });
        it('scales the timeout', async function () {
            if (isDebugMode()) {
                // in DEBUG mode retry won't throw
                return this.skip();
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (globalThis as any).process.env.TIMEOUT_SCALE = 3;
            const e = expect(() => false, 'should time out').retry({ timeout: 30 }).to.be.true;
            await expect(Promise.race([e, sleep(50)]), 'should not time out yet').to.be.fulfilled;
            await expect(Promise.race([e, sleep(100)]), 'should not time out yet').to.be.rejectedWith(
                'Timed out after 90ms',
            );
        });
        after(() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            (globalThis as any).process.env.TIMEOUT_SCALE = timeout;
            if (!timeout) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                delete (globalThis as any).process.env.TIMEOUT_SCALE;
            }
        });
    });

    describe('async assertion', () => {
        it('times out for failed async assertion', async function () {
            if (isDebugMode()) {
                // in DEBUG mode retry won't throw
                return this.skip();
            }
            await expect(
                expect(() => `const source = true;`)
                    .retry({ timeout: 50 })
                    .to.matchCode(`const expected = 'wrong';`),
            ).to.be.rejectedWith(`Timed out after 50ms`);
        });
        it('passes async assertion', async () => {
            await expect(() => `const source = true;`)
                .retry({ timeout: 50 })
                .to.matchCode(`const source = true;`);
        });
    });

    describe('should work with assertions with signatures and nested assertions', function () {
        it('should allow use of both include and include.members as assertion', async () => {
            const getExpected = () => [1, 2, 3];

            await expect(getExpected).retry().to.include(2);

            await expect(getExpected).retry().to.include.members([1, 2, 2, 1]);
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
