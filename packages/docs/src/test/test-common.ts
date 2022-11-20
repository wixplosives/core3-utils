import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Config, _config, _docs } from '../common';
import { init } from '../init';
import { buildDocs } from '../build-docs/build-docs';
import { escapeRegExp, isString, naiveStripComments } from '@wixc3/common';
import type { Macro } from '../macros.types';

export const config: Config = {
    conf: 'test-conf',
    base: 'docs-test-project',
    docs: 'test-docs',
    packages: 'packages',
    temp: 'test-temp',
    git: {
        github: 'https://github.com/org/repo',
        host: 'github.com',
        org: 'org',
        pages: 'https://org.github.io/repo',
        repo: 'repo'
    }
};

export const loadJson = (...paths: string[]) => {
    const path = join(...paths);
    const content = naiveStripComments(readFileSync(path, 'utf8'));
    try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(content);
    } catch (err) {
        throw new Error(`${err}\n${path}\n${content}`);
    }
};

// eslint-disable-next-line no-console
const config_log = console.log;

export const setup = (_init = true) => {
    clean();
    // eslint-disable-next-line no-console
    console.log = () => {
        /* */
    };
    mkdirSync(config.base, { recursive: true });
    cpSync(join(__dirname, '..', '..', '..', 'src', 'test', 'resources', 'project'), config.base, { recursive: true });
    const { git: _, ...userConfig } = config
    if (_init) {
        init(
            userConfig,
            true,
            `origin	git@github.com:org/repo.git (fetch)
origin	git@github.com:org/repo.git (push)`
        );
    }
};

export const clean = () => {
    // eslint-disable-next-line no-console
    console.log = config_log;
    if (existsSync(config.base)) {
        rmSync(config.base, {
            recursive: true,
            force: true,
        });
    }
};

export const readDoc = (name: string) => readFileSync(_docs(config, name), 'utf8');
export const docExists = (name: string) => existsSync(_docs(config, name));
export const overwriteTemplate = (name: string, content: string) =>
    writeFileSync(_config(config, name), content, 'utf8');
export const runMacro = (macro: Macro | string, filename = 'index.md', ...args: string[]) => {
    const header = `
    >>>>>>>
    [[[${isString(macro) ? macro : macro.name} ${args.join(' ')}]]]
    <<<<<<<
    `;
    overwriteTemplate('index.md', header);
    overwriteTemplate('package.md', header);
    overwriteTemplate('item.md', header);

    buildDocs(config, { analyze: false, prettify: false });
    return readDoc(filename)
        .replaceAll(/>>>>>>>(.*)<<<<<<<.*$/gs, '$1')
        .trim();
};
export const asRegex = (str: string) => new RegExp(escapeRegExp(str));
