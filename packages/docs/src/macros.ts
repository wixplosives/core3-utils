/* eslint-disable @typescript-eslint/require-await */
import { readPackageJson } from "@wixc3/fs-utils"
import { execSync } from "child_process"
import {  readFile, writeFile } from "fs/promises"
import nodeFs from "@file-services/node"
import { join } from "path"
import { existsSync } from "fs"
export type Macro = (filename: string, docsPath?: string, ...args: string[]) => string

export const macros = {
    rootPackageName:  () =>
         readPackageJson('.', nodeFs).name,

    packageName:  (name: string, packages: string) =>
       readPackageJson(join(packages, name), nodeFs).name,

    unscopedPackageName:  (name: string, packages: string) =>
       macros.packageName(name, packages)?.replace(/.*\//,'') ,

    packageNameUrl:  (name: string, packages:string) => 
        encodeURIComponent(macros.packageName(name, packages) as string) ,

    gitRepo:  () => {
        try {
            const res = execSync("git remote -v").toString().split('\n')[1]
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            const repo = 'https://' + res?.replace(/.*@/, '').replace(/\.git.*/, '').replace(':', '/')
            return { text: repo || 'Unknown git repo' };
        } catch {
            return { text: 'Unknown git repo' }
        }
    },

    githubBuildStatus:  () => {
        const repo =  macros.gitRepo().text;
        return {
            text: `[![Build Status](${repo}/workflows/tests/badge.svg)](${repo}/actions)`
        }
    },

    npmBadge: async (name: string, packages:string) => {
        const pkg =  macros.packageNameUrl(name, packages)
        return {
            text: `[![npm version](https://badge.fury.io/js/${pkg}.svg)](https://badge.fury.io/js/${pkg})`
        }
    },

    include:  async (_: string, docs = '', target = '') => {
        if (!target) {
            throw new Error('Invalid include macro: missing target argument')
        } const text = await processMacros(docs, target)
        return { text }
    }
}


export const createHeadersModifier = (headers: string) => {
    if (existsSync(headers)) {
        return (name: string, content: string) => {
            if (name === 'index.md') {
                return `\\[\\[\\[include ../${headers}/index.md}\\]\\]\\]
                    ${content}`
            }
            if (name.split('.').length === 2) {
                return `\\[\\[\\[include ../${headers}/package.md}\\]\\]\\]
                    ${content}`
            }
            return `\\[\\[\\[include ../${headers}/item.md}\\]\\]\\]
                ${content}`
        }
    } else {
        return (_: string, content: string) => content;
    }
}

export async function processMacros(docsPath: string, filename: string, modifier?: (name: string, content: string) => string) {
    const source = await readFile(join(docsPath, filename), 'utf8')
    const mod = modifier ? modifier(filename, source) : source
    const processed = (await Promise.all(mod.split('\\[\\[\\[').map(
        async text => {
            if (!text.includes('\\]\\]\\]')) {
                return text
            }
            const [macro, ...args] = text.replace(/\\]\\]\\][\S\s.]*/g, '').split(' ')
            if (macro && macro in macros) {
                const res = await (macros as any)[macro]?.(filename, docsPath, ...args)
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return `${res}${text.replace(/.*\\]\\]\\]/, '')}`
            } else {
                return `\\[\\[\\[${text}\\]\\]\\]`
            }
        }
    ))).join('')
    if (source !== processed) {
        await writeFile(join(docsPath, filename), processed, { encoding: 'utf8' })        
    }
    return processed
}

