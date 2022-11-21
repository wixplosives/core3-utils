import { expect } from "chai";
import { spawnSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { after } from "mocha";
import { _config, _docs, _packages } from "../common";
import { clean, config, setup } from "./test-common";

describe('cli', function () {
    this.timeout(25_000)
    before(() => setup(false))
    after(clean)

    it('init, build, readme', () => {
        spawnSync('yarn', ['docs', 'init', '-b', config.base, '-c', config.conf, '-d', config.docs, '-t', config.temp, '-s', 'https:/test.site.com', '-o', 'git@github.com:test/docs.git', '-e', 'src'])
        expect(JSON.parse(readFileSync(_config(config, 'config.json'), 'utf8'))).to.eql({
            ...config,
            siteUrl: "https:/test.site.com",
            origin: "git@github.com:test/docs.git",
            examples: 'src',
            git: {
                host: "github.com",
                org: "test",
                repo: "docs",
                pages: "https://test.github.io/docs",
                github: "https://github.com/test/docs"
            }
        }, 'failed docs init')

        spawnSync('yarn', ['docs', 'build', '-b', config.base, '-c', config.conf])
        expect(existsSync(_docs(config, 'index.md'))).to.equal(true, 'failed docs build')

        spawnSync('yarn', ['docs', 'readme', '-b', config.base, '-c', config.conf])
        expect(existsSync(_packages(config, '..', 'README.md'))).to.equal(true, 'failed docs readme')
    })
});
