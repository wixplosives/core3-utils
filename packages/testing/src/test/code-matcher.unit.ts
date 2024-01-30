import { expect, use } from 'chai';
import { codeMatchers } from '../code-matchers';
use(codeMatchers);

describe('code-matcher', () => {
    describe('sanity', () => {
        const CODE = `const a=1;`;
        const EQUIVALENT = `const a = 1`;
        it('assert code are equal', async () => {
            await expect(CODE).to.matchCode(CODE);
        });
        it('assert code are equivalent', async () => {
            await expect(CODE).to.matchCode(EQUIVALENT);
        });
        it('assert code are not equal', async () => {
            await expect(CODE).to.not.matchCode(`const some="random code";`);
        });
    });
    describe('multi line', () => {
        const CODE = `const a=1;
                      const b=2;`;
        const EQUIVALENT = `const a = 1;
                            const b = 2`;
        it('assert code are equal', async () => {
            await expect(CODE).to.matchCode(CODE);
        });
        it('assert code are equivalent', async () => {
            await expect(CODE).to.matchCode(EQUIVALENT);
        });
        it('assert code are not equal', async () => {
            await expect(CODE).to.not.matchCode(`const a=1;
                                                const c=false;`);
        });
    });
});
