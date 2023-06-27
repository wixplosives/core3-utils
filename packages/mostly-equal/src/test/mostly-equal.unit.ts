/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import chai, { expect } from 'chai';
import { expectValue, expectValues, mostlyEqlChaiPlugin, setSuiteOptions } from '../index';
import { clearMatchedValues, getMatchedValues } from '../mostly-equal';
import type { ExpandedValues, Formatter } from '../types';

chai.use(mostlyEqlChaiPlugin);

describe('mostly equal', () => {
    describe('simple matching', () => {
        it('should not throw if objects are eql', () => {
            expect(() => {
                expect({
                    a: 'a string',
                    b: ['an', 'array'],
                    aNestedObject: {
                        withAnotherField: 'aasd',
                    },
                }).to.mostlyEqual({
                    a: 'a string',
                    b: ['an', 'array'],
                    aNestedObject: {
                        withAnotherField: 'aasd',
                    },
                });
            }).to.not.throw();
        });
        it('should throw an error when expected has extra field', () => {
            expect(() => {
                expect({ a: 'a' }).to.mostlyEqual({});
            }).to.throw('a exists in actual but not in expected');
        });
        it('should throw an error when actual has extra field', () => {
            expect(() => {
                expect({}).to.mostlyEqual({ a: 'a' });
            }).to.throw('a exists in expected but not in actual');
        });
        it('should throw an error when array length dont match', () => {
            expect(() => {
                expect({ a: ['a'] }).to.mostlyEqual({ a: [] });
            }).to.throw('expected length 0 but got 1');
        });
        it('should throw an error when actual is an array but expected isnt', () => {
            expect(() => {
                expect({ a: ['a'] }).to.mostlyEqual({ a: 'a' });
            }).to.throw('expected "a" but got [');
        });
        it('should throw an error when expected is an array but actual isnt', () => {
            expect(() => {
                expect({ a: 'a' }).to.mostlyEqual({ a: ['a'] });
            }).to.throw('] but got "a"');
        });
        it('should throw an error when actual is an object but expected isnt', () => {
            expect(() => {
                expect({ a: {} }).to.mostlyEqual({ a: 'a' });
            }).to.throw('expected "a" but got {');
        });
        it('should throw an error when expected is an object but actual isnt', () => {
            expect(() => {
                expect({ a: 'a' }).to.mostlyEqual({ a: {} });
            }).to.throw('expected {} but got "a"');
        });
        it('should throw an error when primitive values mismatch', () => {
            expect(() => {
                expect({ a: 'a' }).to.mostlyEqual({ a: 'b' });
            }).to.throw('expected "b" but got "a"');
        });
        it('should ignore property getters', () => {
            expect(() => {
                expect({
                    a: 'a',
                    get b() {
                        return 'b';
                    },
                }).to.mostlyEqual({ a: 'a' });
            }).to.not.throw();
        });
    });

    describe('expectValue', () => {
        it('should throw if the user matcher throws', () => {
            expect(() => {
                expect({
                    a: 1,
                }).to.mostlyEqual({
                    a: expectValue((val) => {
                        expect(val).to.equal(2);
                    }),
                });
            }, 'user matcher run').to.throw('expected 1 to equal 2');
        });
        it('should work when nested', () => {
            expect(() => {
                expect({
                    a: {
                        b: ['gaga'],
                    },
                }).to.mostlyEqual({
                    a: {
                        b: [
                            expectValue((val) => {
                                expect(val).to.equal('baga');
                            }),
                        ],
                    },
                });
            }).to.throw("expected 'gaga' to equal 'baga'");
        });
        it('should call user matcher with undefined if the field is missing', () => {
            expect(() => {
                expect({}).to.mostlyEqual({
                    a: expectValue((val) => {
                        expect(val).to.equal('baga');
                    }),
                });
            }).to.throw("expected undefined to equal 'baga'");
        });
        it('should print user matcher return value if it did not return void', () => {
            expect(() => {
                expect({ a: 'gaga' }).to.mostlyEqual({
                    a: expectValue((val) => {
                        expect(val).to.equal('gaga');
                        return '"baga"';
                    }),
                    b: 'another field so we do throw',
                });
            }).to.throw('"baga"');
        });
        describe('getting matched values', () => {
            it('should allow getting matched values', () => {
                const matcher = expectValue((val) => {
                    expect(val).to.equal(2);
                });
                expect(() => {
                    expect({
                        a: 1,
                        b: 2,
                    }).to.mostlyEqual({
                        a: matcher,
                        b: matcher,
                    });
                }, 'user matcher run').to.throw('expected 1 to equal 2');

                const actualMatched = getMatchedValues(matcher);
                const expectedMatched: ExpandedValues<number> = [
                    {
                        fieldDefinedInParent: true,
                        path: ['a'],
                        value: 1,
                    },
                    {
                        fieldDefinedInParent: true,
                        path: ['b'],
                        value: 2,
                    },
                ];
                expect(actualMatched, 'matched values').eql(expectedMatched);

                clearMatchedValues(matcher);

                expect(getMatchedValues(matcher), 'matched values').eql([]);
            });
        });
    });
    describe('expectValues', () => {
        it('should call user matcher for with all instances at once', () => {
            const expectedInstances = ['a', 'b'];
            const expectedInstancesInfo: ExpandedValues<string> = [
                {
                    path: ['a'],
                    fieldDefinedInParent: true,
                    value: 'a',
                },
                {
                    path: ['b'],
                    fieldDefinedInParent: true,
                    value: 'b',
                },
            ];
            const myExpectValue = expectValues<string>((instances, infos) => {
                expect(instances).to.eql(expectedInstances);
                expect(infos).to.eql(expectedInstancesInfo);
            });
            expect(() => {
                expect({
                    a: expectedInstances[0],
                    b: expectedInstances[1],
                }).to.mostlyEqual({
                    a: myExpectValue,
                    b: myExpectValue,
                });
            }).to.not.throw();
        });
        it('should call user matcher with undefined items from expected if allow undefined is set to true', () => {
            const expectedInstances = ['a', undefined];
            const expectedInstancesInfo: ExpandedValues<string> = [
                {
                    path: ['a'],
                    fieldDefinedInParent: true,
                    value: 'a',
                },
                {
                    path: ['b'],
                    fieldDefinedInParent: false,
                    value: undefined,
                },
            ];

            const myExpectValue = expectValues<string>((instances, infos) => {
                expect(instances).to.eql(expectedInstances);
                expect(infos).to.eql(expectedInstancesInfo);
            }, true);
            expect(() => {
                expect({
                    a: expectedInstances[0],
                }).to.mostlyEqual({
                    a: myExpectValue,
                    b: myExpectValue,
                });
            }).to.not.throw();
        });
        it('if user matcher throws, print error in every occurance', () => {
            const myExpectValue = expectValues<string>(() => {
                throw new Error('error-text');
            });
            expect(() => {
                expect({
                    a: 'a',
                    b: 'b',
                    c: 'c',
                }).to.mostlyEqual({
                    a: myExpectValue,
                    b: myExpectValue,
                    c: myExpectValue,
                });
            }).to.throw('error-text');
        });
        describe('expectValues - matcher returns array', () => {
            it('if user matcher returns an array of error objects or undefined, the errors should be shown by all the items', () => {
                const myExpectValue = expectValues<string>(() => {
                    return [undefined, new Error('error-text')];
                });
                expect(() => {
                    expect({
                        a: 'a',
                        b: 'b',
                        c: 'c',
                    }).to.mostlyEqual({
                        a: myExpectValue,
                        b: myExpectValue,
                        c: myExpectValue,
                    });
                }).to.throw('error-text');
            });
        });
    });
    describe('expectValues - getting matched values', () => {
        it('getMatchedValues should allow getting the matched values', () => {
            const myExpectValue = expectValues<string>(() => {
                //noop
            }, true);
            expect(() => {
                expect({
                    a: 'a',
                    b: 'b',
                }).to.mostlyEqual({
                    a: myExpectValue,
                    b: myExpectValue,
                    c: myExpectValue,
                });
            }).to.not.throw();
            const values = getMatchedValues(myExpectValue);
            const expectedMatched: ExpandedValues<string> = [
                {
                    fieldDefinedInParent: true,
                    path: ['a'],
                    value: 'a',
                },
                {
                    fieldDefinedInParent: true,
                    path: ['b'],
                    value: 'b',
                },
                {
                    fieldDefinedInParent: false,
                    path: ['c'],
                    value: undefined,
                },
            ];
            expect(values).to.eql(expectedMatched);
        });
    });

    describe('setting options', () => {
        const reversedFormatter: Formatter = {
            isApplicable(value: unknown) {
                return typeof value === 'string';
            },
            format(value: unknown) {
                return (value as string).split('').reverse().join('');
            },
        };
        describe('setting options for one spec', () => {
            it('should allow setting options for one spec', () => {
                expect(() => {
                    expect({ a: 'a', c: 'abc' }).to.mostlyEqual(
                        {},
                        {
                            formatters: [reversedFormatter],
                        }
                    );
                }).to.throw('cba');
            });
        });
        describe('setting options for suite', () => {
            setSuiteOptions(beforeEach, afterEach, {
                formatters: [reversedFormatter],
            });
            it('should allow setting options for suite', () => {
                expect(() => {
                    expect({ a: 'a', c: 'abc' }).to.mostlyEqual({});
                }).to.throw('cba');
            });
        });
        it('options should clear after suite', () => {
            expect(() => {
                expect({ a: 'a', c: 'abc' }).to.mostlyEqual({});
            }).to.throw('abc');
        });
    });
});
