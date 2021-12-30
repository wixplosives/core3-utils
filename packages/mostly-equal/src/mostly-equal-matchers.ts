/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
 * Sub matchers
 */

import { expect } from 'chai';
import { expectValue, expectValues } from './mostly-equal';

export const thumbsUp = '👍';

export const notImportant = expectValue(() => {
  //
});
export const defined = expectValue((val) => {
  expect(val).to.not.be.undefined;
});

export const equal = (value: any, truncateData = true) =>
  expectValue((val) => {
    expect(val).equal(value);
    if (truncateData) {
      return `"${thumbsUp}"`;
    }
    return undefined;
  });

export const defineUnique = (name: string, allowUndefined = false) =>
  expectValues((vals) => {
    const valMap = new Set<any>();
    const errMap = new Set<any>();
    for (const val of vals) {
      if (allowUndefined && val === undefined) {
        continue;
      }
      if (valMap.has(val)) {
        errMap.add(val);
      }
      valMap.add(val);
    }
    return vals.map((item) => (errMap.has(item) ? new Error(`${name} - is not unique`) : undefined));
  }, allowUndefined);
export const defineSame = (name: string, allowUndefined = false) =>
  expectValues((vals) => {
    if (allowUndefined) {
      vals = vals.filter((val) => val !== undefined);
    }
    const firstVal = vals.shift();
    for (const val of vals) {
      if (val !== firstVal) {
        throw new Error(`${name} - are not equal`);
      }
    }
  }, allowUndefined);
