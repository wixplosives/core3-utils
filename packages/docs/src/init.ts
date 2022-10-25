import { cp, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { listPackages } from "./common";
import { mkdirSync, readFileSync, writeFileSync } from "fs";



export async function init(packagesPath = 'packages', confPath: string) {
    const resources = join(__dirname, '..', '..', 'resources')
    const template = (resource: string) => {
        let base = readFileSync(join(resources, resource), 'utf8')
        let mod = base
        do {
            base = mod
            mod = base.replace('[[[confPath]]]', confPath)
            mod = mod.replace('[[[packagesPath]]]', packagesPath)
        } while (mod !== base)
        writeFileSync(join(confPath, resource), mod, 'utf8')
    }
    mkdirSync(confPath, { recursive: true })
    template('api-extractor.base.json')
    template('api-extractor.json')

    const actions = listPackages(packagesPath)
        .map(pkg => {
            const source = join(confPath, 'api-extractor.json')
            const target = join(packagesPath, pkg, 'api-extractor.json')
            return cp(source, target)
        })

    actions.push(cp(join(resources, 'doc-headers'), confPath, { recursive: true, }))
    mkdirSync('.github/workflows', { recursive: true })
    actions.push(cp(join(resources, 'jekyll-gh-pages.yml'), join('.github/workflows', 'jekyll-gh-pages.yml')))
    await Promise.all(actions)
}