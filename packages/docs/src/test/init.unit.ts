/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { existsSync } from "fs";
import { resolve } from "path";
import { expect } from "chai";
import { loadJson, testDir, config, setup, clean } from "./test-common";

describe('init', () => {
    // since this this is a longish process, 
    // ini t is called only once, all test are checking the resulting files
    // tests do not mutate anything
    // init is executed in "setup"
    before(setup)
    after(clean)
    it('generates docs config files and templates', () => {
        const base = loadJson(config.base, config.conf, 'api-extractor.base.json')
        // input
        expect(base?.mainEntryPointFilePath).to.equal(`<projectFolder>/${testDir(config.packages)}/<unscopedPackageName>/dist/cjs/index.d.ts`)
        // temp dir
        expect(base?.apiReport?.reportFolder).to.equal(`<projectFolder>/${testDir(config.temp)}/`)
        expect(base?.apiReport?.reportTempFolder).to.equal(`<projectFolder>/${testDir(config.temp)}/`)
        expect(base?.docModel?.apiJsonFilePath).to.equal(`<projectFolder>/${testDir(config.temp)}/<unscopedPackageName>.api.json`)
        // output

    })
    it('generates a "api-extractor.json" in each package', () => {
        const one = testDir(config.packages, 'one')
        const apiExConf1 = loadJson(one, 'api-extractor.json')
        expect(resolve(one, apiExConf1?.extends)).to.equal(
            resolve(testDir(config.conf, 'api-extractor.base.json')))
        const two = testDir(config.packages, 'two')
        const apiExConf2 = loadJson(one, 'api-extractor.json')
        expect(resolve(two, apiExConf2?.extends)).to.equal(
            resolve(testDir(config.conf, 'api-extractor.base.json')))
    })
    it('creates a github action that updates github pages', () => {
        expect(existsSync(testDir('.github', 'workflows', 'jekyll-gh-pages.yml')))
    })
})