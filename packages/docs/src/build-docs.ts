/* eslint-disable no-console */
import {  join } from 'path'
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'
import { execSync } from 'child_process'
import { readdirSync } from 'fs'
import { createHeadersModifier, processMacros } from './macros'
import { listPackages } from './common'
/**
 * 
 * @param packagesPath 
 */
export async function buildDocs(packagesPath:string, docs:string, headers:string) {
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
            .map(({ name }) => processMacros(docs, name, createHeadersModifier(headers))))
    console.timeEnd("Processing macros")
}    
