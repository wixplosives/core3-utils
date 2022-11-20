/* eslint-disable @typescript-eslint/no-unsafe-return */
import { expect } from 'chai';
import { buildDocs } from '../build-docs/build-docs';
import { setup, clean, config } from './test-common';
import { existsSync, readFileSync } from 'fs';
import { _config, _docs, _packages, _temp } from '../common';
import { createReadme } from '../create-readme';

describe('readme', function () {
    before(() => setup());
    before(function () {
        // since this this is a longish process,
        // init & buildDocs is called only once, all test are checking the resulting files
        // tests do not mutate anything
        // init is executed in "setup"
        this.timeout(15_000);
        buildDocs(config);
        createReadme(config)
    });
    after(clean);
    it('builds README.md files in the src directory of each package', function () {
        expect(existsSync(_packages(config, 'one', 'README.md'))).to.equal(true);
        expect(existsSync(_packages(config, 'two', 'README.md'))).to.equal(true);
        expect(existsSync(_packages(config, 'weird', 'README.md'))).to.equal(true);
    });
    it('builds README.md in the source root', function () {
        expect(existsSync(_packages(config, '..', 'README.md'))).to.equal(true);
        const content = readFileSync(_packages(config, '..', 'README.md'), 'utf8')
        expect(content).to.match(/\[@test\/one\]/);
        expect(content).to.match(/\[@test\/two\]/);
        expect(content).to.match(/\[@test\/different-name\]/);
    });
});
