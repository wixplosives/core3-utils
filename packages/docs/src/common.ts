import { first, Nullable } from '@wixc3/common';
import { execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
import type { Macro } from './macros';

export function listPackages({ base, packages }: UserConfig) {
    return readdirSync(join(base, packages), { withFileTypes: true })
        .filter((i) => i.isDirectory())
        .filter((i) => existsSync(join(base, packages, i.name, 'package.json')))
        .map((i) => i.name);
}

export const stripName = (name: string) => {
    const base = basename(name).split('.')[0]!;
    return base === 'index' ? '..' : base;
};

export function parseMacro(match: RegExpMatchArray) {
    const all = match[0]!;
    const m = match[3]?.split(/\s+/).filter((i) => i);
    const [macro, ...args] = (m || []) as [string, ...string[]];
    return { all, macro, args };
}
export const execMacro = (data: string, replace: Record<string, string | ((...args: string[]) => string)>) => {
    for (const match of data.matchAll(/(?<!\*)((\\?)\[){3}(.+?)(\2\]){3}/g)) {
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
export function getRepo(assert: true): Repo;
export function getRepo(): Nullable<Repo>;
export function getRepo(assert = false): Nullable<Repo> {
    try {
        const res = execSync('git remote -v').toString().split('\n')[1];
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
    conf: string
    base: string;
    packages: string;
    temp: string
    docs: string;
    siteUrl?: string;
};

export type Config = UserConfig & {
    git: Repo;
};

export type ProcessingConfig = Config & {
    modifier?: (name: string, content: string) => string,
    macros: Record<string, Macro>

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
    const path = join(config.base, config.conf, 'config.json')
    if (force || !existsSync(path)) {
        writeFileSync(path, JSON.stringify(config, null, 2), 'utf8');
    }
}

export const _packages = ({ base, packages }: UserConfig, ...path: string[]) =>
    join(base, packages, ...path)
export const _docs = ({ base, docs }: UserConfig, ...path: string[]) =>
    join(base, docs, ...path)
export const _config = ({ base, conf }: UserConfig, ...path: string[]) =>
    join(base, conf, ...path)
export const _temp = ({ base, temp }: UserConfig, ...path: string[]) =>
    join(base, temp, ...path)
