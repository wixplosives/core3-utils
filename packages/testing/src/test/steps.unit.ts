import { sleep } from 'promise-assist';
import { expect, use } from 'chai';
import asPromised from 'chai-as-promised';
import { withSteps } from '../steps';

use(asPromised);

describe('withSteps', () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    withSteps.it('each step timeout extends the test timeout', async (step) => {
        const TIMEOUT = 30;
        const SAFETY_MARGIN = 20;
        step.mochaCtx.timeout(1_000);
        step.defaults.step.safetyMargin = SAFETY_MARGIN;
        step.defaults.step.timeout = TIMEOUT;
        await Promise.all([
            expect(step.promise(new Promise(() => 0))).to.eventually.rejectedWith('Timed out'),
            expect(
                step.poll(
                    () => 0,
                    () => false
                )
            ).to.eventually.rejectedWith('Timed out'),
            expect(step.firstCall({ m: () => 0 }, 'm')).to.eventually.rejectedWith('Timed out'),
            expect(step.asyncStub(() => 0)).to.eventually.rejectedWith('Timed out'),
        ]);
        expect(step.mochaCtx.timeout()).to.equal(1_000 + TIMEOUT * 4 + SAFETY_MARGIN * 4);
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

    describe('asyncStub', () => {
        withSteps.it('resolves to {callArgs, returned}', async (steps) => {
            expect(
                await steps.asyncStub(async (stub) => {
                    await sleep(1);
                    stub('success');
                    return 'action!';
                })
            ).to.eql({
                callArgs: ['success'],
                returned: 'action!',
            });
        });
        withSteps.it('times out when the stub is not called', async (steps) => {
            await expect(
                steps
                    .asyncStub(async (stub) => {
                        await sleep(100);
                        stub('success');
                    })
                    .timeout(10)
            ).to.eventually.rejectedWith('Timed out');
        });
    });
});
