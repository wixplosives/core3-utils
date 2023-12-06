import { expect, use } from 'chai';
import { sleep } from 'promise-assist';
import { createDisposables } from '../disposables';
import asPromised from 'chai-as-promised';
use(asPromised);

describe('disposables', () => {
    describe('single disposal group', () => {
        it('disposes in reverse order', async () => {
            const disposed: number[] = [];
            const disposables = createDisposables('test');
            disposables.add('first', () => disposed.push(1));
            disposables.add({ name: 'second', dispose: () => disposed.push(2) });
            await disposables.dispose();
            expect(disposed).to.deep.equal([2, 1]);
        });
        it('awaits each disposable', async () => {
            const disposed: number[] = [];
            const disposables = createDisposables('test');
            disposables.add('sync 1', () => disposed.push(1));
            disposables.add('sleep 2', async () => {
                await sleep(10);
                disposed.push(2);
            });
            disposables.add('sleep 3', async () => {
                await sleep(50);
                disposed.push(3);
            });
            await disposables.dispose();
            expect(disposed).to.deep.equal([3, 2, 1]);
        });
        it('times out when the disposal takes too long', async () => {
            const disposables = createDisposables('test');
            disposables.add({
                name: 'slow',
                timeout: 1,
                dispose: async () => {
                    await sleep(100);
                },
            });
            await expect(disposables.dispose()).to.eventually.be.rejectedWith('Disposal timed out: "[test]: slow"');
        });
        it('fail with the name of specific dispose', async () => {
            const disposables = createDisposables('test');
            disposables.add({
                name: 'disposing with error',
                dispose: () => {
                    throw new Error('failed!');
                },
            });

            try {
                await disposables.dispose();
                expect.fail('should have thrown');
            } catch (e) {
                const message = (e as Error).message;
                expect(message, 'error message match pattern').to.matches(
                    /Disposal failed: "\[test\]: disposing with error"\nError: failed!/
                );
            }
        });
    });
    describe('initial disposal group', () => {
        it('disposes in insertion order', async () => {
            const disposed: number[] = [];
            const disposables = createDisposables('test', ['A', 'B']);
            disposables.add('B', () => disposed.push(2));
            disposables.add('A', () => disposed.push(1));
            await disposables.dispose();
            expect(disposed).to.deep.equal([1, 2]);
        });
        it('allow adding additional groups', async () => {
            const disposed: number[] = [];
            const disposables = createDisposables('test', ['A', 'C']);
            disposables.registerGroup('B', { before: 'C' });
            disposables.add({ name: 'A', group: 'A', dispose: () => disposed.push(1) });
            disposables.add({ name: 'B', group: 'B', dispose: () => disposed.push(2) });
            disposables.add({ name: 'C', group: 'C', dispose: () => disposed.push(3) });
            await disposables.dispose();
            expect(disposed).to.deep.equal([1, 2, 3]);
        });
    });
    describe('disposal groups', () => {
        describe('constraints validation', () => {
            it('throws for missing groups', () => {
                const groups = createDisposables('test');
                expect(() => groups.registerGroup('group1', { before: 'group2' })).to.throw(
                    `Invalid constraint: "before: group2" - group not found`
                );
            });
            it('throws for no constraints', () => {
                const groups = createDisposables('test');
                expect(() => groups.registerGroup('group1', [])).to.throw(
                    `Invalid disposal group: must have at least one constraint`
                );
            });
            it('throws for contradictory constraints', () => {
                const groups = createDisposables('test');
                groups.registerGroup('before', { before: 'default' });
                groups.registerGroup('after', { after: 'default' });
                expect(() => groups.registerGroup('valid', { before: 'after', after: 'default' })).not.to.throw();
                expect(() => groups.registerGroup('invalid', { before: 'before', after: 'after' })).to.throw(
                    'Invalid constraints: after runs after before, which contradicts prior constraints'
                );
            });
            it('requires a unique group name', () => {
                const groups = createDisposables('test');
                expect(() => groups.registerGroup('default', { before: 'default' })).to.throw(
                    `Invalid group: "default" already exists`
                );
            });
        });
        describe('add and remove', () => {
            it('add (with a string as options)', () => {
                const groups = createDisposables('test');
                groups.add('first', () => void 0);
                expect(groups.list().groups[0]?.disposables).to.have.length(1);
            });
            it('add (with options obj)', () => {
                const groups = createDisposables('test');
                groups.registerGroup('first', { before: 'default' });
                groups.add({
                    name: 'lucky',
                    group: 'first',
                    timeout: 1,
                    dispose: () => void 0,
                });
                expect(groups.list().groups[0]?.disposables).to.eql([
                    {
                        name: '[test]: lucky',
                        timeout: 1,
                    },
                ]);
            });
            it('add returns a remove func', () => {
                const disposables = createDisposables('test');
                const remove = disposables.add('no effect', () => void 0);

                expect(disposables.list().groups[0]?.disposables).to.have.length(1);
                remove();

                expect(disposables.list().groups[0]?.disposables).to.have.length(0);
            });
            it('added disposables can be removed by reference', () => {
                const disposables = createDisposables('test');
                const disposable = () => void 0;
                disposables.add('no effect', disposable);

                expect(disposables.list().groups[0]?.disposables).to.have.length(1);
                disposables.remove(disposable);

                expect(disposables.list().groups[0]?.disposables).to.have.length(0);
            });
            it('removing missing disposables have no effect', () => {
                const disposables = createDisposables('test');
                const disposable = () => void 0;
                disposables.add('no effect', disposable);

                expect(disposables.list().groups[0]?.disposables).to.have.length(1);
                disposables.remove(() => void 0);

                expect(disposables.list().groups[0]?.disposables).to.have.length(1);
            });
        });
        describe('list', () => {
            it('returns the list of groups', () => {
                const groups = createDisposables('test');
                groups.registerGroup('first', { before: 'default' });
                groups.add({
                    name: '1',
                    group: 'first',
                    timeout: 1,
                    dispose: () => void 0,
                });
                groups.add({
                    name: '2',
                    group: 'first',
                    timeout: 10,
                    dispose: () => void 0,
                });
                groups.add({
                    name: '3',
                    timeout: 100,
                    dispose: () => void 0,
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
