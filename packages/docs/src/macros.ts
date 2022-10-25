import { readPackageJson } from "@wixc3/fs-utils"
import { execSync } from "child_process"
import nodeFs from "@file-services/node"
import { join, basename } from "path"
import { existsSync, readFileSync, writeFileSync } from "fs"
export type Macro = (filename: string, docsPath?: string, ...args: string[]) => string

const stripName = (name: string) => {
    const base = basename(name).split('.')[0]!
    return base === 'index' ? '..' : base
}
export const macros = {
    rootPackageName: () =>
        readPackageJson('.', nodeFs).name,

    packageName: (name: string, packages: string) =>
        readPackageJson(join(packages, stripName(name)), nodeFs).name?.toString() || '',

    unscopedPackageName: (name: string, packages: string) =>
        macros.packageName(name, packages)?.replace(/.*\//, ''),

    packageNameUrl: (name: string, packages: string) =>
         macros.packageName(name, packages)
            .split('@')
            .map(i =>encodeURIComponent(i))
            .join('@'),

    gitRepo: () => {
        try {
            const res = execSync("git remote -v").toString().split('\n')[1]
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            const repo = 'https://' + res?.replace(/.*@/, '').replace(/\.git.*/, '').replace(':', '/')
            return repo || 'Unknown git repo';
        } catch {
            return 'Unknown git repo'
        }
    },

    githubPages: (_1='', _2='', _3='', uri='', caption='') => {
        const remote = execSync("git remote -v").toString().split('\n')[1]!
        const [org, repo] = remote.replace(/.*:/, '').replace(/\.git.*/, '').split('/')
        const pages = `https://${org}.github.io/${repo}/${uri}`
        return caption === '' ? pages : `[${caption}](${pages})`
    },

    githubBuildStatus: () => {
        const repo = macros.gitRepo();
        return `[![Build Status](${repo}/workflows/tests/badge.svg)](${repo}/actions)`
    },

    npmBadge:  (name: string, packages: string) => {
        const pkg = macros.packageNameUrl(name, packages)
        return `[![npm version](https://badge.fury.io/js/${pkg}.svg)](https://badge.fury.io/js/${pkg})`
    },

    include: (name: string, packagesPath: string, docs: string, target = '') => {
        if (!target) {
            throw new Error('Invalid include macro: missing target argument')
        }
        return processMacros(docs, packagesPath, target, name)
    }
}


export const createHeadersModifier = (headers: string) => {
    if (existsSync(headers)) {
        return (name: string, content: string) => {
            if (name === 'index.md') {
                return `\\[\\[\\[include ../${headers}/index.md\\]\\]\\]
                    ${content}`
            }
            if (name.split('.').length === 2) {
                return `\\[\\[\\[include ../${headers}/package.md\\]\\]\\]
                    ${content}`
            }
            return `\\[\\[\\[include ../${headers}/item.md\\]\\]\\]
                ${content}`
        }
    } else {
        return (_: string, content: string) => content;
    }
}

export function processMacros(docsPath: string,
    packagesPath: string,
    filename: string,
    filenameOverride: string | null,
    modifier?: (name: string, content: string) => string) {
    const source = readFileSync(join(docsPath, filename), 'utf8')
    const mod = modifier && !filenameOverride ? modifier(filename, source) : source
    const processed = mod.split('\\[\\[\\[').map(
        text => {
            if (!text.includes('\\]\\]\\]')) {
                return text
            }
            const [macro, ...args] = text.replace(/\\]\\]\\][\S\s.]*/g, '').split(' ')
            if (macro && macro in macros) {
                try {
                    const res = (macros as any)[macro]?.(filenameOverride || filename, packagesPath, docsPath, ...args)
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    return `${res}${text.replace(/.*\\]\\]\\]/, '   ')}`
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error(macro, e)
                    return `\\[\\[\\[${macro} error: ${e}\\]\\]\\]`
                }
            } else {
                return `\\[\\[\\[${text}\\]\\]\\]`
            }
        }
    ).join('')
    if (source !== processed) {
        writeFileSync(join(docsPath, filenameOverride || filename),
            processed, { encoding: 'utf8' })
    }
    return processed
}

