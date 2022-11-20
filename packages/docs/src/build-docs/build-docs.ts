/* eslint-disable no-console */
import type { Config } from '../common';
import type { Macros } from '../macros.types';
import { analyze, evaluateMacros, generateMarkdown } from './build-steps';
export type { Macros };

const skipDefaults = {
    analyze: false,
    evaluateMacros: false,
    generateMarkdown: false,
}

export type Skip = Partial<typeof skipDefaults>

/**
 * Build docs markdown
 */
export function buildDocs(config: Config, skip: Skip, macros?: Macros) {
    skip = { ...skipDefaults, ...skip }
    if (!skip.analyze) analyze(config);
    if (!skip.generateMarkdown) generateMarkdown(config);
    if (!skip.evaluateMacros) evaluateMacros(config, macros);
}

