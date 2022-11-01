/* eslint-disable @typescript-eslint/no-unsafe-return */
import { expect } from "chai"
import { buildDocs } from "../build-docs"
import { setup, clean, config, overwriteTemplate, readDoc, docExists, runMacro } from "./test-common"
import { macros } from '../macros'
import { existsSync, rmSync } from "fs"
import { _config, _docs, _temp } from "../common"

describe('buildDocs', () => {
    before(setup)
    before(function () {
        this.timeout(5_000)
        buildDocs(_config(config), false)
    })
    after(clean)
    it('builds readme files in the docs directory', function () {
        expect(docExists('index.md')).to.equal(true)
        expect(docExists('one.md')).to.equal(true)
        expect(docExists('one.test1.md')).to.equal(true)
        expect(docExists('two.md')).to.equal(true)
        expect(docExists('two.test1.md')).to.equal(true)
    })
    it('generate api jsons in the temp directory', ()=>{
        expect(existsSync(_temp(config, 'one.api.json'))).to.equal(true)
        expect(existsSync(_temp(config, 'two.api.json'))).to.equal(true)
    })
    it('includes headers', function () {
        overwriteTemplate('index.md', 'INDEX_HEADER')
        overwriteTemplate('item.md', 'ITEM_HEADER')
        overwriteTemplate('package.md', 'PACKAGE_HEADER')

        buildDocs(_config(config), true)

        expect(readDoc('index.md')).to.match(/INDEX_HEADER/)
        expect(readDoc('one.md')).to.match(/PACKAGE_HEADER/)
        expect(readDoc('two.test1.md')).to.match(/ITEM_HEADER/)
    })
    it('evaluates macros, passing config filename and args', function () {
        overwriteTemplate('index.md', '[[[macro 1 !]]]')

        buildDocs(_config(config), true, {
            macro: (conf, docFileName, a, b) => {
                expect(conf).to.deep.include(config)
                expect(docFileName).to.eql('index.md')
                return `MACRO${a}${b}`
            }
        })

        expect(readDoc('index.md')).to.match(/MACRO1!/)
    })

    describe('builtin macros', () => {
        before(function () {
            this.timeout(5_000)
            buildDocs(_config(config), false)
        })
        beforeEach(()=>{
            rmSync(_docs(config), {recursive:true})
        })
        it('runMacro', () => {
            expect(runMacro('NO_SUCH_MACRO')).to.equal('[[[NO_SUCH_MACRO ]]]')
            expect(runMacro('NO_SUCH_MACRO', 'one.md')).to.equal('[[[NO_SUCH_MACRO ]]]')
            expect(runMacro('NO_SUCH_MACRO', 'one.test1.md')).to.equal('[[[NO_SUCH_MACRO ]]]')
        })

        it('rootPackageName', () => {
            expect(runMacro(macros.rootPackageName)).to.eql('main')
        })

        it('packageNameUrl', () => {
            expect(runMacro(macros.packageNameUrl, 'one.md')).to.equal('@test%2Fone')
        })

        it('packageName', () => {
            expect(runMacro(macros.packageName, 'one.md')).to.equal('@test/one')
        })

        it('unscopedPackageName', () => {
            expect(runMacro(macros.unscopedPackageName, 'one.md')).to.equal('one')
        })

        it('github', () => {
            expect(runMacro(macros.github, 'two.md')).to.equal(
                '[@test/two on Github](https://github.com/org/repo/tree/master/packages/two)'
            )
            expect(runMacro(macros.github, 'two.test1.md')).to.equal(
                '[@test/two on Github](https://github.com/org/repo/tree/master/packages/two)'
            )
            expect(runMacro(macros.github)).to.equal(
                '[main on Github](https://github.com/org/repo/tree/master/packages/main)'
            )
        })
        it('githubPages', () => {
            expect(runMacro(macros.githubPages)).to.equal(
                'https://org.github.io/repo')
        })
        it('gitRepo', () => {
            expect(runMacro(macros.gitRepo)).to.equal(
                'https://github.com/org/repo')
            expect(runMacro(macros.gitRepo, 'one.md', 'org')).to.equal(
                'org')
            expect(() => runMacro(macros.gitRepo, 'one.md', 'invalid')).to.throw()
        })
        it('include', () => {
            expect(runMacro(macros.include, 'index.md', '../include.md')).to.equal(
                'Included!')
        })
        it('npmBadge', () => {
            expect(runMacro(macros.npmBadge)).to.equal(
                '[![npm version](https://badge.fury.io/js/main.svg)](https://badge.fury.io/js/main)')
        })
        it('githubBuildStatus', () => {
            expect(runMacro(macros.githubBuildStatus)).to.equal(
                '[![Build Status](https://github.com/org/repo/workflows/tests/badge.svg)](https://github.com/org/repo/actions)')
        })
    })
})
