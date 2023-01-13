import { expect } from 'chai';
import { DisposalGroups } from '../disposal-group';

describe('DisposalGroups', () => {
    describe('constraints validation', () => {
        it('throws for missing groups', () => {
            const groups = new DisposalGroups();
            expect(() => groups.registerGroup('group1', { before: 'group2' })).to.throw(
                `Invalid constraint: "before: group2" - group not found`
            );
        });
        it('throws for no constraints', () => {
            const groups = new DisposalGroups();
            expect(() => groups.registerGroup('group1', [])).to.throw(
                `Invalid disposal group: must have at least one constraint`
            );
        });
        it('throws for contradictory constraints', () => {
            const groups = new DisposalGroups();
            groups.registerGroup('before', { before: 'default' });
            groups.registerGroup('after', { after: 'default' });
            expect(() => groups.registerGroup('valid', { before: 'after', after: 'default' })).not.to.throw();
            expect(() => groups.registerGroup('invalid', { before: 'before', after: 'after' })).to.throw(
                'Invalid constraints: after runs after before, which contradicts prior constraints'
            );
        });
    });
});
