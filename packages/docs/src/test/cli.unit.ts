import { expect } from "chai";
import { spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { after } from "mocha";
import { _config, _docs, _packages } from "../common";
import { clean, config, setup } from "./test-common";

describe('cli', function () {
    this.timeout(15_000)
    before(() => setup(false))
    before(() => {
        try {
            spawnSync('git', ['remote', 'add', 'origin', 'git@github.com:wixplosives/core3-utils.git'])
        } catch {/* Applicable in CI, where git remote is not set */ }
    })
    after(clean)

    it('init', () => {
        spawnSync('yarn', ['docs', 'init', '-b', config.base, '-c', config.conf, '-o', config.docs, '-t', config.temp, '-s', 'https:/test.site.com'])
        expect(JSON.parse(readFileSync(_config(config, 'config.json'), 'utf8'))).to.eql({
            ...config,
            siteUrl: "https:/test.site.com",
            git: {
                host: "github.com",
                org: "wixplosives",
                repo: "core3-utils",
                pages: "https://wixplosives.github.io/core3-utils",
                github: "https://github.com/wixplosives/core3-utils"
            }
        }, 'failed docs init')

        spawnSync('yarn', ['docs', 'build', '-b', config.base, '-c', config.conf])
        expect(existsSync(_docs(config, 'index.md'))).to.equal(true, 'failed docs build')

        spawnSync('yarn', ['docs', 'readme', '-b', config.base, '-c', config.conf])
        expect(existsSync(_packages(config, '..', 'README.md'))).to.equal(true, 'failed docs readme')
    })
});
