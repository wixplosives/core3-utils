/// <reference types="chai" />

import { Replacer } from './types';
import { checkExpectValues, errorString } from './mostly-equal';
import { safePrint } from './safe-print';

export interface MostlyEqualOptions {
    maxDepth?: number;
    replacers?: Replacer[];
}

const globalOptions: MostlyEqualOptions = {
    maxDepth: 10,
    replacers: [],
};

export const setGlobalOptions = (maxDepth: number, replacers?: Replacer[]) => {
    globalOptions.maxDepth = maxDepth;
    globalOptions.replacers = replacers;
};

export const tempSetGlobalOptions = (
    before: (msg: string, cb: () => void) => void,
    after: (msg: string, cb: () => void) => void,
    options: MostlyEqualOptions
) => {
    before('setting mostly equal global options', () => {
        const depthBefore = globalOptions.maxDepth;
        const replacersBefore = globalOptions.replacers;
        setGlobalOptions(options.maxDepth || depthBefore || 10, options.replacers);
        after('clearing mostly equal global options', () => {
            setGlobalOptions(depthBefore || 10, replacersBefore);
        });
    });
};

export const mostlyEqlChaiPlugin: Chai.ChaiPlugin = (c) => {
    c.Assertion.addMethod('mostlyEqual', function (this, expected, options) {
        const maxDepth = (options as MostlyEqualOptions)?.maxDepth || globalOptions.maxDepth || 10;
        const replacers = (options as MostlyEqualOptions)?.replacers || globalOptions.replacers || [];
        const res = checkExpectValues(
            errorString(expected, this._obj, maxDepth, replacers, 0, [], new Map(), new Set()),
            replacers
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
            expected
        );
    });
};
