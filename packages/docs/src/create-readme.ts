import { join } from 'path'
import { backSlash } from '@wixc3/fs-utils'
import { listPackages } from './common'
import { readFileSync, writeFileSync } from 'fs'
import { siteUrl as site } from './cli'
import { macros } from './macros'
export function createReadme(siteUrl: string, docs = '_docs', packagesPath = "packages") {
    if (siteUrl === site.default) {
        siteUrl = macros.githubPages()
    }
    siteUrl = backSlash(siteUrl, 'trailing')
    const copyWithSiteUrlLinks = (filename: string, packageName: string, packagesPath: string) => {
        let content = readFileSync(join(docs, `${filename}.md`), 'utf8')
        for (const [all, caption, uri, ext] of content.matchAll(/\[(.*?)\]\(\.\/([^)]*)\.(.+?)\)/g)) {
            content = content.replace(
                all!, `[${caption!}](${siteUrl}${uri!}${ext === 'md' ? '' : ext!})`)
        }
        writeFileSync(join(packagesPath, packageName, 'README.md'), content, 'utf8')
    }
    listPackages(packagesPath)
        .map(name => copyWithSiteUrlLinks(name, name, packagesPath))
    copyWithSiteUrlLinks('index', '.', '.')
}