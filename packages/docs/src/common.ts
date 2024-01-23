import { first, Nullable } from '@wixc3/common';
import { readPackageJson } from '@wixc3/fs-utils';
import { execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
import type { Macro } from './macros.types';
import nodeFs from '@file-services/node';

export type Package = {
    dir: string;
    name: string;
    unscopedName: string;
};

export function listPackages(config: UserConfig): Package[] {
    const { base, packages } = config;
    return readdirSync(join(base, packages), { withFileTypes: true })
        .filter((i) => i.isDirectory())
        .filter((i) => existsSync(_packages(config, i.name, 'package.json')))
        .map((i) => ({
            dir: i.name,
            name: readPackageJson(_packages(config, i.name), nodeFs).name!,
            unscopedName: unscopedPackageName(readPackageJson(_packages(config, i.name), nodeFs).name!),
        }));
}

export const getPackageByUnscopedName = (config: Config, unscopedName: string) => {
    const found = listPackages(config).find(({ unscopedName: pkg }) => pkg === unscopedName);
    if (!found) {
        throw new Error(`Packages not found: "${unscopedName}"`);
    }
    return found;
};

export const getPackageByName = (config: Config, name: string) => {
    const found = listPackages(config).find(({ name: pkg }) => {
        if (isWixDocs(config) && name === '@wixc3/docs-macros') {
            return pkg === '@wixc3/docs';
        }
        return pkg === name;
    });
    if (!found) {
        throw new Error(`Packages not found: "${name}"`);
    }
    return found;
};

export const stripName = (name: string) => {
    const base = basename(name).split('.')[0]!;
    return base === 'index' ? '..' : base;
};

export const unscopedPackageName = (name: string) => name.split('/')[1] || name;

export function parseMacro(match: RegExpMatchArray) {
    const all = match[0];
    const m = match[3]?.split(/\s+/).filter((i) => i);
    const [macro, ...args] = (m || []) as [string, ...string[]];
    return { all, macro, args };
}

export const execMacro = (data: string, replace: Record<string, string | ((...args: string[]) => string)>) => {
    for (const match of data.matchAll(/(?<!`|<code>)((\\?)\[){3}(.+?)(\2\]){3}/g)) {
        const { all, macro, args } = parseMacro(match);
        const v = replace[macro];
        if (v) {
            data = data.replaceAll(all, typeof v !== 'string' ? v(...args) : v);
        }
    }
    return data;
};

export type Repo = {
    host: string;
    org: string;
    repo: string;
    pages: string;
    github: string;
};

export function getRepo(assert: true, overrideOrigin?: string): Repo;
export function getRepo(): Nullable<Repo>;
export function getRepo(assert = false, overrideOrigin?: string): Nullable<Repo> {
    try {
        const res = (overrideOrigin || execSync('git remote -v')).toString().split('\n')[1];
        const match = first(res?.matchAll(/.*@(.*):(.*)\/(.*)\.git.*/g));
        if (match) {
            const [_, host, org, repo] = match;
            if (host && org && repo) {
                return {
                    host,
                    org,
                    repo,
                    pages: `https://${org}.github.io/${repo}`,
                    github: `https://${host}/${org}/${repo}`,
                };
            }
        }
    } catch {
        //
    }
    if (assert) {
        throw new Error('Unable to find remote git repo, make sure git is working and the origin is set');
    }
    return;
}

export type UserConfig = {
    conf: string;
    base: string;
    packages: string;
    temp: string;
    docs: string;
    origin?: string;
    siteUrl?: string;
    examples: string;
};

export type Config = UserConfig & {
    git: Repo;
};

export type ProcessingConfig = Config & {
    modifier?: (name: string, content: string) => string;
    macros: Record<string, Macro>;
};

export function loadConfig(path: string): Config {
    try {
        return JSON.parse(readFileSync(join(path, 'config.json'), 'utf8')) as Config;
    } catch {
        //
    }
    throw new Error(`Invalid config at ${path}/config.json.\n Try running "docs init" first`);
}

export function writeConfig(config: Config, force: boolean) {
    const path = join(config.base, config.conf, 'config.json');
    if (force || !existsSync(path)) {
        writeFileSync(path, JSON.stringify(config, null, 2), 'utf8');
    }
}

export const _packages = ({ base, packages }: UserConfig, ...path: string[]) => join(base, packages, ...path);
export const _docs = ({ base, docs }: UserConfig, ...path: string[]) => join(base, docs, ...path);
export const _config = ({ base, conf }: UserConfig, ...path: string[]) => join(base, conf, ...path);
export const _temp = ({ base, temp }: UserConfig, ...path: string[]) => join(base, temp, ...path);

export function isWixDocs(config: Config) {
    return config.git.github === 'https://github.com/wixplosives/core3-utils' && config.base === '.';
}
