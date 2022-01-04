/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { expect } from 'chai';
import { safePrint } from '../safe-print';

describe('safe print', () => {
  describe('simple printing', () => {
    it('should serialize to same result as JSON stringify', () => {
      const obj = {
        a: 'a string',
        b: ['an', 'array'],
        aNestedObject: {
          withAnotherField: 'aasd',
        },
        anEmptyObject: {},
        anEmptyArray: [],
      };
      const actual = safePrint(obj);
      const expected = JSON.stringify(obj, null, 2);
      expect(actual).to.equal(expected);
    });

    it('should handle circular data', () => {
      const obj = {
        a: 'a string',
        b: [],
      };
      obj.b.push(obj as never);
      const expected = {
        a: 'a string',
        // eslint-disable-next-line no-useless-escape
        b: ['circular data removed, path: actual["b"][0]'],
      };
      const actual = safePrint(obj);
      expect(actual).to.equal(JSON.stringify(expected, null, 2));
    });

    it('should handle infinte data created by getters', () => {
      const createObj = () => ({
        a: 'a string',
        get createObj() {
          return createObj();
        },
      });

      const expected = {
        a: 'a string',
        createObj: 'getter value removed',
      };
      const actual = safePrint(createObj());
      expect(actual).to.equal(JSON.stringify(expected, null, 2));
    });
    it('should ignore properties from prototype', () => {
      const proto = {
        b: 5,
      };
      const obj = {
        a: 'a string',
      };

      Object.setPrototypeOf(obj, proto);
      const expected = {
        a: 'a string',
      };
      const actual = safePrint(obj);
      expect(actual).to.equal(JSON.stringify(expected, null, 2));
    });
    it('should stop printing at maxDepth', () => {
      const obj = {
        b: [{ a: 'hello' }],
      };

      const actual = safePrint(obj, 2);
      expect(JSON.parse(actual)).to.eql({
        b: [{ a: 'hello' }],
      });
      expect(actual).to.include('{ /* object content truncated, max depth reached */ }');
    });

    it('should print repeating non circular data', () => {
      const internalObj = { a: 'hello' };
      const obj = {
        b: [internalObj, internalObj],
      };

      const actual = safePrint(obj);
      expect(actual).to.equal(JSON.stringify(obj, null, 2));
    });
  });
});
