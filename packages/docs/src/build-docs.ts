/* eslint-disable no-console */
import { dirname, join } from 'path'
import { GlobSync } from 'glob'
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'
import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
const packages = new GlobSync(join(__dirname, '..', '..', '*', 'package.json'))
console.time("Analyzing APIs...")
packages.found.filter(p => !p.includes('docs')).forEach(path => {
    path = dirname(path)
    const config = ExtractorConfig.loadFileAndPrepare(join(path, 'api-extractor.json'))
    Extractor.invoke(config)
})
console.timeEnd("Analyzing APIs...")
console.time("Building markdown files")
execSync('yarn api-documenter markdown -i temp -o _docs')
console.timeEnd("Building markdown files")
const generatedIndex = readFileSync('_docs/index.md', 'utf-8')
const prefix = readFileSync('README.base.md', 'utf-8')
writeFileSync('_docs/index.md', prefix + generatedIndex, { encoding: 'utf8' })