/* eslint-disable @typescript-eslint/no-unsafe-return */
import { expect } from "chai"
import { buildDocs } from "../build-docs"
import { setup, clean, config, overwriteTemplate, readDoc, docExists, runMacro } from "./test-common"
import { macros } from '../macros'
import { existsSync } from "fs"
import { _config, _temp } from "../common"

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
        beforeEach(setup)

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
                '[@test/two on Github](https://github.com/wixplosives/core3-utils/tree/master/packages/two)'
            )
            expect(runMacro(macros.github, 'two.test1.md')).to.equal(
                '[@test/two on Github](https://github.com/wixplosives/core3-utils/tree/master/packages/two)'
            )
            expect(runMacro(macros.github)).to.equal(
                '[main on Github](https://github.com/wixplosives/core3-utils/tree/master/packages/main)'
            )
        })
        it('githubPages', () => {
            expect(runMacro(macros.githubPages)).to.equal(
                'https://wixplosives.github.io/core3-utils')
        })
        it('gitRepo', () => {
            expect(runMacro(macros.gitRepo)).to.equal(
                'https://github.com/wixplosives/core3-utils')
            expect(runMacro(macros.gitRepo, 'one.md', 'org')).to.equal(
                'wixplosives')
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
                '[![Build Status](https://github.com/wixplosives/core3-utils/workflows/tests/badge.svg)](https://github.com/wixplosives/core3-utils/actions)')
        })
       
        // describe('validate', function ()  {
        //     this.timeout(5_000)
        //     const example = `
        //     \`\`\`ts
        //     const a=1
        //     return a
        //     \`\`\``

        //     it('throws when file or snippetId is not found', () => {
        //         expect(() => runMacro(macros.validate, 'index.md',
        //             'packages/one/src/index.ts',
        //             'missing',
        //             example
        //         )).to.throw()
        //         expect(() => runMacro(macros.validate, 'index.md',
        //             example
        //         )).to.throw()
        //     })

        //     it('does not change the example when valid', () => {
        //        /// [[[example1
        //         expect(runMacro(macros.validate, 'index.md',
        //             'packages/one/src/index.ts',
        //             'example',
        //             example
        //         // ]]]
        //         )).to.equal(example.trim())
        //     })

        //     it('throws when the example is stale', () => {
        //         expect(() => runMacro(macros.validate, 'index.md',
        //             'packages/one/src/index.ts',
        //             'example', `
        //             \`\`\`ts
        //                 // different than ref
        //             \`\`\``
        //         )).to.throw(/Stale example/)
        //     })
        // })
    })
})
