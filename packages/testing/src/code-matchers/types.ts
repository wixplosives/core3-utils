import { PromiseLikeAssertion } from '../types';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Chai {
        export interface Assertion {
            /**
             * Asserts that the codes matches
             *
             * Both actual and expected are formatted with prettier
             */
            matchCode(code: string): PromiseLikeAssertion;

            /**
             * {@inheritDocs Assertion.matchCode}
             */
            matchesCode(code: string): PromiseLikeAssertion;

            /**
             * Asserts that the code in included in the expected
             *
             * Both actual and expected are formatted with prettier
             */
            includeCode(code: string): PromiseLikeAssertion;

            /**
             * {@inheritDocs Assertion.includeCode}
             */
            includesCode(code: string): PromiseLikeAssertion;
        }
    }
}
