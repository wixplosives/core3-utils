
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import type { UserConfig } from "../common";
import { parse } from 'comment-json'
import { init } from "../init";
import { buildDocs } from "../build-docs";
import { escapeRegExp, isString } from "@wixc3/common";
import type { Macro } from "../macros";

export const testDir = (...paths: string[]) => join('docs-test-project', ...paths)

export const configPath = 'test-conf'
export const config: UserConfig = {
    conf: 'test-conf',
    base: testDir(),
    docs: 'test-docs',
    packages: 'packages',
    temp: 'test-temp',
}

export const loadJson = (...paths: string[]) => {
    const content = readFileSync(join(...paths), 'utf8')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return parse(content) as any
}

export const setup = () => {
    clean()
    mkdirSync(testDir(), { recursive: true })
    const resources = join(__dirname, 'resources');
    cpSync(join(__dirname, '..', '..', '..', 'src', 'test', 'resources', 'project'), testDir(), { recursive: true });
    cpSync(join(resources, 'project'), testDir(), { recursive: true });
    init(config, true)
}

export const clean = () =>{
    // if (existsSync(testDir())) {
    //     rmSync(testDir(), {
    //         recursive: true, force:true
    //     })
    // }
}

export const readDoc = (name:string) => readFileSync(testDir(config.docs, name), 'utf8')
export const docExists = (name:string) => existsSync(testDir(config.docs, name))
export const overwriteTemplate = (name:string, content:string) => writeFileSync(testDir(config.conf, name), content, 'utf8')
export const runMacro = (macro:Macro|string, filename = 'index.md', ...args: string[]) => {
    const header = `
    >>>>>>>
    [[[${isString(macro) ? macro: macro.name} ${args.join(' ')}]]]
    <<<<<<<
    `
    overwriteTemplate('index.md', header )
    overwriteTemplate('package.md', header )
    overwriteTemplate('item.md', header )

    buildDocs(testDir(configPath), true)
    return readDoc(filename).replaceAll(/>>>>>>>(.*)<<<<<<<.*$/gs, '$1').trim()
}
export const asRegex = (str:string) => new RegExp(escapeRegExp(str))
