/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export interface Replacer {
    isApplicable: (value: unknown, lookupPath: LookupPath) => boolean;
    replace: (value: unknown, lookupPath: LookupPath) => unknown;
}
export type LookupPath = Array<string | number>;

export type ExpandedValues<T> = Array<{ value: T | undefined; path: LookupPath; fieldDefinedInParent: boolean }>;
export type ExpectSingleMatcher<T> = (value: T, fieldDefinedInParent: boolean, path: LookupPath) => void | string;
export type ExpectMultiMatcher<T> = (
    values: readonly T[],
    expandedValues: ExpandedValues<T>
) => void | Array<undefined | Error>;

export type UnknownObjectRecord = Record<string | number, unknown>;

export const expectValueSymb = Symbol('expect');
export const expectValuesSymb = Symbol('expect-values');
export interface ExpectValue<T = any> {
    expectMethod: ExpectSingleMatcher<T>;
    _brand: typeof expectValueSymb;
    getMatchInfo: () => ExpandedValues<T>;
    clear: () => void;
}
export interface ExpectValues<T = any> {
    expectMethod: ExpectMultiMatcher<T>;
    allowUndefined: boolean;
    _brand: typeof expectValuesSymb;
    getMatchInfo: () => ExpandedValues<T>;
}
export function isExpectVal(val: any): val is ExpectValue {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return !!val && val._brand === expectValueSymb;
}

export function isExpectValues(val: any): val is ExpectValues {
    return !!val && (val as { _brand: unknown })._brand === expectValuesSymb;
}

export type DeepExpect<T> = {
    [key in keyof T]: ExpectValue | ExpectValues | DeepExpect<T[key]>;
};
