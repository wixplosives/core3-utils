import { first, Nullable } from '@wixc3/common';
import { execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, join } from 'path';

export function listPackages(path: string) {
    return readdirSync(path, { withFileTypes: true })
        .filter((i) => i.isDirectory())
        .filter((i) => existsSync(join(path, i.name, 'package.json')))
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
    packages: string;
    docs: string;
    siteUrl?: string;
};

export type Config = UserConfig & {
    git: Repo;
};

export type ProcessingConfig = Config & { modifier?: (name: string, content: string) => string };

export function loadConfig(path: string): Config {
    try {
        return JSON.parse(readFileSync(join(path, 'config.json'), 'utf8')) as Config;
    } catch {
        //
    }
    throw new Error(`Invalid config at ${path}/config.json.\n Try running "docs init" first`);
}

export function writeConfig(path: string, config: Config) {
    writeFileSync(join(path, 'config.json'), JSON.stringify(config, null, 2), 'utf8');
}
