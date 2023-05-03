/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { expect } from 'chai';
import { loadJson, config, setup, clean } from './test-common';
import { _config, _packages, _temp } from '../common';

describe('init', function () {
    // since this this is a longish process,
    // init is called only once, all test are checking the resulting files
    // tests do not mutate anything
    // init is executed in "setup"
    this.timeout(10_000);
    before(() => setup());
    after(clean);
    it('generates docs config files and templates', () => {
        const base = loadJson(_config(config, 'api-extractor.base.json'));
        // input
        expect(base?.mainEntryPointFilePath).to.equal(
            `<projectFolder>/${_packages(config)}/<unscopedPackageName>/dist/cjs/index.d.ts`
        );
        // temp dir
        expect(base?.apiReport?.reportFolder).to.equal(`<projectFolder>/${_temp(config)}/`);
        expect(base?.apiReport?.reportTempFolder).to.equal(`<projectFolder>/${_temp(config)}/`);
        expect(base?.docModel?.apiJsonFilePath).to.equal(
            `<projectFolder>/${_temp(config)}/<unscopedPackageName>.api.json`
        );
        // output
    });
    it('generates a "api-extractor.json" in each package', () => {
        const one = _packages(config, 'one');
        const apiExConf1 = loadJson(one, 'api-extractor.json');
        expect(resolve(one, apiExConf1?.extends)).to.equal(resolve(_config(config, 'api-extractor.base.json')));
        const two = _packages(config, 'two');
        const apiExConf2 = loadJson(one, 'api-extractor.json');
        expect(resolve(two, apiExConf2?.extends)).to.equal(resolve(_config(config, 'api-extractor.base.json')));
    });
    it('creates a github action that updates github pages', () => {
        expect(existsSync(join(config.base, '.github', 'workflows', 'jekyll-gh-pages.yml')));
    });
});
