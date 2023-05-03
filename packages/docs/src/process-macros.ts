import { readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { ProcessingConfig, execMacro, Config, _docs } from './common';
import { mapValues } from '@wixc3/common';
import { MacroError } from './macros.types';

export const createHeadersModifier = (config: Config) => {
    const headers = relative(config.docs, config.conf);
    return function addHeaders(name: string, content: string) {
        let file = 'item';
        if (name === 'index.md') {
            file = 'index';
        } else {
            if (name.split('.').length === 2) {
                file = 'package';
            }
        }
        return `[[[include ${headers}/${file}.md]]]
${content}`;
    };
};

export function processMacros(config: ProcessingConfig, filename: string, filenameOverride?: string) {
    const source = readFileSync(join(config.base, config.docs, filename), 'utf8');
    const mod = config.modifier && !filenameOverride ? config.modifier(filename, source) : source;
    const macrosCtx = mapValues(config.macros, (m) => (...args: string[]) => {
        try {
            return m(config, filenameOverride || filename, ...args);
        } catch (err) {
            throw new MacroError(config, filenameOverride || filename, m, args, (err as Error).message);
        }
    });
    const processed = execMacro(mod, macrosCtx);
    if (source !== processed) {
        writeFileSync(_docs(config, filenameOverride || filename), processed, { encoding: 'utf8' });
    }
    return processed;
}
