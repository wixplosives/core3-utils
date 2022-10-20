/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
 * Sub matchers
 */

import { expect } from 'chai';
import { expectValue, expectValues } from './mostly-equal';

export const thumbsUp = '👍';

export const notImportant = expectValue(() => undefined);

export const defined = expectValue((val) => {
    expect(val).to.not.equal(undefined);
});

export const equal = (value: unknown, truncateData = true) =>
    expectValue((val) => {
        expect(val).equal(value);
        return truncateData ? `"${thumbsUp}"` : undefined;
    });

export const defineUnique = (name: string, skipUndefined = false) =>
    expectValues((vals) => {
        const seenValues = new Set<unknown>();
        const nonUniquValues = new Set<unknown>();
        for (const val of vals) {
            if (skipUndefined && val === undefined) {
                continue;
            }
            if (seenValues.has(val)) {
                nonUniquValues.add(val);
            }
            seenValues.add(val);
        }
        return vals.map((item) => (nonUniquValues.has(item) ? new Error(`${name} - is not unique`) : undefined));
    }, skipUndefined);

export const defineSame = (name: string, skipUndefined = false) =>
    expectValues((vals) => {
        let values = [...vals];
        if (skipUndefined) {
            values = values.filter((val) => val !== undefined);
        }
        const firstVal = values.shift();
        for (const val of values) {
            if (val !== firstVal) {
                throw new Error(`${name} - are not equal`);
            }
        }
    }, skipUndefined);
