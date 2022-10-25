/* eslint-disable no-console */
import { dirname, join } from 'path'
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'
import { execSync } from 'child_process'
import { readdirSync } from 'fs'
import { createIndexParser, processMacros } from './macros'
import { listPackages } from './common'
/**
 * 
 * @param packagesPath 
 */
export async function buildDocs(packagesPath = 'packages', docs='_docs', indexHeaderPath='README.base.md') {
    const temp = 'temp'
    console.time("Analyzing APIs...")
    listPackages(packagesPath).forEach(path => {
        const config = ExtractorConfig.loadFileAndPrepare(join(packagesPath, path, 'api-extractor.json'))
        console.log(`Analyzing APIs of ${path}`)
        Extractor.invoke(config)
    })
    console.timeEnd("Analyzing APIs...")
    console.time("Building markdown files")
    execSync(`yarn api-documenter markdown -i ${temp} -o ${docs}`)
    console.timeEnd("Building markdown files")
    console.time("Processing macros")
    await Promise.all(
        readdirSync(docs, { withFileTypes: true })
            .filter(f => f.isFile())
            .map(({ name }) => processMacros(docs, name, createIndexParser(indexHeaderPath))))
    console.timeEnd("Processing macros")
}    
