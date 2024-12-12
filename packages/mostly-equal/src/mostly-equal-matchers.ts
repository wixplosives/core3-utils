/**
 * Sub matchers
 */
import { expect } from 'chai';
import { expectValue, expectValues } from './mostly-equal.js';
export const thumbsUp = '👍';

export const notImportant = expectValue(() => undefined);

/**
 * Field must be defined (null is considered define)
 */
export const defined = expectValue((val) => {
    expect(val).to.not.equal(undefined);
});

/**
 * Strict equality of a field
 * @param thumbsUpOnSuccess - when there is a match, display thumbs up instead of the true value
 * @returns
 */
export function equal(value: unknown, thumbsUpOnSuccess = true) {
    return expectValue((val) => {
        expect(val).equal(value);
        return thumbsUpOnSuccess ? `"${thumbsUp}"` : undefined;
    });
}

/**
 * Creates a symbol for usage in expect.mostlyEqual,
 * Comparing the resulting value in any place it is used as the value
 * @example
 * ```ts
 * const id = defineUnique('id');
 * expect({
 *       a: 'a',
 *       b: 'b',
 *   }).to.mostlyEqual({
 *       a: id,
 *       b: id
 *   }); // will pass
 * ```
 *
 * @param name - error display name
 * @param skipUndefined - ignores undefined values, even for multiple instances
 */
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

/**
 * Creates a symbol for usage in mostlyEqual,
 * Comparing the resulting value in any place it is used as the value
 * @example
 * ```ts
 * const id = defineSame('id');
 * expect({
 *       a: 'a',
 *       b: 'b',
 *   }).to.mostlyEqual({
 *       a: id,
 *       b: id
 *   }); // will fail
 * ```
 *
 * @param name - error display name
 * @param skipUndefined - ignores undefined values, even for multiple instances
 */
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
