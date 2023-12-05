import { expect } from 'chai';
import { Disposable } from '../disposables/disposable';
import { deferred, sleep } from 'promise-assist';

describe('Disposable class', () => {
    describe('dispose', () => {
        it('sets isDisposed to true', async () => {
            const disposable = new Disposable();
            expect(disposable.isDisposed).to.be.false;
            await disposable.dispose();
            expect(disposable.isDisposed).to.be.true;
        });
        it('executes inner disposal functions', async () => {
            const disposable = new Disposable();
            let wasDisposed = false;
            disposable.disposables.add('wasDisposed', () => (wasDisposed = true));

            expect(wasDisposed).to.be.false;
            await disposable.dispose();
            expect(wasDisposed).to.be.true;
        });
    });
    describe('disposalGuard', () => {
        it('throws if isDisposed is true', () => {
            const disposable = new Disposable();
            disposable.disposables.add('sleep', () => sleep(20));
            void disposable.dispose();
            expect(() => disposable.disposalGuard()).to.throw('Instance was disposed');
        });
        it('does not throws if usedWhileDisposing is true and disposal did not finish', async () => {
            const disposable = new Disposable();
            disposable.disposables.add('sleep', () => sleep(20));
            const disposing = disposable.dispose();
            expect(() => disposable.disposalGuard({ async: false, usedWhileDisposing: true })).not.to.throw();
            await disposing;
            expect(() => disposable.disposalGuard({ async: false, usedWhileDisposing: true })).to.throw(
                'Instance was disposed'
            );
        });
        describe('sync/async', () => {
            it('sync does not delay disposal', async () => {
                const disposable = new Disposable();
                let disposeCalled = false;
                disposable.disposables.add('disposeCalled', () => {
                    disposeCalled = true;
                });
                disposable.disposalGuard({ async: false });
                const disposing = disposable.dispose();
                await sleep(1);
                expect(disposeCalled).to.be.true;

                await disposing;
            });
            it('async (default) delays disposal until the guard is done', async () => {
                const disposable = new Disposable();
                let disposeCalled = false;
                disposable.disposables.add('disposeCalled', () => {
                    disposeCalled = true;
                });

                const done = disposable.disposalGuard();
                const disposing = disposable.dispose();
                await sleep(1);

                expect(disposable.isDisposed, 'isDisposed').to.be.true;
                expect(disposeCalled, 'disposeCalled').to.be.false;

                done();
                await disposing;
                expect(disposeCalled, 'disposeCalled after done()').to.be.true;
            });
        });
    });
    describe('setTimeout', () => {
        it('before disposal identical to setTimeout', async () => {
            const disposable = new Disposable();
            const { promise, resolve } = deferred();
            let timeoutTriggered = false;
            disposable.setTimeout(() => {
                resolve();
                timeoutTriggered = true;
            }, 1);
            await promise;
            expect(timeoutTriggered).to.be.true;
        });
        it('is cleared after disposal', async () => {
            const disposable = new Disposable();
            let timeoutTriggered = false;
            disposable.setTimeout(() => {
                timeoutTriggered = true;
            }, 10);
            await disposable.dispose();
            await sleep(20);
            expect(timeoutTriggered).to.be.false;
        });
    });
    describe('setInterval', () => {
        it('identical to setInterval, but cleared after disposal', async () => {
            const disposable = new Disposable();
            let triggerCount = 0;
            disposable.setInterval(() => {
                triggerCount++;
            }, 1);
            await sleep(20);
            expect(triggerCount).to.be.greaterThan(0);
            await disposable.dispose();
            triggerCount = 0;
            await sleep(20);
            expect(triggerCount).to.equal(0);
        });
    });
});
