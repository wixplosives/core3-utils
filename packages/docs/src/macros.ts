import { readPackageJson } from '@wixc3/fs-utils';
import nodeFs from '@file-services/node';
import { join } from 'path';
import { getRepo, ProcessingConfig, stripName } from './common';
import { processMacros } from './process-macros';

export type Macro = (config: ProcessingConfig, filename: string, ...args: string[]) => string;
export class MacroError extends Error {
    constructor(public config: ProcessingConfig, public file: string, fn: Macro, _message: string) {
        super(`Macro error in ${join(config.docs, file)} - [[[${fn.name}]]]:
    ${_message}`)
    }
}

const rootPackageName: Macro = () => readPackageJson('.', nodeFs).name || ''

const packageName: Macro = (config, name) =>
    readPackageJson(join(config.packages, stripName(name)), nodeFs).name?.toString() || ''

const unscopedPackageName: Macro = (config, name) =>
    macros.packageName(config, name).replace(/.*\//, '')

const packageNameUrl: Macro = (config, name) =>
    macros
        .packageName(config, name)
        .split('@')
        .map((i: string) => encodeURIComponent(i))
        .join('@')

const gitRepo: Macro = (config, name, field = '') => {
    const { git } = config;
    field === field || 'github'
    if (field in git) {
        return (git as any)[field]
    }
    throw new MacroError(config, name, gitRepo, `Invalid argument "${field}" options are:
        ${Object.keys(git).join(', ')}`)
}

const githubPages: Macro = ({ git: { pages } }, _name = '', uri = '', caption = '') => {
    return caption === '' ? pages : `[${caption}](${pages}/${uri})`;
}

const githubBuildStatus: Macro = ({ git: { github } }) =>
    `[![Build Status](${github}/workflows/tests/badge.svg)](${github}/actions)`;


const npmBadge: Macro = (config, name) => {
    const pkg = packageNameUrl(config, name);
    return `[![npm version](https://badge.fury.io/js/${pkg}.svg)](https://badge.fury.io/js/${pkg})`;
}

const include: Macro = (config, name, target = '') => {
    if (!target) {
        throw new MacroError(config, name, include, 'Missing target argument');
    }
    return processMacros(config, target, name);
}

export const macros = {
    rootPackageName,
    getRepo, githubBuildStatus, packageName,
    include, githubPages,
    npmBadge, gitRepo, packageNameUrl, unscopedPackageName
}


