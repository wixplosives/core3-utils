import { readPackageJson } from '@wixc3/fs-utils';
import nodeFs from '@file-services/node';
import { ProcessingConfig, Repo, stripName, _docs, _packages } from './common';
import { processMacros } from './process-macros';
import { repeat } from '@wixc3/common';

export type Macro = (config: ProcessingConfig, filename: string, ...args: string[]) => string;
export class MacroError extends Error {
    constructor(public config: ProcessingConfig, public file: string, fn: Macro, _message: string) {
        super(`Macro error in ${_docs(config, file)} - [[[${fn.name}]]]:
    ${_message}`);
    }
}

const rootPackageName: Macro = ({ base }) => readPackageJson(base, nodeFs).name || '';

const packageName: Macro = (config, name) =>
    readPackageJson(_packages(config, stripName(name)), nodeFs).name?.toString() || '';

const unscopedPackageName: Macro = (config, name) => macros.packageName(config, name).replace(/.*\//, '');

const packageNameUrl: Macro = (config, name) =>
    macros
        .packageName(config, name)
        .split('@')
        .map((i: string) => encodeURIComponent(i))
        .join('@');

const gitRepo: Macro = (config, name, field = 'github') => {
    const { git } = config;
    if (field in git) {
        return git[field as keyof Repo];
    }
    throw new MacroError(
        config,
        name,
        gitRepo,
        `Invalid argument "${field}" options are:
        ${Object.keys(git).join(', ')}`
    );
};

const githubPages: Macro = ({ git: { pages } }, _name = '', uri = '', caption = '') => {
    return caption === '' ? pages : `[${caption}](${pages}/${uri})`;
};

const githubBuildStatus: Macro = ({ git: { github } }) =>
    `[![Build Status](${github}/workflows/tests/badge.svg)](${github}/actions)`;

const npmBadge: Macro = (config, name) => {
    const pkg = packageNameUrl(config, name);
    return `[![npm version](https://badge.fury.io/js/${pkg}.svg)](https://badge.fury.io/js/${pkg})`;
};

const github: Macro = (config, name) =>
    `[${packageName(config, name)} on Github](${config.git.github}/tree/master/${config.packages}/${unscopedPackageName(
        config,
        name
    )})`;

const include: Macro = (config, name, target = '') => {
    if (!target) {
        throw new MacroError(config, name, include, 'Missing target argument');
    }
    return processMacros(config, target, name);
};

const h: Macro = (_, __, level, ...text) => `${repeat('#', parseInt(level))} ${text.join(' ')}\n`;

const listMacros: Macro = () => {
    return Object.keys(macros)
        .sort()
        .map((name) => ` - *\\[\\[\\[${name}\\]\\]\\]`)
        .join('\n');
};

export const macros = {
    // Package name
    rootPackageName,
    packageNameUrl,
    packageName,
    unscopedPackageName,
    // git & github
    github,
    githubPages,
    gitRepo,
    // utility
    include,
    listMacros,
    // badges
    npmBadge,
    githubBuildStatus,
    // Formatting
    h,
};
