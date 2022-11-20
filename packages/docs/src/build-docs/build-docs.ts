/* eslint-disable no-console */
import type { Config } from '../common';
import type { Macros } from '../macros.types';
import { analyze, evaluateMacros, generateMarkdown } from './build-steps';
export type { Macros };

const all = {
    analyze: true,
    evaluateMacros: true,
    generateMarkdown: true,
}

export type BuildSteps = Partial<typeof all>

/**
 * Build docs markdown
 */
export function buildDocs(config: Config, steps: BuildSteps = all, macros?: Macros) {
    steps = { ...all, ...steps }
    if (!steps.analyze) analyze(config);
    if (!steps.generateMarkdown) generateMarkdown(config);
    if (!steps.evaluateMacros) evaluateMacros(config, macros);
}

