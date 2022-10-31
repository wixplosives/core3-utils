import { join } from 'path';
import { backSlash } from '@wixc3/fs-utils';
import { listPackages, loadConfig } from './common';
import { readFileSync, writeFileSync } from 'fs';
import { siteUrl as site } from './cli';

export function createReadme(conf: string, siteUrl: string) {
    const config = loadConfig(conf);
    if (siteUrl === site.default) {
        siteUrl = config.git.pages;
    }
    siteUrl = backSlash(siteUrl, 'trailing');
    const copyWithSiteUrlLinks = (filename: string, packageName: string, packagesPath: string) => {
        let content = readFileSync(join(config.docs, `${filename}.md`), 'utf8');
        for (const [all, caption, uri, ext] of content.matchAll(/\[(.*?)\]\(\.\/([^)]*)\.(.+?)\)/g)) {
            content = content.replace(all!, `[${caption!}](${siteUrl}${uri!}${ext === 'md' ? '' : ext!})`);
        }
        writeFileSync(join(packagesPath, packageName, 'README.md'), content, 'utf8');
    };
    listPackages(config).map((name) => copyWithSiteUrlLinks(name, name, config.packages));
    copyWithSiteUrlLinks('index', '.', '.');
}
