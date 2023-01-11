import { expect } from 'chai';
import { AFTER, BEFORE, disposeAfter } from '../dispose';

describe('dispose', () => {
    const a = [] as string[];

    it('setup dispose after', () => {
        disposeAfter(() => a.push('first in default group'));
        disposeAfter(() => a.push('second in default group'));
        disposeAfter(() => a.push('last in default group'));
        disposeAfter(() => a.push('first in group AFTER'), AFTER);
        disposeAfter(() => a.push('second in group AFTER'), AFTER);
        disposeAfter(() => a.push('last in group AFTER'), AFTER);
        disposeAfter(() => a.push('first in group BEFORE'), BEFORE);
        disposeAfter(() => a.push('second in group BEFORE'), BEFORE);
        disposeAfter(() => a.push('last in group BEFORE'), BEFORE);
    });

    it('runs the dispose functions of a group in reverse order', () => {
        expect(a).to.eql([
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
