import { cp } from "fs/promises";
import { join } from "path";
import { listPackages } from "./common";
import { mkdirSync } from "fs";

export async function init(packagesPath = 'packages') {
    const resources = join(__dirname, '..', 'resources')
    const actions = listPackages(packagesPath)
        .map(pkg => cp(
            join(resources, 'api-extractor.json'),
            join(packagesPath, pkg)))
    actions.push(cp(join(resources, 'api-extractor.base.json'), '.'))
    actions.push(cp(join(resources, 'README.base.md'), '.'))
    mkdirSync('.github/workflows', {recursive:true})
    actions.push(cp(join(resources, 'jekyll-gh-pages.yml'), '.github/workflows'))
    await Promise.all(actions)
}