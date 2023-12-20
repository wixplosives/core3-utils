import { expect } from 'chai';
import { SafeDisposable } from '../disposables/safe-disposable';
import { deferred, sleep } from 'promise-assist';

describe('SafeDisposable class', () => {
    describe('dispose', () => {
        it('sets isDisposed to true', async () => {
            const disposable = new SafeDisposable('test');
            expect(disposable.isDisposed).to.be.false;
            await disposable.dispose();
            expect(disposable.isDisposed).to.be.true;
        });
        it('executes inner disposal functions', async () => {
            const disposables = new SafeDisposable('test');
            let wasDisposed = false;
            disposables.add('wasDisposed', () => (wasDisposed = true));

            expect(wasDisposed).to.be.false;
            await disposables.dispose();
            expect(wasDisposed).to.be.true;
        });
    });
    describe('guard', () => {
        it('throws if isDisposed is true', () => {
            const disposable = new SafeDisposable('test');
            disposable.add('sleep', () => sleep(20));
            void disposable.dispose();
            expect(() => disposable.guard()).to.throw('Instance was disposed');
        });
        describe('while disposing', () => {
            it('does not throws if usedWhileDisposing is true and disposal did not finish', async () => {
                const disposable = new SafeDisposable('test');
                disposable.add('sleep', () => sleep(20));
                const disposing = disposable.dispose();
                expect(() => disposable.guard({ usedWhileDisposing: true })).not.to.throw();
                await disposing;
                expect(() => disposable.guard({ usedWhileDisposing: true })).to.throw('Instance was disposed');
            });
        });
        describe('when no function is passed', () => {
            it('it does not block disposal', async () => {
                const disposable = new SafeDisposable('test');
                disposable.guard();
                await disposable.dispose();
            });
        });

        /*
            The following suite tests the behavior of the "using" keyword, 
            which is not supported in browsers.
            Uncomment when they are supported.


        describe('sync/async with "using" keyword', () => {
            it('sync does not delay disposal', async () => {
                const disposable = new SafeDisposable('name');
                let disposeCalled = false;
                disposable.add('disposeCalled', () => {
                    disposeCalled = true;
                });
                {
                    using _ = disposable.guard();
                }
                const disposing = disposable.dispose();
                await sleep(1);
                expect(disposeCalled).to.be.true;

                await disposing;
            });
            it('async delays disposal until the guard is done', async () => {
                const disposables = new SafeDisposable('test');
                let disposeCalled = false;
                disposables.add('disposeCalled', () => {
                    disposeCalled = true;
                });

                let disposing!: Promise<void>;
                {
                    using _ = disposables.guard();
                    disposing = disposables.dispose();
                    await sleep(1);

                    expect(disposables.isDisposed, 'isDisposed').to.be.true;
                    expect(disposeCalled, 'disposeCalled').to.be.false;
                }
                await disposing;
                expect(disposeCalled, 'disposeCalled after done()').to.be.true;
            });
        });
        */
        describe('sync/async without "using" keyword', () => {
            it('sync does not delay disposal', async () => {
                const disposable = new SafeDisposable('name');
                let disposeCalled = false;
                disposable.add('disposeCalled', () => {
                    disposeCalled = true;
                });
                expect(
                    disposable.guard(() => 'guarded return value'),
                    'guard return value',
                ).to.eql('guarded return value');
                const disposing = disposable.dispose();
                await sleep(1);
                expect(disposeCalled).to.be.true;

                await disposing;
            });
            it('async delays disposal until the guard is done', async () => {
                const disposables = new SafeDisposable('test');
                let disposeCalled = false;
                disposables.add('disposeCalled', () => {
                    disposeCalled = true;
                });

                let disposing!: Promise<void>;
                const result = disposables.guard(async () => {
                    disposing = disposables.dispose();
                    await sleep(1);

                    expect(disposables.isDisposed, 'isDisposed').to.be.true;
                    expect(disposeCalled, 'disposeCalled').to.be.false;
                    return 'guarded return value';
                });
                expect(await result, 'guard return value').to.eql('guarded return value');
                await disposing;
                expect(disposeCalled, 'disposeCalled after done()').to.be.true;
            });
        });
    });
    describe('setTimeout', () => {
        it('before disposal identical to setTimeout', async () => {
            const disposable = new SafeDisposable('test');
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
            const disposables = new SafeDisposable('test');
            let timeoutTriggered = false;
            disposables.setTimeout(() => {
                timeoutTriggered = true;
            }, 10);
            await disposables.dispose();
            await sleep(20);
            expect(timeoutTriggered).to.be.false;
        });
    });
    describe('setInterval', () => {
        it('identical to setInterval, but cleared after disposal', async () => {
            const disposables = new SafeDisposable('test');
            let triggerCount = 0;
            disposables.setInterval(() => {
                triggerCount++;
            }, 1);
            await sleep(20);
            expect(triggerCount).to.be.greaterThan(0);
            await disposables.dispose();
            triggerCount = 0;
            await sleep(20);
            expect(triggerCount).to.equal(0);
        });
    });
    // describe('"using" keyword', () => {
    //     it('disposes when the using block exists', async () => {
    //         const spy = sinon.spy();
    //         {
    //             await using disposable = new SafeDisposable('test');
    //             disposable.add('wasDisposed', spy);
    //         }
    //         expect(spy.callCount).to.equal(1);
    //     });
    // });
});
