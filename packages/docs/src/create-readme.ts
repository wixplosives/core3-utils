import { join } from 'path'
import { readFile, writeFile } from 'fs/promises'
import { backSlash } from '@wixc3/fs-utils'
import { listPackages } from './common'

export async function createReadme(siteUrl: string, docs = '_docs', packagesPath = "packages") {
    siteUrl = backSlash(siteUrl, 'trailing')
    const copyWithSiteUrlLinks = async (filename: string, packageName: string, packagesPath: string) => {
        const content = await readFile(join(docs, `${filename}.md`), 'utf8')
        const replaced = content.split('](./').join(`](${siteUrl}`)
        await writeFile(join(packagesPath, packageName, 'README.md'), replaced, 'utf8')
    }
    await Promise.all(listPackages(packagesPath)
        .map(name => copyWithSiteUrlLinks(name, name, packagesPath)))
    await copyWithSiteUrlLinks('index', '.', '.')
}