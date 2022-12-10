import { shuffle } from '@wixc3/common';

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
    shuffle(s.tests);
    shuffle(s.suites);
    s.suites.forEach(shuffleTests);
};

before(function () {
    if (_shouldRandomize) {
        let root = this.test?.parent;
        while (root && !root.root) {
            root = root?.parent;
        }
        if (root) {
            shuffleTests(root);
        } else {
            throw new Error('Unable to find mocha suites root');
        }
    }
});
