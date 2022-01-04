/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { isGetter } from '.';
import { isPlainObj, registerChildSet, safePrint, spaces } from './safe-print';
import type { LookupPath, ExpectSingleMatcher, ExpandedValues, ExpectMultiMatcher } from './types';

const expectValueSymb = Symbol('expect');
const expectValuesSymb = Symbol('expect-values');
interface ExpectValue<T> {
  expectMethod: ExpectSingleMatcher<T>;
  _brand: typeof expectValueSymb;
  getMatchInfo: () => ExpandedValues<T>;
  clear: () => void;
}
interface ExpectValues<T = any> {
  expectMethod: ExpectMultiMatcher<T>;
  allowUndefined: boolean;
  _brand: typeof expectValuesSymb;
  getMatchInfo: () => ExpandedValues<T>;
}
function isExpectVal(val: any): val is ExpectValue<any> {
  return !!val && val._brand === expectValueSymb;
}

function isExpectValues(val: any): val is ExpectValues {
  return !!val && val._brand === expectValuesSymb;
}

export const expectValue = <T>(expectMethod: ExpectSingleMatcher<T>): any => {
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
  };
};

export const expectValues = <T>(expectMethod: ExpectMultiMatcher<T>, allowUndefined = false): any => {
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
  };
};

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
interface ExpectValuesInfo {
  uniqueSymb: ExpectValues;
  value: any;
  path: LookupPath;
  fieldDefinedInParent: boolean;
}
type ErrorOrTextOrExpect = Array<string | Error | ExpectValuesInfo>;
type ErrorOrText = Array<string | Error>;

function isExpectValuesInfo(val: any): val is ExpectValuesInfo {
  return !!val && isExpectValues(val.uniqueSymb);
}

function anyToError(val: any): Error {
  if (val instanceof Error) {
    return val;
  }
  const message = typeof val === 'string' ? val : 'non error thrown';
  return new Error(message);
}
export const checkExpectValues = (input: ErrorOrTextOrExpect): ErrorOrText => {
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
        values.map((val) => val.value),
        values.map((item) => ({
          fieldDefinedInParent: item.fieldDefinedInParent,
          path: item.path,
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
        return [safePrint(item.value, 0), valueErrors.get(item.uniqueSymb)!.get(item)!];
      } else {
        return [safePrint(item.value, 0)];
      }
    }
    return item;
  });
};

const tryExpectVal = (
  expected: ExpectValue<any>,
  actual: any,
  maxDepth: number,
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
    return [safePrint(actual, maxDepth, depth, passedMap, passedSet, path), anyToError(err)];
  }
  if (matcherRes !== undefined && matcherRes !== null) {
    return [matcherRes.toString()];
  }
  return [safePrint(actual, maxDepth, depth, passedMap, passedSet, path)];
};

export const errorString: (
  expected: unknown,
  actual: unknown,
  maxDepth: number,
  depth: number,
  path: LookupPath,
  passedMap: Map<unknown, LookupPath>,
  passedSet: Set<unknown>
) => ErrorOrTextOrExpect = (expected, actual, maxDepth, depth, path, passedMap, passedSet) => {
  if (isExpectVal(expected)) {
    return tryExpectVal(expected, actual, maxDepth, depth, path, passedMap, passedSet, true);
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
    return [safePrint(actual, maxDepth, depth, passedMap, passedSet, path)];
  }
  if (Array.isArray(expected)) {
    if (Array.isArray(actual)) {
      if (actual.length !== expected.length) {
        return [
          anyToError(`expected length ${expected.length} but got ${actual.length}`),
          safePrint(actual, maxDepth, depth, passedMap, passedSet, path),
        ];
      }

      const res: ErrorOrTextOrExpect = ['[ \n', spaces(depth)];
      const childSet = registerChildSet(actual, path, passedMap, passedSet);
      for (let i = 0; i < actual.length; i++) {
        res.push(...errorString(expected[i], actual[i], maxDepth, depth + 1, [...path, i], passedMap, childSet), ',');
      }
      res.push(`\n${spaces(depth)}]\n${spaces(depth)}`);
      return res;
    } else {
      return [
        anyToError(
          `expected ${safePrint(expected, maxDepth, 0, passedMap, passedSet, path)} but got ${safePrint(
            actual,
            maxDepth,
            0,
            passedMap,
            passedSet,
            path
          )}`
        ),
        safePrint(actual, maxDepth, depth),
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
        const stringProp = [safePrint(actual[name], depth + 1)];
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
              errorString(expected[name], actual[name], maxDepth, depth + 1, [...path, name], passedMap, childSet)
            );
          }
        }
      }
      res.push(`\n${spaces(depth)}}`);
      return res;
    }
  }

  return [
    safePrint(actual, maxDepth, depth),
    anyToError(`expected ${safePrint(expected, maxDepth, 0)} but got ${safePrint(actual, maxDepth, 0)}`),
  ];
};
