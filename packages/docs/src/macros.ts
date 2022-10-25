/* eslint-disable @typescript-eslint/require-await */
import { execSync } from "child_process"
import { cp, readFile, writeFile } from "fs/promises"
import { join } from "path"
export type Macro = (filename: string, docsPath?: string, ...args: string[]) => Promise<{
    text: string
    afterWrite?: () => Promise<void>
}>

export const macros = {
    packageName: async (name: string, _: string, prefix = '') =>
        ({ text: `${prefix ? prefix + '/' : ''}${(await macros.unscopedPackageName(name)).text}` }),

    unscopedPackageName: async (name: string) =>
        ({ text: `${name.replace(/\..*/, '')}` }),

    packageNameUrl: async (name: string) => ({ text: encodeURIComponent(`@wixc3/${name.replace(/\..*/, '')}`) }),

    gitRepo: async () => {
        try {
            const res = execSync("git remote -v").toString().split('\n')[1]
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            const repo = 'https://' + res?.replace(/.*@/, '').replace(/\.git.*/, '').replace(':', '/')
            return { text: repo || 'Unknown git repo' };
        } catch {
            return { text: 'Unknown git repo' }
        }
    },

    githubBuildStatus: async () => {
        const repo = (await macros.gitRepo()).text;
        return {
            text: `[![Build Status](${repo}/workflows/tests/badge.svg)](${repo}/actions)`
        }
    },

    npmBadge: async (name: string) => {
        const pkg = (await macros.packageNameUrl(name)).text
        return {
            text: `[![npm version](https://badge.fury.io/js/${pkg}.svg)](https://badge.fury.io/js/${pkg})`
        }
    },

    include: async (_: string, docs = '', target = '') => {
        if (!target) {
            throw new Error('Invalid include macro: missing target argument')
        } const text = await processMacros(docs, target)
        return { text }
    },

    copy: async (name: string, docs = '', target = '', replace = '', replaceWith = '') => {
        if (!target) {
            throw new Error('Invalid copy macro: missing target argument')
        }
        return {
            text: '', afterWrite: async () => {
                if (replace) {
                    const content = await readFile(join(docs, name), 'utf8')
                    const mod = content.split(replace).join(replaceWith)
                    await writeFile(join(docs, target), mod, { encoding: 'utf8' })
                } else {
                    await cp(join(docs, name), join(docs, target))
                }
            }
        }
    },
}

type c = keyof typeof macros

export const createIndexParser = (indexHeaderPath: string) =>
    (name: string, content: string) =>
        name === 'index.md'
            ? `\\[\\[\\[include ../${indexHeaderPath}\\]\\]\\]
               ${content}`
            : content


export async function processMacros(docsPath: string, filename: string, modifier?: (name: string, content: string) => string) {
    const source = await readFile(join(docsPath, filename), 'utf8')
    const mod = modifier ? modifier(filename, source) : source
    const after = [] as Awaited<ReturnType<Macro>>[]
    const processed = (await Promise.all(mod.split('\\[\\[\\[').map(
        async text => {
            if (!text.includes('\\]\\]\\]')) {
                return text
            }
            const [macro, ...args] = text.replace(/\\]\\]\\][\S\s.]*/g, '').split(' ')
            if (macro && macro in macros) {
                const res = await (macros as any)[macro]?.(filename, docsPath, ...args)
                after.push(res)
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                return `${res.text}${text.replace(/.*\\]\\]\\]/, '')}`
            } else {
                return `\\[\\[\\[${text}\\]\\]\\]`
            }
        }
    ))).join('')
    if (source !== processed) {
        await writeFile(join(docsPath, filename), processed, { encoding: 'utf8' })
        for (const { afterWrite } of after) {
            if (afterWrite) {
                await afterWrite()
            }
        }
    }
    return processed
}

