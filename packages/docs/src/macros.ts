import { readPackageJson } from '@wixc3/fs-utils';
import nodeFs from '@file-services/node';
import { getPackageByUnscopedName, isWixDocs, Repo, stripName, _docs, _packages } from './common';
import { processMacros } from './process-macros';
import { repeat } from '@wixc3/common';
import type { Macro } from './macros.types';

/**
 *
 * Project's root package name
 *
 * Usage: inside a ts-docs comment block:
 *
 * `[[[rootPackageName]]]`
 */
export const rootPackageName: Macro = ({ base }) => readPackageJson(base, nodeFs).name || '';

/**
 *
 * Project's current package name
 *
 * Usage: inside a ts-docs comment block of a package:
 *
 * `[[[packageName]]]`
 *
 * Will be replace by the full package name, i.e `@wixc3/docs`
 */
export const packageName: Macro = (config, name) =>
    name === 'index.md'
        ? readPackageJson(_packages(config, '..'), nodeFs).name!
        : isWixDocs(config) && name.startsWith('docs-macros')
        ? '@wixc3/docs'
        : getPackageByUnscopedName(config, stripName(name)).name;

/**
 *
 * Project's current package name, unscoped
 *
 * Usage: inside a ts-docs comment block of a package:
 * *[[[unscopedPackageName]]]
 *
 * Will be replace by the full package name, i.e `bla` for `@wixc3/bla`
 */
export const unscopedPackageName: Macro = (config, name) => packageName(config, name).replace(/.*\//, '');

/**
 *
 * Project's current package name, in a url friendly format
 *
 * Usage: inside a ts-docs comment block of a package:
 *
 * `[[[packageNameUrl]]]`
 *
 * This is useful for generating links and badges
 */
export const packageNameUrl: Macro = (config, name) =>
    packageName(config, name)
        .split('@')
        .map((i: string) => encodeURIComponent(i))
        .join('@');

/**
 *
 * Project's current package name, in a url friendly format
 *
 * Usage: inside a ts-docs comment block:
 *
 * `[[[gitRepo field?]]]`
 *
 * where field can be: host | org | repo | pages | github
 */
export const gitRepo: Macro = (config, name, field = 'github') => {
    const { git } = config;
    if (field in git) {
        return git[field as keyof Repo];
    }
    throw new Error(
        `Invalid argument "${field}" options are:
        ${Object.keys(git).join(', ')}`
    );
};

/**
 *
 * A link to the project's github pages
 *
 * Usage: inside a ts-docs comment block:
 *
 * `[[[githubPages uri? caption?]]]`
 *
 * where uri can be an inner page
 *
 * if caption is provided a markdown link will be created, otherwise the raw root URL will replace the macro
 *
 */
export const githubPages: Macro = ({ git: { pages } }, _name, uri = '', caption = '') => {
    return caption === '' ? pages : `[${caption}](${pages}/${uri})`;
};

/**
 *
 * A github build status badge
 *
 * Usage: inside a ts-docs comment block:
 *
 * `[[[githubBuildStatus]]]`
 */
export const githubBuildStatus: Macro = ({ git: { github } }) =>
    `[![Build Status](${github}/workflows/tests/badge.svg)](${github}/actions)`;

/**
 *
 * A npm version badge
 *
 * Usage: inside a ts-docs comment block:
 *
 * `[[[npmBadge]]]`
 */
export const npmBadge: Macro = (config, name) => {
    if (name !== 'index.md') {
        const pkg = packageNameUrl(config, name);
        return `[![npm version](https://badge.fury.io/js/${pkg}.svg)](https://badge.fury.io/js/${pkg})`;
    } else {
        return '';
    }
};

/**
 *
 * A link to the package on github
 *
 * Usage: inside a ts-docs comment block:
 *
 * `[[[github caption?]]]`
 */
export const github: Macro = (config, name, caption?) => {
    caption = caption || `${packageName(config, name)} on Github`;
    return `[${caption}](${config.git.github}/tree/master/${config.packages}/${unscopedPackageName(config, name)})`;
};

/**
 *
 * Include another markdown file (that may also have macros)
 *
 * Usage: inside a ts-docs comment block:
 *
 * `[[[include path]]]`
 */
export const include: Macro = (config, name, target = '') => {
    if (!target) {
        throw new Error('Missing target argument');
    }
    return processMacros(config, target, name);
};

/**
 *
 * Heading - since ts-docs to not natively allow for markdown
 * formatting, this macro is used to create a #, ##, ## etc
 *
 * Usage: inside a ts-docs comment block:
 *
 * `[[[h level title]]]`
 */
export const h: Macro = (_, __, level, ...title) => `${repeat('#', parseInt(level))} ${title.join(' ')}\n`;

/**
 * Lists all the available macros
 *
 * Usage: inside a ts-docs comment block:
 *
 * `[[[listMacros]]]`
 */
export const listMacros: Macro = ({ macros }) => {
    return Object.keys(macros)
        .sort()
        .map((name) => ` - [*\\[\\[\\[${name}\\]\\]\\]](./docs-macros.${name}.md)`)
        .join('\n');
};
