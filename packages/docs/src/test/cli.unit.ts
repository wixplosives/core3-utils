import { expect } from 'chai';
import { spawnSync } from 'child_process';
import { existsSync, readFileSync, rmSync } from 'fs';
import { after } from 'mocha';
import { _config, _docs, _packages, _temp } from '../common';
import { clean, config, setup } from './test-common';

const args = ['-b', config.base, '-c', config.conf];

describe('cli', function () {
    this.timeout(25_000);
    before(() => setup(false));
    before(() => {
        spawnSync('npx', [
            'docs',
            'init',
            ...args,
            '-d',
            config.docs,
            '-t',
            config.temp,
            '-s',
            'https:/test.site.com',
            '-o',
            'git@github.com:test/docs.git',
            '-e',
            'src',
        ]);
    });
    afterEach(() => {
        rmSync(_temp(config), { force: true, recursive: true });
    });
    after(clean);

    describe('docs init', () => {
        it('creates the config file', () => {
            expect(JSON.parse(readFileSync(_config(config, 'config.json'), 'utf8'))).to.eql(
                {
                    ...config,
                    siteUrl: 'https:/test.site.com',
                    origin: 'git@github.com:test/docs.git',
                    examples: 'src',
                    git: {
                        host: 'github.com',
                        org: 'test',
                        repo: 'docs',
                        pages: 'https://test.github.io/docs',
                        github: 'https://github.com/test/docs',
                    },
                },
                'failed docs init',
            );
        });
    });

    describe('docs build', () => {
        it('validates examples', () => {
            const execInvalid = spawnSync('npx', ['docs', 'build', ...args]);
            expect(execInvalid.status, execInvalid.stderr.toString()).to.equal(1);
            removeFailingPackages();
            const execValid = spawnSync('npx', ['docs', 'build', '-a', ...args]);
            expect(execValid.status, execValid.stderr.toString()).to.equal(0);
        });
        it('generates docs', () => {
            removeFailingPackages();

            const exec = spawnSync('npx', ['docs', 'build', ...args]);
            expect(exec.status, exec.stderr.toString()).to.equal(0);
            expect(existsSync(_docs(config, 'index.md'))).to.equal(true, 'failed docs build');
            expect(existsSync(_docs(config, 'two.md'))).to.equal(true, 'failed docs build');
            expect(existsSync(_docs(config, 'two.test1.md'))).to.equal(true, 'failed docs build');
        });
    });
    describe('readme', () => {
        before(() => {
            rmSync(_packages(config, 'one'), { force: true, recursive: true });
            rmSync(_packages(config, 'weird'), { force: true, recursive: true });

            const exec = spawnSync('npx', ['docs', 'build', ...args]);
            expect(exec.status, exec.stderr.toString()).to.equal(0);
        });
        it('generated readme in packages root', () => {
            const exec = spawnSync('npx', ['docs', 'readme', ...args]);
            expect(exec.status, exec.stderr.toString()).to.equal(0);

            expect(existsSync(_packages(config, '..', 'README.md'))).to.equal(true, 'failed docs readme');
            expect(existsSync(_packages(config, 'two', 'README.md'))).to.equal(true, 'failed docs readme');
        });
    });
});
function removeFailingPackages() {
    rmSync(_packages(config, 'one'), { force: true, recursive: true });
    rmSync(_packages(config, 'weird'), { force: true, recursive: true });
    rmSync(_temp(config, 'one.api.json'), { force: true });
    rmSync(_temp(config, 'different-name.api.json'), { force: true });
}
