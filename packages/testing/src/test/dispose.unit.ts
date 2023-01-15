import { expect } from 'chai';
import { createDisposalGroup, disposeAfter, initAndDisposeAfter } from '../dispose';

describe('dispose', () => {
    describe('disposeAfter default behavior', () => {
        const events = [] as string[];

        it('setup dispose after', () => {
            disposeAfter(() => events.push('first in default group'));
            disposeAfter(() => events.push('second in default group'));
            disposeAfter(() => events.push('last in default group'));
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
            disposeAfter(() => events.push('first in default group'));
            disposeAfter(() => events.push('last in default group'));
            disposeAfter(() => events.push('first in before'), 'before');
            disposeAfter(() => events.push('last in before'), 'before');
            disposeAfter(() => events.push('first in after'), 'after');
            disposeAfter(() => events.push('last in after'), 'after');
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
        expect(await initAndDisposeAfter(initiable, 'default', 'arg')).to.eql('initialized');
    });

    it('disposed of the target', () => {
        expect(events).to.eql(['init', 'arg', 'dispose']);
    });
});
