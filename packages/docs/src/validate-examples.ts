import { ApiPackage, ApiDeclaredItem, ApiItem } from '@microsoft/api-extractor-model'
import { format } from 'prettier';
import { GlobSync } from 'glob'
import { UserConfig, getPackageByName, Package, _packages, _temp } from './common';
import { readFileSync } from 'fs';
import { expect } from 'chai';

export function validateExamples(config: UserConfig, apiJsons = "*.api.json") {
    const glob = new GlobSync(_temp(config, apiJsons))
    let found = false
    for (const apiJson of glob.found) {
        found = true
        const api = ApiPackage.loadFromJsonFile(_temp(config, apiJson));
        const pkg = getPackageByName(config, api.name);
        const examples = new Map<string, string>()
        validateNode(config, api, pkg, examples)
    }
    if (!found) {
        throw new Error(`No packages api found, make sure you used "yarn docs build" before validating examples`)
    }
}

function hasTSDocs(x: any): x is ApiDeclaredItem {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return x?.tsdocComment !== undefined;
}

function validateSameCode(a?: string, b?: string, message = '') {
    const [ma, mb] = [a, b].map(code => format(
        (code || '')
            .split(/\r?\n\s*/)
            .filter(i => i)
            .join('\n') || '',
        { parser: 'typescript' }));
    expect(ma).to.equal(mb, message)
}

function validateNode(config: UserConfig, item: ApiItem, pkg: Package, examples: Map<string, string>) {
    if (hasTSDocs(item)) {
        const docs = item.tsdocComment?.emitAsTsdoc()
        if (docs) {
            for (const [_all, type, ref, example] of docs.matchAll(/@example\s*\*\s*```(tsx?|jsx?|javascript|typescript)\s*\((\S+)\)(.*)\*\s*```/gs)) {
                const exampleCode = example?.replaceAll(/^\s*\*\s*/g, '');
                if (ref) {
                    findAllExamples(config, pkg, type, examples)
                    if (!examples.has(ref)) {
                        throw new Error(`Missing example reference: ${ref} in ${item.canonicalReference}`)
                    }
                    validateSameCode(exampleCode, examples.get(ref), `Outdated example "${ref}" in package ${pkg.name} in ${item.canonicalReference}`)
                }
            }
        }
    }
    for (const member of item.members) {
        validateNode(config, member, pkg, examples)
    }
}

function findAllExamples(config: UserConfig, pkg: Package, type: string | undefined, examples: Map<string, string>) {
    if (examples.size === 0) {
        if (type) {
            type = `*.${['ts', 'typescript'].includes(type) ? 'ts{,x}' : '{,m,c}js'}{,x}`
        } else {
            type = '*.{ts,js,cjs,mjs}{,x}'
        }
        const glob = new GlobSync(_packages(config, pkg.dir, config.examples, '**', type))
        for (const file of glob.found) {
            const content = readFileSync(file, 'utf8')
            const foundExamples = content.matchAll(/\/\/\s*\{@label[ \t]+(\w+)\s*\n(.*?)\/\/\s*@}/gs)
            for (const [_, label, example] of foundExamples) {
                if (!label) {
                    throw new Error(`Invalid example label: label is not defined in  ${file}`)
                }
                if (examples.has(label)) {
                    throw new Error(`Invalid example label: "// {@label ${label}" is not unique in package ${pkg}
    in ${file}`)
                }
                if (!example || !example.trim()) {
                    throw new Error(`Invalid example: example must contain code
    "// {@label ${label}" in ${file}`)
                }
                examples.set(label, example)
            }
        }
    }
}