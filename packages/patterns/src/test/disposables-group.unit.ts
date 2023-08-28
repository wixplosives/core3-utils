import { expect, use } from 'chai';
import { sleep } from 'promise-assist';
import { createDisposables } from '../disposables';
import asPromised from 'chai-as-promised';
use(asPromised);

describe('disposables', () => {
    describe('single disposal group', () => {
        it('disposes in reverse order', async () => {
            const disposed: number[] = [];
            const disposables = createDisposables();
            disposables.add(() => disposed.push(1));
            disposables.add({ dispose: () => disposed.push(2) });
            await disposables.dispose();
            expect(disposed).to.deep.equal([2, 1]);
        });
        it('awaits each disposable', async () => {
            const disposed: number[] = [];
            const disposables = createDisposables();
            disposables.add(() => disposed.push(1));
            disposables.add(async () => {
                await sleep(10);
                disposed.push(2);
            });
            disposables.add(async () => {
                await sleep(50);
                disposed.push(3);
            });
            await disposables.dispose();
            expect(disposed).to.deep.equal([3, 2, 1]);
        });
        it('times out when the disposal takes too long', async () => {
            const disposables = createDisposables();
            disposables.add(
                async () => {
                    await sleep(100);
                },
                { name: 'slow', timeout: 1 }
            );
            await expect(disposables.dispose()).to.eventually.be.rejectedWith('Disposal timed out: "slow"');
        });
        describe('disposal error handling', () => {
            it('shows the last line in the user code', async () => {
                const disposables = createDisposables();
                let err: Error;
                disposables.add(
                    () => {
                        err = new Error('test');
                        throw err;
                    },
                    { name: 'error in dispose' }
                );
                try {
                    await disposables.dispose();
                } catch (e) {
                    expect((e as Error).stack).to.equal(err!.stack);
                    expect((e as Error).message).to.equal(err!.message);
                }
            });
            it('timeout error stack', async () => {
                const disposables = createDisposables();
                const err = new Error('Disposal timed out: "slow" after 1ms');
                const ignoreLine = (err: Error) => err.stack?.replaceAll(/:\d+:\d+/g, ':XX:XX');
                const stack = ignoreLine(err);

                disposables.add(
                    async () => {
                        await sleep(100);
                    },
                    { name: 'slow', timeout: 1 }
                );
                try {
                    await disposables.dispose();
                } catch (e) {
                    expect(ignoreLine(e as Error)).to.equal(stack);
                }
            });
        });
    });

    describe('disposal groups', () => {
        describe('constraints validation', () => {
            it('throws for missing groups', () => {
                const groups = createDisposables();
                expect(() => groups.registerGroup('group1', { before: 'group2' })).to.throw(
                    `Invalid constraint: "before: group2" - group not found`
                );
            });
            it('throws for no constraints', () => {
                const groups = createDisposables();
                expect(() => groups.registerGroup('group1', [])).to.throw(
                    `Invalid disposal group: must have at least one constraint`
                );
            });
            it('throws for contradictory constraints', () => {
                const groups = createDisposables();
                groups.registerGroup('before', { before: 'default' });
                groups.registerGroup('after', { after: 'default' });
                expect(() => groups.registerGroup('valid', { before: 'after', after: 'default' })).not.to.throw();
                expect(() => groups.registerGroup('invalid', { before: 'before', after: 'after' })).to.throw(
                    'Invalid constraints: after runs after before, which contradicts prior constraints'
                );
            });
            it('requires a unique group name', () => {
                const groups = createDisposables();
                expect(() => groups.registerGroup('default', { before: 'default' })).to.throw(
                    `Invalid group: "default" already exists`
                );
            });
        });
        describe('add and remove', () => {
            it('add (with a string as options)', () => {
                const groups = createDisposables();
                groups.registerGroup('first', { before: 'default' });
                groups.add(() => void 0, 'first');
                expect(groups.list().groups[0]?.disposables).to.have.length(1);
            });
            it('add (with options obj)', () => {
                const groups = createDisposables();
                groups.registerGroup('first', { before: 'default' });
                groups.add(() => void 0, {
                    group: 'first',
                    name: 'lucky',
                    timeout: 1,
                });
                expect(groups.list().groups[0]?.disposables).to.eql([
                    {
                        name: 'lucky',
                        timeout: 1,
                    },
                ]);
            });
            it('add returns a remove func', () => {
                const disposables = createDisposables();
                const remove = disposables.add(() => void 0);

                expect(disposables.list().groups[0]?.disposables).to.have.length(1);
                remove();

                expect(disposables.list().groups[0]?.disposables).to.have.length(0);
            });
            it('added disposables can be removed by reference', () => {
                const disposables = createDisposables();
                const disposable = () => void 0;
                disposables.add(disposable);

                expect(disposables.list().groups[0]?.disposables).to.have.length(1);
                disposables.remove(disposable);

                expect(disposables.list().groups[0]?.disposables).to.have.length(0);
            });
            it('removing missing disposables have no effect', () => {
                const disposables = createDisposables();
                const disposable = () => void 0;
                disposables.add(disposable);

                expect(disposables.list().groups[0]?.disposables).to.have.length(1);
                disposables.remove(() => void 0);

                expect(disposables.list().groups[0]?.disposables).to.have.length(1);
            });
        });
        describe('list', () => {
            it('returns the list of groups', () => {
                const groups = createDisposables();
                groups.registerGroup('first', { before: 'default' });
                groups.add(() => void 0, {
                    name: '1',
                    group: 'first',
                    timeout: 1,
                });
                groups.add(() => void 0, {
                    name: '2',
                    group: 'first',
                    timeout: 10,
                });
                groups.add(() => void 0, {
                    name: '3',
                    timeout: 100,
                });

                const list = groups.list();
                expect(list.totalTimeout).to.eql(111);
                expect(list.groups).to.have.length(2);
                expect(list.groups[0]?.totalTimeout).to.eql(11);
                expect(list.groups[0]?.disposables).to.have.length(2);
                expect(list.groups[1]?.totalTimeout).to.eql(100);
                expect(list.groups[1]?.disposables).to.have.length(1);
            });
        });
    });
});
