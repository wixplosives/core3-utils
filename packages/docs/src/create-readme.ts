import { join } from 'path'
import { backSlash } from '@wixc3/fs-utils'
import { listPackages } from './common'
import { readFileSync, writeFileSync } from 'fs'
import {siteUrl as site} from './cli'
import { macros } from './macros'
export function createReadme(siteUrl: string, docs = '_docs', packagesPath = "packages") {
    if (siteUrl === site.default) {
        siteUrl = macros.githubPages()
    }
    siteUrl = backSlash(siteUrl, 'trailing')
    const copyWithSiteUrlLinks = (filename: string, packageName: string, packagesPath: string) => {
        const content = readFileSync(join(docs, `${filename}.md`), 'utf8')
        const replaced = content.split('](./').join(`](${siteUrl}`)
        writeFileSync(join(packagesPath, packageName, 'README.md'), replaced, 'utf8')
    }
    listPackages(packagesPath)
        .map(name => copyWithSiteUrlLinks(name, name, packagesPath))
    copyWithSiteUrlLinks('index', '.', '.')
}