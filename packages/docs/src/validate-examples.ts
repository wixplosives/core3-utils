import { ApiPackage, ApiDeclaredItem, ApiItem } from '@microsoft/api-extractor-model';
import { globSync } from 'glob';
import { UserConfig, getPackageByName, Package, _packages, _temp, Config } from './common';
import { readFileSync } from 'fs';
import { expect } from 'chai';
import { compileCode, isSame } from '@wixc3/typescript';

export function validateExamples(config: Config, apiJsons = '*.api.json') {
    const apiJsonPaths = globSync(_temp(config, apiJsons));
    if (!apiJsonPaths.length) {
        throw new Error(`No packages api found, make sure you used "yarn docs build" before validating examples`);
    }
    for (const apiJson of apiJsonPaths) {
        const api = ApiPackage.loadFromJsonFile(apiJson);
        const pkg = getPackageByName(config, api.name);
        const examples = new Map<string, string>();
        validateNode(config, api, pkg, examples);
    }
}

function hasTSDocs(x: any): x is ApiDeclaredItem {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return x?.tsdocComment !== undefined;
}

function validateSameCode(a?: string, b?: string, message = '') {
    if (a !== b) {
        const [ma, mb] = [a, b].map((code) =>
            (code || '')
                .split(/\r?\n\s*\*?\s*?/)
                .filter((i) => i)
                .join('\n')
        );
        isSame(
            compileCode(ma || ''),
            compileCode(mb || ''),
            () => false,
            (a, b) => expect(a).to.equal(b, message)
        );
    }
}

function validateNode(config: UserConfig, item: ApiItem, pkg: Package, examples: Map<string, string>) {
    if (hasTSDocs(item)) {
        const docs = item.tsdocComment?.emitAsTsdoc();
        if (docs) {
            for (const [_all, type, ref, exampleCode] of docs.matchAll(
                /@example\s*\*\s*```(tsx?|jsx?|javascript|typescript)\s*\((\S+)\)(.*)\*\s*```/gs
            )) {
                if (ref) {
                    findAllExamples(config, pkg, type, examples);
                    if (!examples.has(ref)) {
                        throw new Error(`Missing example reference: ${ref} in ${item.canonicalReference}`);
                    }
                    validateSameCode(
                        exampleCode,
                        examples.get(ref),
                        `Outdated example "${ref}" in package ${pkg.name} in ${item.canonicalReference}`
                    );
                }
            }
        }
    }
    for (const member of item.members) {
        validateNode(config, member, pkg, examples);
    }
}

function findAllExamples(config: UserConfig, pkg: Package, type: string | undefined, examples: Map<string, string>) {
    if (examples.size === 0) {
        if (type) {
            type = `*.${['ts', 'typescript'].includes(type) ? 'ts{,x}' : '{,m,c}js'}{,x}`;
        } else {
            type = '*.{ts,js,cjs,mjs}{,x}';
        }
        const filePaths = globSync(_packages(config, pkg.dir, config.examples, '**', type));
        for (const file of filePaths) {
            const content = readFileSync(file, 'utf8');
            const foundExamples = content.matchAll(/\/\/\s*\{@label[ \t]+(\w+)\s*\n(.*?)\/\/\s*@}/gs);
            for (const [_, label, example] of foundExamples) {
                if (!label) {
                    throw new Error(`Invalid example label: label is not defined in ${file}`);
                }
                if (examples.has(label)) {
                    throw new Error(`Invalid example label: "// {@label ${label}" is not unique in package ${pkg.name}
    in ${file}`);
                }
                if (!example || !example.trim()) {
                    throw new Error(`Invalid example: example must contain code
    "// {@label ${label}" in ${file}`);
                }
                examples.set(label, example);
            }
        }
    }
}
