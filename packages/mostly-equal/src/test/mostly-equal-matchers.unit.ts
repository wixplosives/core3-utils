import * as chai from 'chai';
import { expect } from 'chai';
import {
    notImportant,
    equal,
    defined,
    defineUnique,
    defineSame,
    thumbsUp,
    mostlyEqlChaiPlugin,
    type AllowMarkers,
} from '../index.js';
chai.use(mostlyEqlChaiPlugin);

describe('mostly equal matchers', () => {
    describe('notImportant', () => {
        it('should not throw for fields marked with not important', () => {
            interface Actual {
                a: number;
                b?: number;
            }
            const actual: Actual = {
                a: 1,
            };
            const expected: AllowMarkers<Actual> = {
                a: notImportant,
                b: notImportant,
            };

            expect(() => {
                expect(actual).to.mostlyEqual(expected);
            }).to.not.throw();
        });
    });
    describe('defined', () => {
        it('should not throw for fields marked with defined if value is defined', () => {
            expect(() => {
                expect({
                    a: 1,
                }).to.mostlyEqual({
                    a: defined,
                });
            }).to.not.throw();
        });
        it('should throw for fields marked with defined if value is undefined', () => {
            expect(() => {
                expect({
                    a: undefined,
                }).to.mostlyEqual({
                    a: defined,
                });
            }).to.throw('expected undefined to not equal undefined');
        });
        it('should throw for fields marked with defined if field is not defined', () => {
            expect(() => {
                expect({}).to.mostlyEqual({
                    a: defined,
                });
            }).to.throw('expected undefined to not equal undefined');
        });
    });

    describe('defineUnique', () => {
        it('should throw if value is not unique', () => {
            const id = defineUnique('id');
            expect(() => {
                expect({
                    a: 'a',
                    b: 'b',
                    c: 'a',
                }).to.mostlyEqual({
                    a: id,
                    b: id,
                    c: id,
                });
            }).to.throw('id - is not unique');
        });
        it('should not throw if value is unique', () => {
            const id = defineUnique('id');
            expect(() => {
                expect({
                    a: 'a',
                    b: 'b',
                    c: 'c',
                }).to.mostlyEqual({
                    a: id,
                    b: id,
                    c: id,
                });
            }).to.not.throw();
        });
        it('should allow undefined if allowUndefined is set to true', () => {
            const id = defineUnique('id', true);
            expect(() => {
                expect({
                    a: 'a',
                    b: 'b',
                    c: undefined,
                }).to.mostlyEqual({
                    a: id,
                    b: id,
                    c: id,
                    d: id,
                });
            }).to.not.throw();
        });
    });
    describe('defineSame', () => {
        it('should throw if value is not equal', () => {
            const id = defineSame('ids');
            expect(() => {
                expect({
                    a: 'a',
                    b: 'c',
                    c: 'a',
                }).to.mostlyEqual({
                    a: id,
                    b: id,
                    c: id,
                });
            }).to.throw('ids - are not equal');
        });
        it('should not throw if value is equal', () => {
            const id = defineSame('id');
            expect(() => {
                expect({
                    a: 'a',
                    b: 'a',
                    c: 'a',
                }).to.mostlyEqual({
                    a: id,
                    b: id,
                    c: id,
                });
            }).to.not.throw();
        });
        it('should allow undefined if allowUndefined is set to true', () => {
            const id = defineSame('ids', true);
            expect(() => {
                expect({
                    a: 'a',
                    b: 'a',
                    c: undefined,
                }).to.mostlyEqual({
                    a: id,
                    b: id,
                    c: id,
                    d: id,
                });
            }).to.not.throw();
        });
    });
    describe('equal', () => {
        it('should throw if not values are not strictly equal', () => {
            expect(() => {
                expect({
                    a: {},
                }).to.mostlyEqual({
                    a: equal({}),
                });
            }).to.throw('expected {} to equal {}');
        });
        it('should not throw if not values are strictly equal', () => {
            const obj = {};

            expect(() => {
                expect({
                    a: obj,
                }).to.mostlyEqual({
                    a: equal(obj),
                });
            }).to.not.throw();
        });
        it('if stricly equal and truncateData is not set prints a thumbs up instead of content', () => {
            const obj = {};
            expect(() => {
                expect({
                    a: obj,
                }).to.mostlyEqual({
                    a: equal(obj),
                    b: 'something',
                });
            }).to.throw(thumbsUp);
        });
        it('if stricly equal and truncateData is set to true, prints content', () => {
            const obj = {};
            expect(() => {
                expect({
                    a: obj,
                }).to.mostlyEqual({
                    a: equal(obj, false),
                    b: 'something',
                });
            }).to.throw('{}');
        });
    });
});
