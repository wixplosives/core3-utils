import { expect } from 'chai';
import * as ts from 'typescript';
import { compileCode } from '../compile.js';
import { findAllNodes, findNode, findNodeAfterComment } from '../find.js';
import { getText } from './helpers.js';

describe(`findNode`, function () {
    this.timeout(8_000);
    it('finds a node satisfying the predicate', () => {
        const code = compileCode(`(a)=>{
            const b=true
            const c=false
        }`);
        expect(getText(findNode(code, (n) => ts.isIdentifier(n)))).to.equal('a');
        expect(
            getText(
                findNode(
                    code,
                    (n) =>
                        ts.isIdentifier(n) &&
                        ts.isVariableDeclaration(n.parent) &&
                        n.parent.initializer?.getText() === 'false',
                ),
            ),
        ).to.equal('c');
    });
    it('Throws a helpful error when parents are not set', () => {
        const code = ts.createSourceFile('a.tsx', `const c=false`, ts.ScriptTarget.Latest);
        expect(() => findNode(code, () => true)).to.throw(
            'AST Node has no parent. use compileCode or make sure the "setParentNodes" (3rd argument) is set to true in ts.createSourceFile',
        );
    });
});

describe(`findAllNodes`, function () {
    this.timeout(8_000);
    it('finds all nodes satisfying the predicate', () => {
        const code = compileCode(`(a)=>{
            const b=true
            const c=false
        }`);
        const found = findAllNodes(code, (n) => ts.isIdentifier(n));
        expect(getText(found)).to.eql(['a', 'b', 'c']);
    });
    it('Throws a helpful error when parents are not set', () => {
        const code = ts.createSourceFile('a.tsx', `const c=false`, ts.ScriptTarget.Latest);
        expect(() => findAllNodes(code, () => true)).to.throw(
            'AST Node has no parent. use compileCode or make sure the "setParentNodes" (3rd argument) is set to true in ts.createSourceFile',
        );
    });
});

describe(`findNodeAfterComment`, function () {
    this.timeout(8_000);
    it('finds root comments', () => {
        const compiled = compileCode(`
            // test
            const singleline=true
            /* test */
            const multiline=true
        `);
        const found = findNodeAfterComment(compiled, `test`);
        expect(getText(found)).to.eql(['const singleline=true', 'const multiline=true']);
    });
    it('finds inner comments', () => {
        const compiled = compileCode(`
            () => {
                // test
                const singleline=true
                /* test */
                const multiline=true
            }
        `);
        const found = findNodeAfterComment(compiled, `test`);
        expect(getText(found)).to.eql(['const singleline=true', 'const multiline=true']);
    });
    it('ignores whitespace', () => {
        const compiled = compileCode(`
            () => {
                //     test     whitespace
                const success=true
            }
        `);
        const found = findNodeAfterComment(compiled, `test whitespace`);
        expect(getText(found)).to.eql(['const success=true']);
    });
    it(`doesn't except partial string match`, () => {
        const compiled = compileCode(`
            () => {
                // test_partial_match
                const success=true
            }
        `);
        const found = findNodeAfterComment(compiled, `test`);
        expect(getText(found)).to.eql([]);
    });
    it('find a comment with regex', () => {
        const compiled = compileCode(`
                // test1
                const success=true
                // test2
                const good=true
        `);
        const f = findNodeAfterComment(compiled, /test\d/);
        expect(getText(f)).to.eql(['const success=true', 'const good=true']);
    });
    it('returns an empty iterable if the comment was not found', () => {
        const compiled = compileCode(`
                // test
                const success=false
        `);
        const f = findNodeAfterComment(compiled, 'no such comment');
        expect(getText(f)).to.eql([]);
    });
    it('finds comments mid-statement', () => {
        const code = compileCode(`const b= /* test */ true`);
        const f = findNodeAfterComment(code, 'test');

        expect(getText(f)).to.eql([`true`]);
    });
    it('Throws a helpful error when parents are not set', () => {
        const code = ts.createSourceFile('a.tsx', `const c=false`, ts.ScriptTarget.Latest);
        expect(() => findNodeAfterComment(code, 'test')).to.throw(
            'AST Node has no parent. use compileCode or make sure the "setParentNodes" (3rd argument) is set to true in ts.createSourceFile',
        );
    });
});
