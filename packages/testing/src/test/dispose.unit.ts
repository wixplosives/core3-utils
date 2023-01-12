import { expect } from 'chai';
import { AFTER, BEFORE, disposeAfter, initAndDisposeAfter } from '../dispose';

describe('dispose', () => {
    const events = [] as string[];

    it('setup dispose after', () => {
        disposeAfter(() => events.push('first in default group'));
        disposeAfter(() => events.push('second in default group'));
        disposeAfter(() => events.push('last in default group'));
        disposeAfter(() => events.push('first in group AFTER'), AFTER);
        disposeAfter(() => events.push('second in group AFTER'), AFTER);
        disposeAfter(() => events.push('last in group AFTER'), AFTER);
        disposeAfter(() => events.push('first in group BEFORE'), BEFORE);
        disposeAfter(() => events.push('second in group BEFORE'), BEFORE);
        disposeAfter(() => events.push('last in group BEFORE'), BEFORE);
    });

    it('runs the dispose functions of a group in reverse order', () => {
        expect(events).to.eql([
            'last in group BEFORE',
            'second in group BEFORE',
            'first in group BEFORE',
            'last in default group',
            'second in default group',
            'first in default group',
            'last in group AFTER',
            'second in group AFTER',
            'first in group AFTER',
        ]);
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
        expect(await initAndDisposeAfter(initiable, 'arg')).to.eql('initialized');
    });

    it('disposed of the target', () => {
        expect(events).to.eql(['init', 'arg', 'dispose']);
    });
});
