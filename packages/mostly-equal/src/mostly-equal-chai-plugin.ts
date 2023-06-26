/// <reference types="chai" />

import { Formater } from './types';
import { checkExpectValues, errorString } from './mostly-equal';
import { safePrint } from './safe-print';

export interface MostlyEqualOptions {
    maxDepth?: number;
    formaters?: Formater[];
}

const globalOptions: MostlyEqualOptions = {
    maxDepth: 10,
    formaters: [],
};

export const setGlobalOptions = (maxDepth: number, formaters?: Formater[]) => {
    globalOptions.maxDepth = maxDepth;
    globalOptions.formaters = formaters;
};

export const setOptionsForSuite = (
    before: (msg: string, cb: () => void) => void,
    after: (msg: string, cb: () => void) => void,
    options: MostlyEqualOptions
) => {
    before('setting mostly equal global options', () => {
        const depthBefore = globalOptions.maxDepth;
        const formatersBefore = globalOptions.formaters;
        setGlobalOptions(options.maxDepth || depthBefore || 10, options.formaters);
        after('clearing mostly equal global options', () => {
            setGlobalOptions(depthBefore || 10, formatersBefore);
        });
    });
};

export const mostlyEqlChaiPlugin: Chai.ChaiPlugin = (c) => {
    c.Assertion.addMethod('mostlyEqual', function (this, expected, options) {
        const maxDepth = (options as MostlyEqualOptions)?.maxDepth || globalOptions.maxDepth || 10;
        const formaters = (options as MostlyEqualOptions)?.formaters || globalOptions.formaters || [];
        const res = checkExpectValues(
            errorString(expected, this._obj, maxDepth, formaters, 0, [], new Map(), new Set()),
            formaters
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
