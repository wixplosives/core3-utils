import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ProcessingConfig, execMacro } from './common';
import { macros } from './macros';
import { mapValues, repeat } from '@wixc3/common';

export const createHeadersModifier = (headers: string) => {
    if (existsSync(headers)) {
        return (name: string, content: string) => {
            if (name === 'index.md') {
                return `[[[include ../${headers}/index.md]]]
                    ${content}`;
            }
            if (name.split('.').length === 2) {
                return `[[[include ../${headers}/package.md]]]
                    ${content}`;
            }
            return `[[[include ../${headers}/item.md]]]
                ${content}`;
        };
    } else {
        return (_: string, content: string) => content;
    }
};

export function processMacros(config: ProcessingConfig, filename: string, filenameOverride?: string) {
    const source = readFileSync(join(config.docs, filename), 'utf8');
    const mod = config.modifier && !filenameOverride ? config.modifier(filename, source) : source;
    const macrosCtx = mapValues(
        macros,
        (m) =>
            (...args: string[]) =>
                m(config, filenameOverride || filename, ...args)
    );
    const processed = execMacro(mod, macrosCtx).replaceAll(/\*(\\\[){3}/g, repeat('\\[', 3));
    if (source !== processed) {
        writeFileSync(join(config.docs, filenameOverride || filename), processed, { encoding: 'utf8' });
    }
    return processed;
}
