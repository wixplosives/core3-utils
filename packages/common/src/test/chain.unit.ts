import { expect } from 'chai';
import { chain } from '../chain';
// eslint-disable-next-line
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import cg from 'expose-gc/function';
const forceGc = cg as () => void

describe('performance', () => {
    it('it faster than the array equivalent function for large iterables', () => {
        const veryLargeArray = Array.from(new Array(2 ** 18)).map((_, i) => i % 2 ** 32);
        forceGc();
        const arrayStart = performance.now();
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
        const arrayTime = performance.now() - arrayStart;

        const iterStart = performance.now();
        const iterResult = chain(veryLargeArray)
            .map((i) => i - 10_000)
            .filter((i) => i > 0)
            .map((i) => `${i}`)
            .filter((i) => i.includes('9'))
            .flatMap((i) => i.split(''))
            .unique().iterable;
        forceGc();
        const iterTime = performance.now() - iterStart;

        expect([...result]).to.eql([...iterResult]);
        expect(iterTime).to.be.lessThan(arrayTime);
    });
});
