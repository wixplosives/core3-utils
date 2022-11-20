/* eslint-disable no-console */
import { Extractor } from '@microsoft/api-extractor';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { Config, isWixDocs, listPackages, loadConfig, ProcessingConfig, _docs, _packages, _temp } from './common';
import { createHeadersModifier, processMacros } from './process-macros';
import { MarkdownDocumenter } from '@microsoft/api-documenter/lib/documenters/MarkdownDocumenter';
import { ApiModel } from '@microsoft/api-extractor-model';
import { dirname, join } from 'path';
import type { Macros } from './macros.types';
import * as builtinMacros from './macros';
export type { Macros };
import { format } from 'prettier';
import { validateExamples } from './validate-examples';

/**
 * Build docs markdown
 */
export function buildDocs(conf: string, skipAnalyze = false, skipValidation = false, macros?: Macros) {
    const config = loadConfig(conf);
    if (!skipAnalyze) analyze(config);
    if (!skipValidation) validateExamples(config);
    generateDocs(config);
    evaluateMacros(config, macros);
    prettify(config);
}

function analyze(config: Config) {
    console.time('Analyzing APIs...');
    const typescriptCompilerFolder = join(dirname(require.resolve('typescript')), '..');
    const analyzeFile = (path: string) => {
        try {
            Extractor.loadConfigAndInvoke(path, {
                // at the time of writing this argument is ignored :(
                typescriptCompilerFolder,
            });
        } catch (err) {
            throw new Error(`Error analyzing ${path}:
                ${(err as Error).message}`);
        }
    };
    listPackages(config).forEach(({ dir }) => analyzeFile(_packages(config, dir, 'api-extractor.json')));
    if (isWixDocs(config)) {
        analyzeFile(_packages(config, 'docs', 'macros.api-extractor.json'));
        const macrosDocsPath = _temp(config, 'built-in-macros.api.json');
        const macrosDocs = readFileSync(macrosDocsPath, 'utf8');
        writeFileSync(macrosDocsPath, macrosDocs.replaceAll('@wixc3/docs', '@wixc3/docs-macros'));
    }
    console.timeEnd('Analyzing APIs...');
}

function generateDocs(config: Config) {
    console.time('Building markdown files');
    const model = new ApiModel();
    listPackages(config).forEach(({ unscopedName }) => {
        model.loadPackage(_temp(config, `${unscopedName}.api.json`));
    });
    if (isWixDocs(config)) {
        model.loadPackage(_temp(config, 'built-in-macros.api.json'));
    }
    const dm = new MarkdownDocumenter({
        apiModel: model,
        outputFolder: _docs(config),
        documenterConfig: undefined,
    });

    dm.generateFiles();
    console.timeEnd('Building markdown files');
}

function evaluateMacros(config: Config, macros: Macros | undefined) {
    console.time('Processing macros');
    const pConf: ProcessingConfig = {
        ...config,
        modifier: createHeadersModifier(config),
        macros: { ...builtinMacros, ...macros },
    };
    readdirSync(_docs(config), { withFileTypes: true })
        .filter((f) => f.isFile())
        .map(({ name }) => processMacros(pConf, name));
    console.timeEnd('Processing macros');
}

function prettify(config: Config) {
    console.time('Prettifying');
    readdirSync(_docs(config), { withFileTypes: true })
        .filter((f) => f.isFile())
        .map(({ name }) => {
            writeFileSync(
                _docs(config, name),
                format(readFileSync(_docs(config, name), 'utf8'), { parser: 'markdown' })
            );
        });
    console.timeEnd('Prettifying');
}
