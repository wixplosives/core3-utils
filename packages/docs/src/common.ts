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

export const constRegExp = (variable: string) => new RegExp(`\\[\\[\\[\s*${variable}\s*\\]\\]\\]|\\\\[\\\\[\\\\[\s*${variable}\s*\\\\]\\\\]\\\\]`, 'g')
export const macroRegExp = (macro: string) => new RegExp(`\\[\\[\\[\s*${macro}\s*(\s.*?)*\\]\\]\\]|\\\\[\\\\[\\\\[\s*${macro}\s*(\s.*?)*\\\\]\\\\]\\\\]`, 'g')
export const replaceAll = (data: string, replace: Record<string, string|((...args:string[])=>string)>) => {
    for (const [name, v] of Object.entries(replace)) {        
        if ( typeof v === 'string' ) {
            data = data.replaceAll(constRegExp(name),v)
        } else {
            for (const match of data.matchAll(macroRegExp(name))) {
                const args = match[1]?.split(/\s+/) || []
                data = data.replaceAll(match[0]!, v(...args))
            }
        }  
    }
    return data
}

export type Repo = { 
    host: string, 
    org: string, 
    repo: string,
    pages:string,
    github:string
}
export function getRepo(assert: true): Repo
export function getRepo(): Nullable<Repo>
export function getRepo(assert = false): Nullable<Repo> {
    try {
        const res = execSync('git remote -v').toString().split('\n')[1];
        const match = first(res?.matchAll(/.*@(.*):(.*)\/(.*)\.git.*/g));
        if (match) {
            const [_, host, org, repo] = match;
            if (host && org && repo) {
                return { host, org, repo,
                    pages: `https://${org}.github.io/${repo}`,
                    github: `https://${host}/${org}/${repo}`
                };
            }
        }
    } catch {
        // 
    }
    if (assert) {
        throw new Error('Unable to find remote git repo, make sure git is working and the origin is set')
    }
    return
}

export type Config = {
    git: Repo,
    packages: string,
    docs: string,
    siteUrl?: string
}

export type ProcessingConfig = Config & {modifier?: (name: string, content: string) => string}

export function loadConfig(path: string): Config {
    try {
        return JSON.parse(readFileSync(join(path, 'config.json'), 'utf8')) as Config
    } catch {
        //
    }
    throw new Error(`Invalid config at ${path}/config.json.\n Try running "docs init" first`)
}

export function writeConfig(path: string, config: Config) {
    writeFileSync(path, JSON.stringify(config, null, 2))
}