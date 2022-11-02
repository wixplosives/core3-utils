import { join, relative } from 'path';
import { getRepo, listPackages, execMacro, UserConfig, writeConfig, _packages, _config, _temp } from './common';
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

export { UserConfig };

/**
 * Initialize docs pre-requisites:
 *
 * - Adds api-extractor.json to packages
 *
 * - Adds git pages action
 *
 * - Creates configs and templates in docs-config
 */
export function init(config: UserConfig, force = false, overrideOrigin?: string) {
    const relConfig = relative(_packages(config, 'pkg'), _config(config));
    const resources = join(__dirname, '..', '..', 'resources');
    const writeConfFile = (filename: string, data: string | object) => {
        const path = _config(config, filename);
        if (force || !existsSync(path)) {
            writeFileSync(path, typeof data === 'string' ? data : JSON.stringify(data), 'utf8');
        }
    };
    const template = (resource: string) => {
        const template = readFileSync(join(resources, resource), 'utf8');
        const mod = execMacro(template, {
            packagesPath: _packages(config),
            relConfig,
            temp: _temp(config),
            confPath: _config(config),
        });
        writeConfFile(resource, mod);
    };

    mkdirSync(_config(config), { recursive: true });
    writeConfig(
        {
            ...config,
            git: getRepo(true, overrideOrigin),
        },
        force
    );
    template('api-extractor.base.json');
    template('api-extractor.json');

    listPackages(config).map((pkg) => {
        const source = _config(config, 'api-extractor.json');
        const target = _packages(config, pkg, 'api-extractor.json');
        return cpSync(source, target, { force });
    });

    cpSync(join(resources, 'doc-headers'), _config(config), { recursive: true, force });
    mkdirSync(join(config.base, '.github/workflows'), { recursive: true });
    cpSync(join(resources, 'jekyll-gh-pages.yml'), join(config.base, '.github/workflows', 'jekyll-gh-pages.yml'));
}
