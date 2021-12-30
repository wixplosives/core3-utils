/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { expect } from 'chai';
import { expectValue, expectValues, notImportant, equal, defined, defineUnique, defineSame, thumbsUp } from '../index';

describe('mostlyEql', () => {
  describe('simple matching', () => {
    it('should not throw an error when values match', () => {
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
      }).not.to.throw();
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
  });
  describe('notImportant', () => {
    it('should not throw for fields marked with not important', () => {
      expect(() => {
        expect({
          a: 1,
        }).to.mostlyEqual({
          a: notImportant,
          b: notImportant,
        });
      }).not.to.throw();
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
      }).not.to.throw();
    });
    it('should throw for fields marked with defined if value is undefined', () => {
      expect(() => {
        expect({
          a: undefined,
        }).to.mostlyEqual({
          a: defined,
        });
      }).to.throw('expected undefined not to be undefined');
    });
    it('should throw for fields marked with defined if field is not defined', () => {
      expect(() => {
        expect({}).to.mostlyEqual({
          a: defined,
        });
      }).to.throw('expected undefined not to be undefined');
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
    it('should throw if not values are not stickly equal', () => {
      expect(() => {
        expect({
          a: {},
        }).to.mostlyEqual({
          a: equal({}),
        });
      }).to.throw('expected {} to equal {}');
    });
    it('should ot throw if not values are strictly equal', () => {
      const obj = {};

      expect(() => {
        expect({
          a: obj,
        }).to.mostlyEqual({
          a: equal(obj),
        });
      }).not.to.throw();
    });
    it('if stricly equal and truncateData is set to true returns a thumbs up instead of content', () => {
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
      }).to.throw('expected 1 to equal 2');
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
  });
  describe('expectValues', () => {
    it('should call user matcher for with all instances at once', () => {
      const expectedInstances = ['a', 'b', 'c'];
      const myExpectValue = expectValues<string>((instances) => {
        expect(instances).to.eql(expectedInstances);
      });
      expect(() => {
        expect({
          a: expectedInstances[0],
          b: expectedInstances[1],
          c: expectedInstances[2],
        }).to.mostlyEqual({
          a: myExpectValue,
          b: myExpectValue,
          c: myExpectValue,
        });
      }).not.to.throw();
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
});
