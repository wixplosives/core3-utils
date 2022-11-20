import { expect } from 'chai';
import { buildDocs } from '../build-docs';
import { setup, clean, config } from './test-common';
import { _config, _docs, _temp } from '../common';
import { validateExamples } from '../validate-examples';

describe('validateExamples', function () {
    before(setup);
    before(function () {
        this.timeout(15_000);
        buildDocs(_config(config), false);
    });
    after(clean);

    describe('@example with no ref', () => {
        it(`doesn't throw`, () => {
            validateExamples(config, 'two.api.json')
        })
    })
    describe('@example with ref', () => {
        describe('a valid ref', () => {
            it('throws when the file is out of sync', () => {
                expect(() => validateExamples(config, 'one.api.json')).to.throw("Outdated example")
            })
            it('does not throw when the file is in sync', () => {
                validateExamples(config, 'two.api.json')
            })
        })
        describe('missing ref', () => {
            it('throws for missing example ref', () => {
                expect(() => validateExamples(config, 'different-name.api.json')).to.throw("Missing example reference")
            })
        })
    })
})