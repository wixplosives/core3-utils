import type { Config } from '../common';
import type { Macros } from '../macros.types';
import { validateExamples } from '../validate-examples';
import { analyze, evaluateMacros, generateMarkdown, prettify } from './build-steps';
export type { Macros };

const all = {
    analyze: true,
    evaluateMacros: true,
    generateMarkdown: true,
    prettify: true,
    validateExamples: true,
};

export type BuildSteps = Partial<typeof all>;

/**
 * Build docs markdown
 */
export function buildDocs(config: Config, steps: BuildSteps = all, macros?: Macros) {
    steps = { ...all, ...steps };
    if (steps.analyze) analyze(config);
    if (steps.validateExamples) validateExamples(config);
    if (steps.generateMarkdown) generateMarkdown(config);
    if (steps.evaluateMacros) evaluateMacros(config, macros);
    if (steps.prettify) prettify(config);
}
