import { expect } from 'chai';
import { chain } from '../chain';
// @ts-expect-error no types
import gc from 'expose-gc/function';
const forceGc = gc as () => void;

const timer = typeof performance !== 'undefined' ? performance : Date;

describe('performance', () => {
    it('it faster than the array equivalent function for large iterables', () => {
        const veryLargeArray = Array.from(new Array(2 ** 18)).map((_, i) => i % 2 ** 32);
        forceGc();
        const arrayStart = timer.now();
        const result = veryLargeArray
            .map((i) => i - 10_000)
            .filter((i) => i > 0)
            .map((i) => `${i}`)
            .filter((i) => i.includes('9'))
            .flatMap((i) => i.split(''))
            // equivalent to "unique"
            .reduce((acc, i) => {
                acc.add(i);
                return acc;
            }, new Set<string>())
            .values();
        forceGc();
        const arrayTime = timer.now() - arrayStart;

        const iterStart = timer.now();
        const iterResult = chain(veryLargeArray)
            .map((i) => i - 10_000)
            .filter((i) => i > 0)
            .map((i) => `${i}`)
            .filter((i) => i.includes('9'))
            .flatMap((i) => i.split(''))
            .unique().iterable;
        forceGc();
        const iterTime = timer.now() - iterStart;

        expect([...result]).to.eql([...iterResult]);
        expect(iterTime).to.be.lessThan(arrayTime);
    });
});
