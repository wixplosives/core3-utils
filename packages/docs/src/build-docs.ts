import { dirname, join } from 'path'
import { GlobSync } from 'glob'
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'
import { execSync } from 'child_process'
const packages = new GlobSync(join(__dirname, '..', '..', '*', 'package.json'))
packages.found.filter(p => !p.includes('docs')).forEach(path => {
    path = dirname(path)
    const config = ExtractorConfig.loadFileAndPrepare(join(path, 'api-extractor.json'))
    Extractor.invoke(config)
})
execSync('yarn api-documenter markdown -i temp -o .docs')