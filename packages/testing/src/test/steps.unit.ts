import { sleep } from 'promise-assist';
import { expect, use } from 'chai';
import asPromised from 'chai-as-promised';
import { withSteps } from '../steps';

use(asPromised);

describe('withSteps', () => {
    it('each step timeout extends the test timeout', withSteps(async (step)=>{
        step.mochaCtx.timeout(2)
        await expect(step.promise(new Promise(()=>0)).timeout(2)).to.eventually.rejectedWith('Timed out')
        await expect(step.poll(()=>0, ()=>false).timeout(2)).to.eventually.rejectedWith('Timed out')
        await expect(step.firstCall({m:()=>0}, 'm').timeout(2)).to.eventually.rejectedWith('Timed out')
    }))

    describe('promise step', () => {
        const LONG_TIME = 10;
        const SHORT_TIME = 1;
        it(
            'times out with the description',
            withSteps(async (step) => {
                await expect(
                    step.promise(sleep(LONG_TIME)).timeout(SHORT_TIME).description('test')
                ).to.eventually.rejectedWith('test');
            })
        );
        it(
            'fulfils the promise in the allotted time',
            withSteps(async (step) => {
                expect(await step.promise(sleep(SHORT_TIME).then(() => 'success')).timeout(LONG_TIME)).to.equal(
                    'success'
                );
            })
        );
    });
    describe('poll step', () => {
        it(
            'polls on the action every interval',
            withSteps(async (step) => {
                let count = 0;
                const action = () => ++count;
                expect(
                    await step
                        .poll(action, () => count > 3)
                        .interval(1)
                        .timeout(20)
                ).to.equal(4);
                count = 0;
                await expect(
                    step
                        .poll(action, () => count > 3)
                        .interval(5)
                        .timeout(10)
                        .description('timeout')
                ).to.eventually.rejectedWith('timeout');
            })
        );
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
                it(
                    'fails when the action throws',
                    withSteps(async (step) => {
                        await expect(step.poll(throwingAction, () => true)).to.eventually.rejectedWith('action error');
                    })
                );
                it(
                    'fails when the predicate throws',
                    withSteps(async (step) => {
                        await expect(step.poll(() => 0, throwingPredicate)).to.eventually.rejectedWith(
                            'predicate error'
                        );
                    })
                );
            });
            describe('allowErrors', () => {
                it(
                    'action errors',
                    withSteps(async (step) => {
                        expect(await step.poll(throwingAction, () => true).allowErrors(true, false)).to.equal(
                            'success'
                        );

                        await expect(step.poll(throwingAction, throwingPredicate)).to.eventually.rejectedWith(
                            'predicate error'
                        );
                    })
                );
                it(
                    'predicate errors',
                    withSteps(async (step) => {
                        expect(
                            await step
                                .poll(() => 'success', throwingPredicate)
                                .allowErrors(false)
                                .interval(1)
                                .timeout(10)
                        ).to.equal('success');
                        await expect(step.poll(throwingAction, throwingPredicate)).to.eventually.rejectedWith(
                            'action error'
                        );
                    })
                );
                it(
                    'all errors',
                    withSteps(async (step) => {
                        expect(
                            await step.poll(throwingAction, throwingPredicate).allowErrors().interval(1).timeout(10)
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
                    })
                );
            });
        });
    });
    describe('firstCall', () => {
        let target:{a:number,b:string,method:(a:number,b:string)=>void};
        beforeEach(()=>{
            target = {
                a:0,
                b:'',
                method(a:number, b:string){
                    this.a = a
                    this.b = b
                }
            }
        })
        it(
            'resolves with the call arguments',
            withSteps(async (step) => {
                const call = step.firstCall(target, 'method')
                target.method(1,'success')
                expect(await call).to.eql([1,'success'])
            })
        );
        it(
            'times out if not called',
            withSteps(async (step) => {
                await expect( step.firstCall(target, 'method').timeout(1).description('timeout')).to.eventually.rejectedWith('timeout')
            })
        );
        it(
            'calls thru to the original method',
            withSteps(async (step) => {
                const call = step.firstCall(target, 'method')
                target.method(1,'success')
                await call
                expect(target).to.deep.contain({a:1, b:'success'})
            })
        );
        it(
            'restores the original method after the step is done',
            withSteps(async (step) => {
                const originalMethod = target.method
                const call = step.firstCall(target, 'method')
                target.method(1,'success')
                await call
                expect(target.method).to.equal(originalMethod)
            })
        );
    });
});
