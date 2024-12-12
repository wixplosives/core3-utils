import { shuffle } from '@wixc3/common';
import { getCtxRoot, _before } from './mocha-helpers.js';

let _shouldRandomize = false;
let wasSet = false;

/**
 * Randomizes tests order
 *
 * To avoid confusion, it can only be set once, before the testing begins (i.e. not in a running test)
 */
export function randomizeTestsOrder(shouldRandomize = true) {
    if (wasSet && shouldRandomize !== _shouldRandomize) {
        throw new Error(`conflicting randomizeTestsOrder randomizeTestsOrder(${_shouldRandomize})`);
    }
    _shouldRandomize = shouldRandomize;
    wasSet = true;
}

const shuffleTests = (s: Mocha.Suite) => {
    s.tests = shuffle(s.tests);
    s.suites = shuffle(s.suites);
    s.suites.forEach(shuffleTests);
};

_before(function () {
    if (_shouldRandomize) {
        const root = getCtxRoot(this);
        if (root) {
            shuffleTests(root);
        } else {
            throw new Error('Unable to find mocha suites root');
        }
    }
});
