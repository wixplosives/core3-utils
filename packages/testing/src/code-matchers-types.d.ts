declare namespace Chai {
    export interface Assertion {
        /**
         * Formats the expression that will be tested using prettier, allowing generic assertions, i.e.: `.to.include`
         */
        formatted: Assertion;

        /**
         * Asserts that the expression that will be tested fully matches the expected expression.
         * Both expected and actual expressions are formatted using prettier.
         */
        matchCode(code: string): Assertion;

        /**
         * @see matchCode
         */
        matchesCode(code: string): Assertion;

        /**
         * Asserts that the expression that will be tested includes the expected expression.
         * Both expected and actual expressions are formatted using prettier.
         *
         * If you don't want the expected expression to be formatted, use `.formatted.to.include()`
         */
        includeCode(code: string): Assertion;

        /**
         * @see includeCode
         */
        includesCode(code: string): Assertion;
    }
}
