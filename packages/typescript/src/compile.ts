/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { isString } from '@wixc3/common';
import { dirname, join } from 'path';
import * as ts from 'typescript';

/**
 * Compiles a code string to typescript AST
 * @param fakePath - path the virtual file of the code
 */
export function compileCode(code: string, fakePath = 'index.ts') {
    const configFile = ts.findConfigFile(fakePath, ts.sys.fileExists.bind(ts.sys));
    const options = getTsConfigCompilerOptions(configFile);

    const host = ts.createCompilerHost(options, true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { readFile } = host;
    host.readFile = (path) => {
        if (path === fakePath) {
            return code;
        } else {
            return readFile(path);
        }
    };
    const program = ts.createProgram({
        rootNames: [fakePath],
        options,
        host,
    });
    return program.getSourceFile(fakePath)!;
}

/**
 * Compiles a single file to typescript AST
 */
export function compileFile(sourceFilePath: string) {
    const configFile = ts.findConfigFile(sourceFilePath, ts.sys.fileExists.bind(ts.sys));
    const options = getTsConfigCompilerOptions(configFile);
    const host = ts.createCompilerHost(options, true);
    const program = ts.createProgram({
        rootNames: [sourceFilePath],
        options,
        host,
    });
    return program.getSourceFile(sourceFilePath);
}

/**
 * Calculates the effective tsconfig compiler options,
 */
export function getTsConfigCompilerOptions(tsConfigJsonPath?: string): ts.CompilerOptions {
    if (tsConfigJsonPath) {
        const { config } = ts.readConfigFile(tsConfigJsonPath, ts.sys.readFile) as { config: { extends?: string } };
        const { options } = ts.parseJsonConfigFileContent(config, ts.sys, '.');
        const ext = isString(config.extends) ? join(dirname(tsConfigJsonPath), config.extends) : undefined;
        return {
            ...getTsConfigCompilerOptions(ext),
            ...options,
        };
    } else return {};
}
