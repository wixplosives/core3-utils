/// <reference types="chai" preserve="true" />

import type { Formatter } from './types.js';
import { checkExpectValues, errorString } from './mostly-equal.js';
import { safePrint } from './safe-print.js';

export interface MostlyEqualOptions {
    maxDepth?: number;
    formatters?: Formatter[];
}

const globalOptions: MostlyEqualOptions = {
    maxDepth: 10,
    formatters: [],
};

export const setGlobalOptions = (maxDepth: number, formatters?: Formatter[]) => {
    globalOptions.maxDepth = maxDepth;
    globalOptions.formatters = formatters;
};

export const setSuiteOptions = (
    before: (msg: string, cb: () => void) => void,
    after: (msg: string, cb: () => void) => void,
    options: MostlyEqualOptions,
) => {
    before('setting mostly equal global options', () => {
        const depthBefore = globalOptions.maxDepth;
        const formattersBefore = globalOptions.formatters;
        setGlobalOptions(options.maxDepth || depthBefore || 10, options.formatters);
        after('clearing mostly equal global options', () => {
            setGlobalOptions(depthBefore || 10, formattersBefore);
        });
    });
};

export const mostlyEqlChaiPlugin: Chai.ChaiPlugin = (c) => {
    c.Assertion.addMethod('mostlyEqual', function (this, expected, options) {
        const maxDepth = (options as MostlyEqualOptions)?.maxDepth || globalOptions.maxDepth || 10;
        const formatters = (options as MostlyEqualOptions)?.formatters || globalOptions.formatters || [];
        const res = checkExpectValues(
            errorString(expected, this._obj, maxDepth, formatters, 0, [], new Map(), new Set()),
            formatters,
        );
        let error = false;
        const message = res.map((item) => {
            if (typeof item !== 'string') {
                error = true;
                return `

/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
${item.message}
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
`;
            }
            return item;
        });
        this.assert(
            !error,
            message.join(''),
            `expected ${safePrint(this._obj, maxDepth)} to not eql expected`,
            this._obj,
            expected,
        );
    });
};
