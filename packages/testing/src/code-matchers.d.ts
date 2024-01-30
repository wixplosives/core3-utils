import { PromiseLikeAssertion } from './chai-retry-plugin/types';

declare global {
    namespace Chai {
        export interface Assertion {
            /**
             * Formats the expression that will be tested using prettier, allowing generic assertions, i.e.: `.to.include`
             */
            formatted: PromiseLikeAssertion;

            /**
             * Asserts that the expression that will be tested fully matches the expected expression.
             * Both expected and actual expressions are formatted using prettier.
             */
            matchCode(code: string): PromiseLikeAssertion;

            /**
             * @see matchCode
             */
            matchesCode(code: string): PromiseLikeAssertion;

            /**
             * Asserts that the expression that will be tested includes the expected expression.
             * Both expected and actual expressions are formatted using prettier.
             *
             * If you don't want the expected expression to be formatted, use `.formatted.to.include()`
             */
            includeCode(code: string): PromiseLikeAssertion;

            /**
             * @see includeCode
             */
            includesCode(code: string): PromiseLikeAssertion;
        }
    }
}
