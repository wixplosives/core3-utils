import { expect, use } from 'chai';
import { codeMatchers } from '../code-matchers';
use(codeMatchers);

const CODE = `const a=1;`;
const EQUIVALENT = `const a = 1`;
const MULTILINE = `const a=1;
                   const b=2;`;
const MULTILINE_EQUIVALENT = `const a = 1;
                              const b = 2`;

describe('matchCode', () => {
    describe('sanity', () => {
        it('assert codes are equal', async () => {
            await expect(CODE).to.matchCode(CODE);
        });
        it('assert codes are equivalent', async () => {
            await expect(CODE).to.matchCode(EQUIVALENT);
        });
        it('assert codes are not equal', async () => {
            await expect(CODE).not.to.matchCode(`const some="random code";`);
        });
        it('throws when code is not a equivalent', async () => {
            await expect(expect(CODE).to.matchCode(`const some="random code";`)).to.be.rejectedWith(
                'Expected code to match',
            );
        });
    });
    describe('multi line', () => {
        it('assert code are equal', async () => {
            await expect(MULTILINE).to.matchCode(MULTILINE);
        });
        it('assert code are equivalent', async () => {
            await expect(MULTILINE).to.matchCode(MULTILINE_EQUIVALENT);
        });
        it('assert code are not equal', async () => {
            await expect(MULTILINE).to.not.matchCode(`const a=1;
                                                const c=false;`);
        });
    });
});

describe('includeCode', () => {
    it('assert code is contained', async () => {
        await expect(MULTILINE).to.includeCode(MULTILINE);
        await expect(MULTILINE).to.includeCode(`const a = 1;`);
        await expect(MULTILINE).to.includeCode(`const b = 2;`);
    });
    it('assert equivalent code is contained', async () => {
        await expect(MULTILINE).to.includeCode(`const      b= 2;`);
    });
    it('assert equivalent code is not contained', async () => {
        await expect(MULTILINE).not.to.includeCode(`const NOT='included';`);
    });
    it('throws when code is not a equivalent', async () => {
        await expect(expect(MULTILINE).to.includeCode(`const some="random code";`)).to.be.rejectedWith(
            'Expected code to include',
        );
    });
});
