import { shuffle } from "@wixc3/common";

let _shouldRandomize = false;
let wasSet = false;

export function randomizeTestsOrder(shouldRandomize = true) {
    if (wasSet) {
        throw new Error('randomizeTestsOrder was already called')
    }
    _shouldRandomize = shouldRandomize;
    wasSet = true
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

