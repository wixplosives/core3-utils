/* eslint-disable no-useless-escape */
import { noIdents } from '@wixc3/common';
import * as esTreePlugin from 'prettier/plugins/estree';
import * as parserTypeScript from 'prettier/plugins/typescript';
import { format } from 'prettier/standalone';

type ChaiPluginProperty = (this: Chai.AssertionStatic) => unknown;
type ChaiPluginMethod = (this: Chai.AssertionStatic, ...args: unknown[]) => unknown;

const prettify: (code: string) => Promise<string> = (code) =>
    format(code, {
        parser: 'typescript',
        plugins: [esTreePlugin, parserTypeScript],
        endOfLine: 'lf',
        singleQuote: true,
    });

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
    const formatted: ChaiPluginProperty = async function () {
        const testedExpression = flag(this, 'object') as object;

        validateToBeString(testedExpression);

        const formatted = alignComments(await prettify(testedExpression));

        flag(this, 'object', formatted);
    };

    const matchCode: ChaiPluginMethod = async function (expectedCode) {
        const testedExpression = flag(this, 'object') as object;

        validateToBeString(testedExpression, 'Actual code');
        validateToBeString(expectedCode, 'Expected code');

        const actual = alignComments(await prettify(testedExpression));
        const expected = alignComments(await prettify(expectedCode));

        this.assert(actual === expected, `Expected code to match`, `Expected code to not match`, expected, actual);
    };

    const includeCode: ChaiPluginMethod = async function (expectedCode) {
        const testedExpression = flag(this, 'object') as object;

        validateToBeString(testedExpression, 'Actual code');
        validateToBeString(expectedCode, 'Expected code');

        const actual = noIdents(alignComments(await prettify(testedExpression)));
        const expected = noIdents(alignComments(await prettify(expectedCode)));

        this.assert(
            actual.includes(expected),
            `Expected code to include`,
            `Expected code to not include`,
            expected,
            actual,
        );
    };

    chai.Assertion.addProperty('formatted', formatted);
    chai.Assertion.addMethod('matchCode', matchCode);
    chai.Assertion.addMethod('matchesCode', matchCode);
    chai.Assertion.addMethod('includeCode', includeCode);
    chai.Assertion.addMethod('includesCode', includeCode);
};
