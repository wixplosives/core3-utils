/* eslint-disable no-console */
import { Extractor } from '@microsoft/api-extractor';
import { readdirSync } from 'fs';
import { Config, listPackages, loadConfig, ProcessingConfig, _docs, _packages, _temp } from './common';
import { createHeadersModifier, processMacros } from './process-macros';
import { Macro, macros as builtinMacros } from './macros';
import { MarkdownDocumenter } from '@microsoft/api-documenter/lib/documenters/MarkdownDocumenter'
import { ApiModel } from '@microsoft/api-extractor-model'
import { dirname, join } from 'path';

/**
 * Build docs markdown
 */
export function buildDocs(conf: string, skipAnalyze = false, macros?: Record<string, Macro>) {
    const config = loadConfig(conf);

    analyze(skipAnalyze, config);
    generateDocs(config);
    evaluateMacros(config, macros);
}

function analyze(skipAnalyze: boolean, config: Config) {
    if (!skipAnalyze) {
        console.time('Analyzing APIs...');
        const typescriptCompilerFolder = join(dirname(require.resolve('typescript')), '..')

        listPackages(config).forEach((_package) => {
            try {
                Extractor.loadConfigAndInvoke(_packages(config, _package, 'api-extractor.json'), {
                    // at the time of writing this argument is ignored :(
                    typescriptCompilerFolder,
                })
            } catch (err) {
                throw new Error(`Error analyzing ${_packages(config, _package, 'api-extractor.json')}:
                ${(err as Error).message}`)
            }
        });
        console.timeEnd('Analyzing APIs...');
    }
}

function generateDocs(config: Config) {
    console.time('Building markdown files');
    // execSync(`yarn api-documenter markdown -i ${_temp(config)} -o ${_docs(config)}`);
    const model = new ApiModel()
    listPackages(config).forEach((path) => {
        model.loadPackage(_temp(config, `${path}.api.json`))
    });
    const dm = new MarkdownDocumenter({
        apiModel: model,
        outputFolder: _docs(config),
        documenterConfig: undefined
    })
    dm.generateFiles()
    console.timeEnd('Building markdown files');
}

function evaluateMacros(config: Config, macros: Record<string, Macro> | undefined) {
    console.time('Processing macros');

    const pConf: ProcessingConfig = {
        ...config,
        modifier: createHeadersModifier(config),
        macros: { ...builtinMacros, ...macros }
    };
    readdirSync(_docs(config), { withFileTypes: true })
        .filter((f) => f.isFile())
        .map(({ name }) => processMacros(pConf, name));
    console.timeEnd('Processing macros');
}
