import { expect } from 'chai';
import { createDisposalGroup, disposeAfter, initAndDisposeAfter } from '../dispose';

describe('dispose', () => {
    describe('disposeAfter default behavior', () => {
        const events = [] as string[];

        it('setup dispose after', () => {
            disposeAfter(() => events.push('first in default group'), 'first default');
            disposeAfter(() => events.push('second in default group'), 'second default');
            disposeAfter(() => events.push('last in default group'), 'last default');
        });

        it('runs the dispose functions in reverse order', () => {
            expect(events).to.eql(['last in default group', 'second in default group', 'first in default group']);
        });
    });

    describe('disposeAfter with groups', () => {
        const events = [] as string[];
        before(() => {
            createDisposalGroup('before', { before: 'default' });
            createDisposalGroup('after', { after: 'default' });
        });

        it('setup dispose after', () => {
            disposeAfter(() => events.push('first in default group'), 'first default');
            disposeAfter(() => events.push('last in default group'), 'last default');
            disposeAfter(() => events.push('first in before'), { group: 'before', name: 'first in before' });
            disposeAfter(() => events.push('last in before'), { group: 'before', name: 'last in before' });
            disposeAfter(() => events.push('first in after'), { group: 'after', name: 'first in after' });
            disposeAfter(() => events.push('last in after'), { group: 'after', name: 'last in after' });
        });

        it('runs the dispose functions of a group in reverse order', () => {
            expect(events).to.eql([
                'last in before',
                'first in before',
                'last in default group',
                'first in default group',
                'last in after',
                'first in after',
            ]);
        });
    });
});

describe('initAndDisposeAfter', () => {
    const events = [] as string[];

    it('inits the target object', async () => {
        const initiable = {
            init: (arg: string) => {
                events.push('init', arg);
                return 'initialized';
            },
            dispose: () => events.push('dispose'),
        };
        expect(await initAndDisposeAfter(initiable, { name: 'dispose initiable' }, 'arg')).to.eql('initialized');
    });

    it('disposed of the target', () => {
        expect(events).to.eql(['init', 'arg', 'dispose']);
    });
});
