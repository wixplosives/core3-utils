/* eslint-disable no-console */
import { join } from 'path';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { listPackages, loadConfig, ProcessingConfig } from './common';
import { createHeadersModifier, processMacros } from './process-macros';
/**
 * Build docs markdown
 */
export function buildDocs(conf: string, skipAnalyze = false) {
    const config = loadConfig(conf);
    const temp = 'temp';
    if (!skipAnalyze) {
        console.time('Analyzing APIs...');
        listPackages(config.packages).forEach((path) => {
            const extractorConfig = ExtractorConfig.loadFileAndPrepare(
                join(config.packages, path, 'api-extractor.json')
            );
            console.log(`Analyzing APIs of ${path}`);
            Extractor.invoke(extractorConfig);
        });
        console.timeEnd('Analyzing APIs...');
    }
    console.time('Building markdown files');
    execSync(`yarn api-documenter markdown -i ${temp} -o ${config.docs}`);
    console.timeEnd('Building markdown files');
    console.time('Processing macros');

    const pConf: ProcessingConfig = { ...config, modifier: createHeadersModifier(conf) };
    readdirSync(config.docs, { withFileTypes: true })
        .filter((f) => f.isFile())
        .map(({ name }) => processMacros(pConf, name));
    console.timeEnd('Processing macros');
}
