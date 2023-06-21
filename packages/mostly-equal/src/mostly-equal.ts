import { isGetter } from './safe-print';
import { isPlainObj, registerChildSet, safePrint, spaces } from './safe-print';
import {
    type ExpectSingleMatcher,
    type ExpandedValues,
    type ExpectMultiMatcher,
    type LookupPath,
    type Replacer,
    MarkerSymbol,
} from './types';

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

/**
 * Used for adding field matchers to mostlyEqual
 * Creates a symbol used for field matching
 *
 * @example
 * ```ts
 * expect({count:4}).to.be.mostlyEqual({
 *  count:expectValue((value)=>{
 *     expect(value).to.be.greaterThan(3)
 *  })
 * })
 * ```
 * If expectMethod returns a value, it will replace the original value
 * for error printing when another matcher failed
 * @param expectMethod
 */
export function expectValue<T>(expectMethod: ExpectSingleMatcher<T>): MarkerSymbol {
    let values: ExpandedValues<T> = [];

    const wrapMethod: ExpectSingleMatcher<T> = (value, fieldDefinedInParent, path) => {
        values.push({
            fieldDefinedInParent,
            path,
            value,
        });
        return expectMethod(value, fieldDefinedInParent, path);
    };
    return {
        expectMethod: wrapMethod,
        _brand: expectValueSymb,
        getMatchInfo: () => values,
        clear: () => (values = []),
    } as unknown as MarkerSymbol;
}

/**
 * Similar to {@link expectValue}, but called for all the matches at once.
 * This way a matcher can compare different values
 * {@link defineUnique}
 */
export function expectValues<T>(expectMethod: ExpectMultiMatcher<T>, allowUndefined = false): MarkerSymbol {
    let values: ExpandedValues<T> = [];
    const wrapMethod: ExpectMultiMatcher<T> = (vals, valInfos) => {
        values = valInfos;
        return expectMethod(vals, valInfos);
    };
    return {
        expectMethod: wrapMethod,
        allowUndefined,
        _brand: expectValuesSymb,
        getMatchInfo: () => values,
    } as unknown as MarkerSymbol;
}

export const getMatchedValues = <T>(expectValues: any) => {
    if (isExpectValues(expectValues)) {
        return expectValues.getMatchInfo() as ExpandedValues<T>;
    }
    if (isExpectVal(expectValues)) {
        return expectValues.getMatchInfo() as ExpandedValues<T>;
    }
    return [] as ExpandedValues<T>;
};

export const clearMatchedValues = (subMatcher: any) => {
    if (isExpectVal(subMatcher)) {
        subMatcher.clear();
    }
};
export interface ExpectValuesInfo {
    uniqueSymb: ExpectValues;
    value: any;
    path: LookupPath;
    fieldDefinedInParent: boolean;
}
export type ErrorOrTextOrExpect = Array<string | Error | ExpectValuesInfo>;
export type ErrorOrText = Array<string | Error>;

function isExpectValuesInfo(val: any): val is ExpectValuesInfo {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return !!val && isExpectValues(val.uniqueSymb);
}

function anyToError(val: any): Error {
    if (val instanceof Error) {
        return val;
    }
    const message = typeof val === 'string' ? val : 'non error thrown';
    return new Error(message);
}
export const checkExpectValues = (input: ErrorOrTextOrExpect, replacers: Replacer[]): ErrorOrText => {
    const values: Map<ExpectValues, Array<ExpectValuesInfo>> = new Map();
    for (const item of input) {
        if (isExpectValuesInfo(item)) {
            if (!values.has(item.uniqueSymb)) {
                values.set(item.uniqueSymb, []);
            }
            values.get(item.uniqueSymb)?.push(item);
        }
    }

    const valueErrors = [...values.entries()].reduce((errors, [expecter, values]) => {
        try {
            const res = expecter.expectMethod(
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                values.map((val) => val.value),
                values.map((item) => ({
                    fieldDefinedInParent: item.fieldDefinedInParent,
                    path: item.path,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    value: item.value,
                }))
            );
            if (res && Array.isArray(res)) {
                const errorMap = new Map<ExpectValuesInfo, Error>();
                for (let i = 0; i < values.length; i++) {
                    if (res[i] instanceof Error) {
                        errorMap.set(values[i]!, res[i]!);
                    }
                }
                errors.set(expecter, errorMap);
            }
        } catch (err) {
            const errorMap = new Map<ExpectValuesInfo, Error>();
            for (const val of values) {
                errorMap.set(val, anyToError(err));
            }
            errors.set(expecter, errorMap);
        }
        return errors;
    }, new Map<ExpectValues, Map<ExpectValuesInfo, Error>>());

    return input.flatMap((item) => {
        if (isExpectValuesInfo(item)) {
            if (valueErrors.has(item.uniqueSymb) && valueErrors.get(item.uniqueSymb)?.has(item)) {
                return [safePrint(item.value, 0, replacers), valueErrors.get(item.uniqueSymb)!.get(item)!];
            } else {
                return [safePrint(item.value, 0, replacers)];
            }
        }
        return item;
    });
};

const tryExpectVal = (
    expected: ExpectValue<any>,
    actual: any,
    maxDepth: number,
    replacers: Replacer[],
    depth: number,
    path: LookupPath,
    passedMap: Map<any, LookupPath>,
    passedSet: Set<any>,
    existsInParent: boolean
): ErrorOrTextOrExpect => {
    let matcherRes: undefined | string | void = undefined;
    try {
        matcherRes = expected.expectMethod(actual, existsInParent, path);
    } catch (err) {
        return [safePrint(actual, maxDepth, replacers, depth, passedMap, passedSet, path), anyToError(err)];
    }
    if (matcherRes !== undefined && matcherRes !== null) {
        return [matcherRes.toString()];
    }
    return [safePrint(actual, maxDepth, replacers, depth, passedMap, passedSet, path)];
};

export const errorString: (
    expected: unknown,
    actual: unknown,
    maxDepth: number,
    replacers: Replacer[],
    depth: number,
    path: LookupPath,
    passedMap: Map<unknown, LookupPath>,
    passedSet: Set<unknown>
) => ErrorOrTextOrExpect = (expected, actual, maxDepth, replacers, depth, path, passedMap, passedSet) => {
    if (isExpectVal(expected)) {
        return tryExpectVal(expected, actual, maxDepth, replacers, depth, path, passedMap, passedSet, true);
    }

    if (isExpectValues(expected)) {
        return [
            {
                uniqueSymb: expected,
                value: actual,
                fieldDefinedInParent: true,
                path,
            },
        ];
    }

    if (expected === actual) {
        return [safePrint(actual, maxDepth, replacers, depth, passedMap, passedSet, path)];
    }
    if (Array.isArray(expected)) {
        if (Array.isArray(actual)) {
            if (actual.length !== expected.length) {
                return [
                    anyToError(`expected length ${expected.length} but got ${actual.length}`),
                    safePrint(actual, maxDepth, replacers, depth, passedMap, passedSet, path),
                ];
            }

            const res: ErrorOrTextOrExpect = ['[ \n', spaces(depth)];
            const childSet = registerChildSet(actual, path, passedMap, passedSet);
            for (let i = 0; i < actual.length; i++) {
                res.push(
                    ...errorString(
                        expected[i],
                        actual[i],
                        maxDepth,
                        replacers,
                        depth + 1,
                        [...path, i],
                        passedMap,
                        childSet
                    ),
                    ','
                );
            }
            res.push(`\n${spaces(depth)}]\n${spaces(depth)}`);
            return res;
        } else {
            return [
                anyToError(
                    `expected ${safePrint(
                        expected,
                        maxDepth,
                        replacers,
                        0,
                        passedMap,
                        passedSet,
                        path
                    )} but got ${safePrint(actual, maxDepth, replacers, 0, passedMap, passedSet, path)}`
                ),
                safePrint(actual, maxDepth, replacers, depth),
            ];
        }
    }

    if (isPlainObj(expected)) {
        if (isPlainObj(actual)) {
            const res: ErrorOrTextOrExpect = [`\n${spaces(depth)}{`];
            const childSet = registerChildSet(actual, path, passedMap, passedSet);

            const allNames = new Set([...Object.keys(expected), ...Object.keys(actual)]);
            const addPropToRes = (name: string, value: ErrorOrTextOrExpect, errorMessage?: string) =>
                res.push(
                    `\n ${spaces(depth + 1)}${name}: `,
                    ...value,
                    ...(errorMessage ? [anyToError(errorMessage)] : []),
                    ','
                );
            for (const name of allNames) {
                const stringProp = [safePrint(actual[name], depth + 1, replacers)];
                const expectedField = expected[name];

                if (isExpectValues(expectedField) && expectedField.allowUndefined && name in actual === false) {
                    addPropToRes(name, [
                        {
                            uniqueSymb: expectedField,
                            value: undefined,
                            fieldDefinedInParent: false,
                            path: [...path, name],
                        },
                    ]);
                } else if (isExpectVal(expectedField) && name in actual === false) {
                    const fieldRes = tryExpectVal(
                        expectedField,
                        undefined,
                        maxDepth,
                        replacers,
                        depth + 1,
                        path,
                        passedMap,
                        passedSet,
                        false
                    );
                    addPropToRes(name, fieldRes);
                } else if (!isGetter(actual, name)) {
                    if (!(name in expected)) {
                        addPropToRes(name, stringProp, `${name} exists in actual but not in expected`);
                    } else if (!(name in actual)) {
                        addPropToRes(name, stringProp, `${name} exists in expected but not in actual`);
                    } else {
                        addPropToRes(
                            name,
                            errorString(
                                expected[name],
                                actual[name],
                                maxDepth,
                                replacers,
                                depth + 1,
                                [...path, name],
                                passedMap,
                                childSet
                            )
                        );
                    }
                }
            }
            res.push(`\n${spaces(depth)}}`);
            return res;
        }
    }

    return [
        safePrint(actual, maxDepth, replacers, depth),
        anyToError(
            `expected ${safePrint(expected, maxDepth, replacers, 0)} but got ${safePrint(
                actual,
                maxDepth,
                replacers,
                0
            )}`
        ),
    ];
};
