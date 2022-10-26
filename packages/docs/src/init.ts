import { join } from 'path';
import { getRepo, listPackages, execMacro, UserConfig, writeConfig } from './common';
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

/**
 * Initialize docs pre-requisites:
 *
 * - Adds api-extractor.json to packages
 *
 * - Adds git pages action
 *
 * - Creates configs and templates in docs-config
 */
export function init(confPath: string, config: UserConfig) {
    const packagesPath = config.packages;
    const resources = join(__dirname, '..', '..', 'resources');
    const writeConf = (filename: string, data: string | object) =>
        writeFileSync(join(confPath, filename), typeof data === 'string' ? data : JSON.stringify(data), 'utf8');
    const template = (resource: string) => {
        const base = readFileSync(join(resources, resource), 'utf8');
        const mod = execMacro(base, { packagesPath, confPath });
        writeConf(resource, mod);
    };

    mkdirSync(confPath, { recursive: true });
    writeConfig(confPath, {
        ...config,
        git: getRepo(true),
    });
    template('api-extractor.base.json');
    template('api-extractor.json');

    listPackages(packagesPath).map((pkg) => {
        const source = join(confPath, 'api-extractor.json');
        const target = join(packagesPath, pkg, 'api-extractor.json');
        return cpSync(source, target);
    });

    cpSync(join(resources, 'doc-headers'), confPath, { recursive: true });
    mkdirSync('.github/workflows', { recursive: true });
    cpSync(join(resources, 'jekyll-gh-pages.yml'), join('.github/workflows', 'jekyll-gh-pages.yml'));
}
