import type * as ts from 'typescript';
import { Predicate } from '@wixc3/common';
import { compileCode } from './compile';
import { findNode, findNodeAfterComment } from './find';

/**
 * Finds a node matching the pattern.
 * The pattern is a valid TS statement
 *
 * It may include:
 *
 * - //[ignore] to skip some of its structure,
 *
 * - //[return] to return an inner node instead of the root
 */
export function match(code: ts.Node, pattern: string) {
    const compiled = compileCode(pattern).statements;
    if (compiled.length !== 1) {
        throw new Error('Pattern error: multiple statements are not supported');
    }
    const _pattern = compiled[0];
    const ignores = new Set(findNodeAfterComment(_pattern, '[ignore]'));
    const ignore = (n?: ts.Node) => {
        return (n && ignores.has(n)) || false;
    };
    const found = findNode(code, (n) => isSame(n, _pattern, ignore));
    if (found) {
        const returns = [...findNodeAfterComment(_pattern, '[return]')];
        switch (returns.length) {
            case 0:
                return found;
            case 1:
                return findNode(found, (n) => isSame(n, returns[0], ignore));
            default:
                throw new Error('Pattern error: multiple //[return] comments are not supported');
        }
    }
    return undefined;
}

/**
 * Compared 2 code snippet (or ASTs)
 * @param ignore if this predicate is satisfied for an AST node, it (and its children) will be considered same
 * @returns true iff the code is functionally the same. i.e. ignoring comments, white spaces, ineffective line breaks etc
 */
export function isSame(a?: ts.Node, b?: ts.Node, ignore: Predicate<ts.Node | undefined> = () => false) {
    if (ignore(a) || ignore(b)) {
        return true;
    }
    if (a && b && a.kind === b.kind) {
        const aChildren = a.getChildren();
        const bChildren = b.getChildren();
        if (aChildren.length === bChildren.length) {
            if (aChildren.length === 0) {
                return a.getText() === b.getText();
            }
            for (let i = 0; i < aChildren.length; i++) {
                if (!isSame(aChildren[i], bChildren[i], ignore)) {
                    return false;
                }
            }
        } else {
            return false;
        }
        return true;
    }
    return false;
}
