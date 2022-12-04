import { sleep } from 'promise-assist';
import { expect, use } from 'chai';
import asPromised from 'chai-as-promised';
import { withSteps } from '../steps';

use(asPromised);

describe('withSteps', () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    it(
        'each step timeout extends the test timeout',
        withSteps(async (step) => {
            const TIMEOUT = 30;
            const SAFETY_MARGIN = 20;
            step.mochaCtx.timeout(1_000);
            step.defaults.step.safetyMargin = SAFETY_MARGIN;
            step.defaults.step.timeout = TIMEOUT;
            await Promise.all([
                expect(step.withTimeout(new Promise(() => 0))).to.eventually.rejectedWith('Timed out'),
                expect(
                    step.poll(
                        () => 0,
                        () => false
                    )
                ).to.eventually.rejectedWith('Timed out'),
                expect(step.waitForCall({ m: () => 0 }, 'm')).to.eventually.rejectedWith('Timed out'),
                expect(step.waitForStubCall(() => 0)).to.eventually.rejectedWith('Timed out')
            ]);
            expect(step.mochaCtx.timeout()).to.equal(1_000 + TIMEOUT * 4 + SAFETY_MARGIN * 4);
        })
    );

    describe('promise step', () => {
        const LONG_TIME = 10;
        const SHORT_TIME = 1;
        it(
            'times out with the description',
            withSteps(async (step) => {
                await expect(
                    step.withTimeout(sleep(LONG_TIME)).timeout(SHORT_TIME).description('test')
                ).to.eventually.rejectedWith('test');
            })
        );
        it(
            'fulfils the promise in the allotted time',
            withSteps(async (step) => {
                expect(await step.withTimeout(sleep(SHORT_TIME).then(() => 'success')).timeout(LONG_TIME)).to.equal(
                    'success'
                );
            })
        );
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
                }
            };
        });
        it(
            'resolves with the call arguments',
            withSteps(async (step) => {
                const call = step.waitForCall(target, 'method');
                target.method(1, 'success');
                expect(await call).to.eql([1, 'success']);
            })
        );
        it(
            'times out if not called',
            withSteps(async (step) => {
                await expect(
                    step.waitForCall(target, 'method').timeout(1).description('timeout')
                ).to.eventually.rejectedWith('timeout');
            })
        );
        it(
            'calls thru to the original method',
            withSteps(async (step) => {
                const call = step.waitForCall(target, 'method');
                target.method(1, 'success');
                await call;
                expect(target).to.deep.contain({ a: 1, b: 'success' });
            })
        );
        it(
            'restores the original method after the step is done',
            withSteps(async (step) => {
                const originalMethod = target.method;
                const call = step.waitForCall(target, 'method');
                target.method(1, 'success');
                await call;
                expect(target.method).to.equal(originalMethod);
            })
        );
    });

    describe('waitForStubCall', () => {
        it(
            'resolves to {callArgs, returned}',
            withSteps(async (steps) => {
                expect(
                    await steps.waitForStubCall(async (stub) => {
                        await sleep(1);
                        stub('success');
                        return 'action!';
                    })
                ).to.eql({
                    callArgs: ['success'],
                    returned: 'action!'
                });
            })
        );
        it(
            'times out when the stub is not called',
            withSteps(async (steps) => {
                await expect(
                    steps
                        .waitForStubCall(async (stub) => {
                            await sleep(100);
                            stub('success');
                        })
                        .timeout(10)
                ).to.eventually.rejectedWith('Timed out');
            })
        );
    });

    describe('sleep', () => {
        it(
            'sleep',
            withSteps(async (steps) => {
                steps.defaults.step.timeout = 50;
                expect(await steps.withTimeout(steps.sleep(1))).not.to.throw;
                await expect(steps.withTimeout(steps.sleep(1000))).to.eventually.rejectedWith('Timed out');
            })
        );
    });
});
