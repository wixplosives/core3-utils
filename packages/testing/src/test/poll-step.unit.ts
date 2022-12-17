import { expect, use } from 'chai';
import asPromised from 'chai-as-promised';
import { defaults, poll, sleep } from '..';

use(asPromised);

describe('poll step', () => {
    describe('usage', () => {
        it('runs action every interval until the predicate is satisfied', async () => {
            defaults().poll.interval = 5;
            defaults().step.timeout = 200;
            let count = 0;
            const action = () => ++count;
            expect(await poll(action, (i) => i > 2).description('predicate returning boolean')).to.equal(3);
            count = 0;
            expect(
                await poll(action, (i) => expect(i).to.be.greaterThan(2)).description('predicate returning assertion')
            ).to.equal(3);
            count = 0;
            expect(await poll(action, 3).description('predicated value')).to.equal(3);
        });

        it('compares predicated value using chai expect.eql', async () => {
            expect(
                await poll(() => [1, 2, 3], [1, 2, 3])
                    .interval(1)
                    .description('predicated deep value')
            ).to.eql([1, 2, 3]);
        });

        it('times out if the predicate is not satisfied in time', async () => {
            const step = poll(
                () => 0,
                () => false
            )
                .interval(5)
                .timeout(20)
                .description('timeout');
            await expect(step).to.eventually.rejectedWith('Timed out in step "timeout"');
            await expect(step).to.eventually.rejectedWith('Info: last action returned: 0');
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
            it('fails when the action throws', async () => {
                const step = poll(throwingAction, () => true).description('throwing action');
                await expect(step).to.eventually.rejectedWith('Error in step "throwing action"');
                await expect(step).to.eventually.rejectedWith('action error');
            });
            it('does not fails when the predicate throws', async () => {
                expect(await poll(() => 0, throwingPredicate)).to.equal(0);
            });
        });
        describe('allowErrors', () => {
            it('allow only action errors', async () => {
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
            it('allow only predicate errors (default)', async () => {
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
it(`doesn't poll after the step is done`, async () => {
    let count = 0;
    await poll(() => ++count, 3).interval(1);
    await sleep(50);
    expect(count).to.equal(3);
    await expect(
        poll(
            () => ++count,
            () => false
        )
            .interval(1)
            .timeout(1)
    ).to.eventually.rejectedWith('Timed out');
    const lastCount = count;
    await sleep(50);
    expect(count).to.equal(lastCount);
});
it('polls as soon as the interval is set', () =>
    poll(() => true, true)
        .timeout(10)
        .interval(1000));
