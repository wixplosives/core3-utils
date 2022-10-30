import { expect } from 'chai';
import { compileCode } from '../compile';
import { isSame, match } from '../match';
import { getText } from './helpers';

describe(`match`, () => {
    it('finds a patten in code', () => {
        const code = compileCode(`(a)=>{ 
            const b=true 
            const c=false
        }`);

        expect(getText(match(code, `const b=true`))).to.eql(`const b=true`);
    });
    it('ignores the structure following //[ignore]', () => {
        const code = compileCode(`(a)=>{ 
            const b=true 
            const c=false
        }`);

        expect(getText(match(code, `const b= /* [ignore] */ false`))).to.eql(`const b=true`);
    });
    it('returns the node following //[return]', () => {
        const code = compileCode(`(a)=>{ 
            const b=true 
            const c=false
        }`);

        expect(getText(match(code, `const /* [return] */b=true`))).to.eql(`b=true`);
    });
    it('throws when patterns contain multiple //[return]', () => {
        const code = compileCode(`(a)=>{ 
            const b=true 
            const c=false
        }`);

        expect(() => match(code, `/* [return] */const /* [return] */b=true`)).to.throw();
    });
    it('throws when patterns contain statements', () => {
        const code = compileCode(`(a)=>{ 
            const b=true 
            const c=false
        }`);

        expect(() => match(code, `const a=1;const b=2`)).to.throw();
    });
});

describe(`isSame`, () => {
    it('returns true for identical nodes', () => {
        const code = `()=>{}`;
        const a = compileCode(code),
            b = compileCode(code);
        expect(isSame(a, b)).to.eql(true);
    });
    it('is not affected by whitespace and comments', () => {
        const a = compileCode(`( )=>{  /*  */ }`);
        const b = compileCode('()=>{}');
        expect(isSame(a, b)).to.eql(true);
    });
    it('check value assignments', () => {
        const a = compileCode(`const a=0`);
        const b = compileCode('const a=1');
        expect(isSame(a, b)).to.eql(false);
    });
    it('returns false for different nodes', () => {
        const a = compileCode(`()=>{}`);
        const b = compileCode('const different=true');
        expect(isSame(a, b)).to.eql(false);
        const c = compileCode(`(a,b)=>{}`);
        const d = compileCode('(a,b,c)=>{}');
        expect(isSame(c, d)).to.eql(false);
    });
});
