import { shuffle } from '@wixc3/common';
import { getCtxRoot } from './mocha-helpers';
import { suiteSetup } from 'mocha';

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

suiteSetup(function () {
    if (_shouldRandomize) {
        const root = getCtxRoot(this);
        if (root) {
            shuffleTests(root);
        } else {
            throw new Error('Unable to find mocha suites root');
        }
    }
});
