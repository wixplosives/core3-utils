import { expect } from 'chai';
import { buildDocs } from '../build-docs/build-docs';
import { setup, clean, config, overwriteTemplate, readDoc, docExists, runMacro } from './test-common';
import * as macros from '../macros';
import { existsSync, rmSync } from 'fs';
import { _config, _docs, _temp } from '../common';
import type { Macro, Macros } from '../macros.types';

describe('buildDocs', function () {
    before(() => setup());
    before(function () {
        this.timeout(15_000);
        // analyze once for all the tests
        buildDocs(config, {
            analyze: true,
            validateExamples: false,
            evaluateMacros: false,
            generateMarkdown: false,
            prettify: false,
        });
    });
    after(clean);
    describe('analyze step', () => {
        it('generate api jsons in the temp directory', () => {
            expect(existsSync(_temp(config, 'one.api.json'))).to.equal(true);
            expect(existsSync(_temp(config, 'two.api.json'))).to.equal(true);
        });
        it('generate api jsons for packages with names that are different than their directory name', () => {
            expect(existsSync(_temp(config, 'different-name.api.json'))).to.equal(true);
        });
    });

    describe('generateMarkdown step', () => {
        it('builds readme files in the docs directory', function () {
            buildDocs(config, { validateExamples: false, analyze: false, prettify: false });

            expect(docExists('index.md')).to.equal(true);
            expect(docExists('one.md')).to.equal(true);
            expect(docExists('one.test1.md')).to.equal(true);
            expect(docExists('two.md')).to.equal(true);
            expect(docExists('two.test1.md')).to.equal(true);
        });
        it('includes headers', function () {
            overwriteTemplate('index.md', 'INDEX_HEADER');
            overwriteTemplate('item.md', 'ITEM_HEADER');
            overwriteTemplate('package.md', 'PACKAGE_HEADER');

            buildDocs(config, { analyze: false, prettify: false, validateExamples: false });

            expect(readDoc('index.md')).to.match(/INDEX_HEADER/);
            expect(readDoc('one.md')).to.match(/PACKAGE_HEADER/);
            expect(readDoc('two.test1.md')).to.match(/ITEM_HEADER/);
        });
        it('evaluates macros, passing config filename and args', function () {
            overwriteTemplate('index.md', '[[[macro 1 !]]]');

            buildDocs(config, { analyze: false, prettify: false, validateExamples: false }, {
                macro: (conf, docFileName, a, b) => {
                    expect(conf).to.deep.include(config);
                    expect(docFileName).to.eql('index.md');
                    return `MACRO${a}${b}`;
                },
            } as Macros);

            expect(readDoc('index.md')).to.match(/MACRO1!/);
        });
    });

    describe('builtin macros', () => {
        before(function () {
            this.timeout(10_000);
            buildDocs(config, { analyze: false, prettify: false, validateExamples: false });
        });
        beforeEach(() => {
            rmSync(_docs(config), { recursive: true });
        });
        it('runMacro', () => {
            expect(runMacro('NO_SUCH_MACRO')).to.equal('[[[NO_SUCH_MACRO ]]]');
            expect(runMacro('NO_SUCH_MACRO', 'one.md')).to.equal('[[[NO_SUCH_MACRO ]]]');
            expect(runMacro('NO_SUCH_MACRO', 'one.test1.md')).to.equal('[[[NO_SUCH_MACRO ]]]');
        });

        it('does not run macro comments - `[[[comment]]]`', () => {
            const comment: Macro = () => 'error';
            overwriteTemplate('index.md', '`[[[comment]]]`');
            buildDocs(config, { analyze: false, prettify: false, validateExamples: false }, { comment });
            const content = readDoc('index.md');
            expect(content).to.match(/`\[\[\[comment\]\]\]`/g);
            expect(content).not.to.match(/error/g);
        });

        it('rootPackageName', () => {
            expect(runMacro(macros.rootPackageName)).to.eql('main');
        });

        it('packageNameUrl', () => {
            expect(runMacro(macros.packageNameUrl, 'one.md')).to.equal('@test%2Fone');
        });

        it('packageName', () => {
            expect(runMacro(macros.packageName, 'one.md')).to.equal('@test/one');
        });

        it('unscopedPackageName', () => {
            expect(runMacro(macros.unscopedPackageName, 'one.md')).to.equal('one');
        });

        it('github', () => {
            expect(runMacro(macros.github, 'two.md')).to.equal(
                '[@test/two on Github](https://github.com/org/repo/tree/master/packages/two)',
            );
            expect(runMacro(macros.github, 'two.test1.md')).to.equal(
                '[@test/two on Github](https://github.com/org/repo/tree/master/packages/two)',
            );
            expect(runMacro(macros.github)).to.equal(
                '[main on Github](https://github.com/org/repo/tree/master/packages/main)',
            );
        });
        it('githubPages', () => {
            expect(runMacro(macros.githubPages)).to.equal('https://org.github.io/repo');
        });
        it('gitRepo', () => {
            expect(runMacro(macros.gitRepo)).to.equal('https://github.com/org/repo');
            expect(runMacro(macros.gitRepo, 'one.md', 'org')).to.equal('org');
            expect(() => runMacro(macros.gitRepo, 'one.md', 'invalid')).to.throw();
        });
        it('include', () => {
            expect(runMacro(macros.include, 'index.md', '../include.md')).to.equal('Included!');
        });
        it('npmBadge', () => {
            expect(runMacro(macros.npmBadge, 'one.md')).to.equal(
                '[![npm version](https://badge.fury.io/js/@test%2Fone.svg)](https://badge.fury.io/js/@test%2Fone)',
            );
        });
        it('githubBuildStatus', () => {
            expect(runMacro(macros.githubBuildStatus)).to.equal(
                '[![Build Status](https://github.com/org/repo/workflows/tests/badge.svg)](https://github.com/org/repo/actions)',
            );
        });
    });
});
