/* eslint-disable no-useless-escape */
import { noIdents } from '@wixc3/common';
import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Options } from 'prettier';
import * as esTreePlugin from 'prettier/plugins/estree';
import * as parserTypeScript from 'prettier/plugins/typescript';
import { format } from 'prettier/standalone';
// makes ts pick up global augmentation of Chai.Assertion
import type * as _ from './types';

use(chaiAsPromised);

const prettify = async (code: string, options?: Options | false) =>
    options === false
        ? code
        : await format(
              code,
              options || {
                  parser: 'typescript',
                  plugins: [esTreePlugin, parserTypeScript],
                  endOfLine: 'lf',
                  singleQuote: true,
              },
          );

const regex = /(\/\*)([^\/\*]*)(\*\/)/g;

const mapper = (str: string, idx: number) => {
    if (idx % 4 === 2) {
        return str
            .split(/\s*([^\s]*)/g)
            .map((str, idx) => {
                if (idx % 2) {
                    return str.split(/[\n\r\s]*([^\s]*)/g).join(' ');
                }
                return str;
            })
            .join('');
    }
    return str;
};

/**
 * We align the comments using a regex because prettier does not
 */
const alignComments = (code: string) => code.split(regex).map(mapper).join('');

const validateToBeString: (testedExpression: unknown, semanticName?: string) => asserts testedExpression is string = (
    testedExpression,
    semanticName = 'Expression',
) => {
    if (typeof testedExpression !== 'string') {
        throw new Error(`${semanticName} is not a string: ${String(testedExpression)}`);
    }
};
export const codeMatchers: Chai.ChaiPlugin = (chai, { flag }) => {
    async function matchCode(this: Chai.AssertionStatic, expectedCode: string, options?: Options | false) {
        const testedExpression = flag(this, 'object') as object;

        validateToBeString(testedExpression, 'Actual code');
        validateToBeString(expectedCode, 'Expected code');

        const actual = alignComments(await prettify(testedExpression, options));
        const expected = alignComments(await prettify(expectedCode, options));

        this.assert(actual === expected, `Expected code to match`, `Expected code to not match`, expected, actual);
    }

    async function includeCode(
        this: Chai.AssertionStatic,
        expectedCode: string,
        formatExpected = false,
        options?: Options | false,
    ) {
        const testedExpression = flag(this, 'object') as object;

        validateToBeString(testedExpression, 'Actual code');
        validateToBeString(expectedCode, 'Expected code');

        const actual = noIdents(alignComments(await prettify(testedExpression, options)));
        const expected = formatExpected ? noIdents(alignComments(await prettify(expectedCode, options))) : expectedCode;

        this.assert(
            actual.includes(expected),
            `Expected code to include`,
            `Expected code to not include`,
            expected,
            actual,
        );
    }

    chai.Assertion.addMethod('matchCode', matchCode);
    chai.Assertion.addMethod('matchesCode', matchCode);
    chai.Assertion.addMethod('includeCode', includeCode);
    chai.Assertion.addMethod('includesCode', includeCode);
};
