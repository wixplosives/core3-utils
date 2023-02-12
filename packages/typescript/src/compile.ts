/* eslint-disable @typescript-eslint/unbound-method */
import * as ts from 'typescript';

/**
 * Compiles a code string to typescript AST
 * @param fakePath - path the virtual file of the code
 */
export function compileCode(code: string, fakePath = 'index.ts') {
    return ts.createSourceFile(fakePath, code, ts.ScriptTarget.Latest, true);
}
