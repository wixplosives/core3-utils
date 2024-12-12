import type { Options } from 'prettier';
import type { PromiseLikeAssertion } from '../types.js';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Chai {
        export interface Assertion {
            /**
             * Asserts that the codes matches
             *
             * Both actual and expected are formatted with prettier
             *
             * @param code
             * @param formatOptions prettier formatting options, when false code is not formatted
             */
            matchCode(code: string, formatOptions?: Options | false): PromiseLikeAssertion;

            /**
             * {@inheritDocs Assertion.matchCode}
             */
            matchesCode(code: string, formatOptions?: Options | false): PromiseLikeAssertion;

            /**
             * Asserts that the code in included in the expected
             *
             * Actual is formatted with prettier
             *
             * @param code containedCode
             * @param formatContained {default false} when true, the contained code is formatted with prettier
             * @param formatOptions prettier formatting options, when false code is not formatted
             */
            includeCode(code: string, formatContained?: boolean, formatOptions?: Options | false): PromiseLikeAssertion;

            /**
             * {@inheritDocs Assertion.includeCode}
             */
            includesCode(
                code: string,
                formatContained?: boolean,
                formatOptions?: Options | false,
            ): PromiseLikeAssertion;
        }
    }
}
