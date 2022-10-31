/* eslint-disable no-console */
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { Config, listPackages, loadConfig, ProcessingConfig, _docs, _packages, _temp } from './common';
import { createHeadersModifier, processMacros } from './process-macros';
import { Macro, macros as builtinMacros } from './macros';

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
        listPackages(config).forEach((path) => {
            const extractorConfig = ExtractorConfig.loadFileAndPrepare(
                _packages(config, path, 'api-extractor.json')
            );
            console.log(`Analyzing APIs of ${path}`);
            Extractor.invoke(extractorConfig, { typescriptCompilerFolder: require.resolve('typescript') });
        });
        console.timeEnd('Analyzing APIs...');
    }
}

function generateDocs(config: Config) {
    console.time('Building markdown files');
    execSync(`yarn api-documenter markdown -i ${_temp(config)} -o ${_docs(config)}`);
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
