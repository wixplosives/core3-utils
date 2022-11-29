import { sleep } from 'promise-assist';
import { expect, use } from 'chai';
import asPromised from 'chai-as-promised';
import { withSteps } from '../steps';

use(asPromised);

describe('withSteps', () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    withSteps.it('each step timeout extends the test timeout', async (step) => {
        const TIMEOUT = 30
        step.mochaCtx.timeout(TIMEOUT);
        await Promise.all([
            expect(step.promise(new Promise(() => 0)).timeout(TIMEOUT)).to.eventually.rejectedWith('Timed out'),
            expect(
               step
                   .poll(
                       () => 0,
                       () => false
                   )
                   .timeout(TIMEOUT)
           ).to.eventually.rejectedWith('Timed out'),
            expect(step.firstCall({ m: () => 0 }, 'm').timeout(TIMEOUT)).to.eventually.rejectedWith('Timed out')
        ]);
        expect(step.mochaCtx.timeout()).to.equal(TIMEOUT*4)
    });

    describe('promise step', () => {
        const LONG_TIME = 10;
        const SHORT_TIME = 1;
        withSteps.it('times out with the description', async (step) => {
            await expect(
                step.promise(sleep(LONG_TIME)).timeout(SHORT_TIME).description('test')
            ).to.eventually.rejectedWith('test');
        });
        withSteps.it('fulfils the promise in the allotted time', async (step) => {
            expect(await step.promise(sleep(SHORT_TIME).then(() => 'success')).timeout(LONG_TIME)).to.equal('success');
        });
    });
    describe('poll step', () => {
        withSteps.it('polls on the action every interval', async (step) => {
            let count = 0;
            const action = () => ++count;
            expect(
                await step
                    .poll(action, () => count > 3)
                    .interval(5)
                    .timeout(30)
            ).to.equal(4);
            count = 0;
            await expect(
                step
                    .poll(action, () => count > 3)
                    .interval(5)
                    .timeout(10)
                    .description('timeout')
            ).to.eventually.rejectedWith('timeout');
        });
        describe('error handling', () => {
            let actionShouldThrow = true;
            let predicateShouldThrow = true;
            const throwingAction = () => {
                if (actionShouldThrow) {
                    actionShouldThrow = false;
                    throw new Error('action error');
                }
                return 'success';
            };
            const throwingPredicate = () => {
                if (predicateShouldThrow) {
                    predicateShouldThrow = false;
                    throw new Error('predicate error');
                }
                return true;
            };
            beforeEach(() => {
                actionShouldThrow = true;
                predicateShouldThrow = true;
            });
            describe('default behavior', () => {
                withSteps.it('fails when the action throws', async (step) => {
                    await expect(step.poll(throwingAction, () => true)).to.eventually.rejectedWith('action error');
                });
                withSteps.it('fails when the predicate throws', async (step) => {
                    await expect(step.poll(() => 0, throwingPredicate)).to.eventually.rejectedWith('predicate error');
                });
            });
            describe('allowErrors', () => {
                withSteps.it('action errors', async (step) => {
                    expect(await step.poll(throwingAction, () => true).allowErrors(true, false)).to.equal('success');

                    await expect(step.poll(throwingAction, throwingPredicate)).to.eventually.rejectedWith(
                        'predicate error'
                    );
                });
                withSteps.it('predicate errors', async (step) => {
                    expect(
                        await step
                            .poll(() => 'success', throwingPredicate)
                            .allowErrors(false)
                            .interval(5)
                            .timeout(20)
                    ).to.equal('success');
                    await expect(step.poll(throwingAction, throwingPredicate)).to.eventually.rejectedWith(
                        'action error'
                    );
                });
                withSteps.it('all errors', async (step) => {
                    expect(
                        await step.poll(throwingAction, throwingPredicate).allowErrors().interval(5).timeout(20)
                    ).to.equal('success');
                    await expect(
                        step.poll(
                            () => {
                                throw Error('action');
                            },
                            () => {
                                throw Error('predicate');
                            }
                        )
                    ).to.eventually.rejectedWith('action');
                });
            });
        });
    });
    describe('firstCall', () => {
        let target: { a: number; b: string; method: (a: number, b: string) => void };
        beforeEach(() => {
            target = {
                a: 0,
                b: '',
                method(a: number, b: string) {
                    this.a = a;
                    this.b = b;
                },
            };
        });
        withSteps.it('resolves with the call arguments', async (step) => {
            const call = step.firstCall(target, 'method');
            target.method(1, 'success');
            expect(await call).to.eql([1, 'success']);
        });
        withSteps.it('times out if not called', async (step) => {
            await expect(step.firstCall(target, 'method').timeout(1).description('timeout')).to.eventually.rejectedWith(
                'timeout'
            );
        });
        withSteps.it('calls thru to the original method', async (step) => {
            const call = step.firstCall(target, 'method');
            target.method(1, 'success');
            await call;
            expect(target).to.deep.contain({ a: 1, b: 'success' });
        });
        withSteps.it('restores the original method after the step is done', async (step) => {
            const originalMethod = target.method;
            const call = step.firstCall(target, 'method');
            target.method(1, 'success');
            await call;
            expect(target.method).to.equal(originalMethod);
        });
    });
});
