import { expect, use } from 'chai';
import asPromised from 'chai-as-promised';
import { withSteps } from '../steps';

use(asPromised);

describe('withSteps', () => {
    describe('poll step', () => {
        describe('usage', () => {
            withSteps.it('runs action every interval until the predicate is satisfied', async ({ poll, defaults }) => {
                defaults.poll.interval = 5;
                defaults.step.timeout = 100;
                let count = 0;
                const action = () => ++count;
                expect(await poll(action, (i) => i > 2).description('predicate returning boolean')).to.equal(3);
                count = 0;
                expect(
                    await poll(action, (i) => expect(i).to.be.greaterThan(2)).description(
                        'predicate returning assertion'
                    )
                ).to.equal(3);
                count = 0;
                expect(await poll(action, 3).description('predicated value')).to.equal(3);
            });

            withSteps.it('compares predicated value using chai expect.eql', async ({ poll }) => {
                expect(
                    await poll(() => [1, 2, 3], [1, 2, 3])
                        .interval(1)
                        .description('predicated deep value')
                ).to.eql([1, 2, 3]);
            });

            withSteps.it('times out if the predicate is not satisfied in time', async ({ poll }) => {
                const step = poll(
                    () => 0,
                    () => false
                )
                    .interval(5)
                    .timeout(20)
                    .description('timeout');
                await expect(step).to.eventually.rejectedWith('Timed out in step "timeout"');
                await expect(step).to.eventually.rejectedWith('Info: last polled value: 0');
            });
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
                withSteps.it('fails when the action throws', async ({ poll }) => {
                    const step = poll(throwingAction, () => true).description('throwing action');
                    await expect(step).to.eventually.rejectedWith('Error in step "throwing action"');
                    await expect(step).to.eventually.rejectedWith('action error');
                });
                withSteps.it('does not fails when the predicate throws', async (step) => {
                    expect(await step.poll(() => 0, throwingPredicate)).to.equal(0);
                });
            });
            describe('allowErrors', () => {
                withSteps.it('allow only action errors', async ({ poll }) => {
                    expect(
                        await poll(throwingAction, () => true)
                            .allowErrors(true, false)
                            .description('action throws in first execution')
                    ).to.equal('success');
                    const step = poll(throwingAction, throwingPredicate)
                        .allowErrors(true, false)
                        .description('predicate throws when allowPredicateErrors=false');
                    await expect(step).to.eventually.rejectedWith('predicate throws when allowPredicateErrors=false');
                    await expect(step).to.eventually.rejectedWith('predicate error');
                });
                withSteps.it('allow only predicate errors (default)', async ({ poll }) => {
                    expect(
                        await poll(() => 'success', throwingPredicate)
                            .interval(5)
                            .description('predicate throws in first execution')
                    ).to.equal('success');
                    const step = poll(throwingAction, throwingPredicate);
                    await expect(step).to.eventually.rejectedWith('step 2');
                    await expect(step).to.eventually.rejectedWith('action error');
                });
            });
        });
    });
});
