import { backSlash } from '@wixc3/fs-utils';
import { Config, listPackages, Package, _docs, _packages } from './common';
import { readFileSync, writeFileSync } from 'fs';
import { siteUrl as site } from './cli.options';
import { format } from 'prettier';

export function createReadme(config: Config, siteUrl: string = site.default) {
    if (siteUrl === site.default) {
        siteUrl = config.git.pages;
    }
    siteUrl = backSlash(siteUrl, 'trailing');
    const copyWithSiteUrlLinks = (pkg: Package) => {
        let content = readFileSync(_docs(config, `${pkg.unscopedName}.md`), 'utf8');
        for (const [all, caption, uri, ext] of content.matchAll(/\[(.*?)\]\(\.\/([^)]*)\.(.+?)\)/g)) {
            content = content.replace(all || '', `[${caption!}](${siteUrl}${uri!}${ext === 'md' ? '' : ext!})`);
        }
        content = format(content, { parser: 'markdown' });
        writeFileSync(_packages(config, pkg.dir, 'README.md'), content, 'utf8');
    };
    listPackages(config).map(pkg => copyWithSiteUrlLinks(pkg));
    copyWithSiteUrlLinks({ dir: '..', name: 'index', unscopedName: 'index' });
}
