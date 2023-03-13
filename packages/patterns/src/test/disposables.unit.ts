import { expect } from 'chai';
import { sleep } from 'promise-assist';
import { createDisposables } from '../disposables';

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
    });
});
