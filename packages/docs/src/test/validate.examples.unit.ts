import { expect } from 'chai';
import { buildDocs } from '../build-docs';
import { setup, clean, config } from './test-common';
import * as macros from '../macros';
import { existsSync, rmSync } from 'fs';
import { _config, _docs, _temp } from '../common';
import type { Macro, Macros } from '../macros.types';
import { validateExamples } from '../validate-examples';

describe('validateExamples', function () {
    before(setup);
    before(function () {
        this.timeout(15_000);
        buildDocs(_config(config), false);
    });
    after(clean);

    // describe('@example with no ref', () => {
    //     it('does nothing', () => {

    //     })
    // })
    describe('@example with ref', () => {
        describe('a valid ref', () => {
            it('throws when the file is out of sync', () => {
                expect(validateExamples(_temp(config, 'two.api.json')))
            })
            // it('does not throw when the file is in sync', () => {

            // })
            // it('does not throw when the diff is in white space', () => {

            // })
            // it('allows for the same ref in different packages', () => {

            // })
        })
        // describe('an invalid ref', () => {
        //     it('throws for missing example ref', () => {

        //     })
        // })
    })
})