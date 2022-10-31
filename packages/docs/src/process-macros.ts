import {  readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { ProcessingConfig, execMacro, Config, _docs } from './common';
import { mapValues, repeat } from '@wixc3/common';

export const createHeadersModifier = (config: Config) => {
    const headers = relative(config.docs, config.conf)
    return (name: string, content: string) => {
        let file = 'item'
        if (name === 'index.md') {
            file = 'index'
        } else {
            if (name.split('.').length === 2) {
                file = 'package'
            }
        }
        return `[[[include ${headers}/${file}.md]]]
${content}`;
    }
};

export function processMacros(config: ProcessingConfig, filename: string, filenameOverride?: string) {
    const source = readFileSync(join(config.base, config.docs, filename), 'utf8');
    const mod = config.modifier && !filenameOverride ? config.modifier(filename, source) : source;
    const macrosCtx = mapValues(
        config.macros,
        (m) =>
            (...args: string[]) =>
                m(config, filenameOverride || filename, ...args)
    );
    const processed = execMacro(mod, macrosCtx).replaceAll(/\*(\\\[){3}/g, repeat('\\[', 3));
    if (source !== processed) {
        writeFileSync(_docs(config, filenameOverride || filename), processed, { encoding: 'utf8' });
    }
    return processed;
}
