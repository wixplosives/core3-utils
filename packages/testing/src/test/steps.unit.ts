import { expect, use } from 'chai';
import asPromised from 'chai-as-promised';
import {
    allWithTimeout,
    defaults,
    mochaCtx,
    poll,
    sleep,
    step,
    timeDilation,
    waitForSpyCall,
    waitForStubCall,
    withTimeout,
} from '..';

use(asPromised);

describe('steps', () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    it('each step timeout extends the test timeout', async () => {
        const TIMEOUT = 30;
        const SAFETY_MARGIN = 20;
        mochaCtx()?.timeout(1_000);
        defaults().step.safetyMargin = SAFETY_MARGIN;
        defaults().step.timeout = TIMEOUT;
        await Promise.all([
            expect(withTimeout(new Promise(() => 0))).to.eventually.rejectedWith('Timed out'),
            expect(
                poll(
                    () => 0,
                    () => false
                )
            ).to.eventually.rejectedWith('Timed out'),
            expect(waitForSpyCall({ m: () => 0 }, 'm')).to.eventually.rejectedWith('Timed out'),
            expect(waitForStubCall(() => 0)).to.eventually.rejectedWith('Timed out'),
        ]);
        expect(mochaCtx()?.timeout()).to.be.approximately(
            1_000 + timeDilation() * (+4 * TIMEOUT + 4 * SAFETY_MARGIN),
            2
        );
    });

    describe(`usage in beforeEach`, () => {
        beforeEach(async () => {
            defaults().poll.interval = 1234;
            await sleep(1);
            await sleep(1);
            await sleep(1);
        });
        it(`does not share step count with beforeEach`, async () => {
            await expect(withTimeout(sleep(100)).timeout(1)).to.be.eventually.rejectedWith('step 1');
        });
        it(`share defaults with beforeEach`, () => {
            expect(defaults().poll.interval).to.equal(1234);
        });
    });
});

describe('withTimeout step', () => {
    const LONG_TIME = 10;
    const SHORT_TIME = 1;
    it('times out with the description', async () => {
        await expect(withTimeout(sleep(LONG_TIME)).timeout(SHORT_TIME).description('test')).to.eventually.rejectedWith(
            'test'
        );
    });
    it('fulfils the promise in the allotted time', async () => {
        expect(await withTimeout(sleep(SHORT_TIME).then(() => 'success')).timeout(LONG_TIME)).to.equal('success');
    });
    it('handles changes to timeout', async () => {
        await withTimeout(sleep(10)).timeout(1000).timeout(20);
        await withTimeout(sleep(10)).timeout(2).timeout(20);
    });
});

describe('allWithTimeout step', () => {
    const LONG_TIME = 10;
    const SHORT_TIME = 1;
    it('times out with the description', async () => {
        await expect(
            allWithTimeout(
                sleep(LONG_TIME).then(() => 1),
                sleep(SHORT_TIME).then(() => 'a'),
                sleep(SHORT_TIME).then(() => [])
            )
                .timeout(SHORT_TIME)
                .description('test')
        ).to.eventually.rejectedWith('test');
    });
    it('fulfils the promise in the allotted time', async () => {
        const actual: [number, string, any[]] = await allWithTimeout(
            sleep(SHORT_TIME).then(() => 1),
            sleep(SHORT_TIME).then(() => 'a'),
            sleep(SHORT_TIME).then(() => [])
        );
        expect(actual).to.eql([1, 'a', []]);
    });
});

describe('step', () => {
    it('rejects with a step error', async () => {
        await expect(step(Promise.reject('source info')).description('step info')).to.eventually.rejectedWith(
            'step info'
        );
        await expect(step(Promise.reject('source info')).description('step info')).to.eventually.rejectedWith(
            'source info'
        );
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
    it('resolves with the call arguments', async () => {
        const call = waitForSpyCall(target, 'method');
        target.method(1, 'success');
        expect(await call).to.eql([1, 'success']);
    });
    it('times out if not called', async () => {
        await expect(waitForSpyCall(target, 'method').timeout(1).description('timeout')).to.eventually.rejectedWith(
            'timeout'
        );
    });
    it('calls thru to the original method', async () => {
        const call = waitForSpyCall(target, 'method');
        target.method(1, 'success');
        await call;
        expect(target).to.deep.contain({ a: 1, b: 'success' });
    });
    it('restores the original method after the step is done', async () => {
        const originalMethod = target.method;
        const call = waitForSpyCall(target, 'method');
        target.method(1, 'success');
        await call;
        expect(target.method).to.equal(originalMethod);
    });
});

describe('waitForStubCall', () => {
    it('resolves to {callArgs, returned}', async () => {
        expect(
            await waitForStubCall(async (stub) => {
                await sleep(1);
                stub('success');
                return 'action!';
            })
        ).to.eql({
            callArgs: ['success'],
            returned: 'action!',
        });
    });

    it('times out when the stub is not called', async () => {
        await expect(
            waitForStubCall(async (stub) => {
                await sleep(100);
                stub('success');
            }).timeout(10)
        ).to.eventually.rejectedWith('Timed out');
    });

    describe('sleep', () => {
        it('sleep', async () => {
            defaults().step.timeout = 50;
            expect(await withTimeout(sleep(1))).not.to.throw;
            await expect(withTimeout(sleep(1000))).to.eventually.rejectedWith('Timed out');
        });
    });
});
