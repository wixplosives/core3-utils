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
        b: ['circular data removed, path: "actual[\\"b\\"][0]"'],
      };
      const actual = safePrint(obj);
      expect(actual).to.equal(JSON.stringify(expected, null, 2));
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
