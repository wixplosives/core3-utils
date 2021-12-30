/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

const expectValueSymb = Symbol('expect');
const expectValuesSymb = Symbol('expect-values');
interface ExpectValue<T> {
  expectMethod: ExpectSingleMatcher<T>;
  _brand: typeof expectValueSymb;
}
interface ExpectValues {
  expectMethod: ExpectMultiMatcher<any>;
  allowUndefined: boolean;
  _brand: typeof expectValuesSymb;
  getValues: () => any[][];
}
function isExpectVal(val: any): val is ExpectValue<any> {
  return !!val && val._brand === expectValueSymb;
}

function isExpectValues(val: any): val is ExpectValues {
  return !!val && val._brand === expectValuesSymb;
}

type ExpectSingleMatcher<T> = (value: T, isDefinedInParent: boolean) => void | string;
export const expectValue = <T>(expectMethod: ExpectSingleMatcher<T>): any => {
  return {
    expectMethod,
    _brand: expectValueSymb,
  };
};
type ExpectMultiMatcher<T> = (values: T[]) => void | Array<undefined | Error>;

export const expectValues = <T>(expectMethod: ExpectMultiMatcher<T>, allowUndefined = false): any => {
  const values: T[][] = [];
  const wrapMethod: ExpectMultiMatcher<T> = (vals) => {
    values.push(vals);
    return expectMethod(vals);
  };
  return {
    expectMethod: wrapMethod,
    allowUndefined,
    _brand: expectValuesSymb,
    getValues: () => values,
  };
};

export const getMatchedValues = <T>(expectValues: any) => {
  if (isExpectValues(expectValues)) {
    expectValues.getValues() as T[][];
  }
  return [] as T[][];
};

export const stringify = (target: any, depth: number) =>
  target === undefined
    ? 'undefined'
    : JSON.stringify(target, null, 4)
        .split('\n')
        .join('\n' + spaces(depth));
const spaces = (indent: number) => {
  const arr = new Array(indent);
  arr.fill('    ');
  return arr.join('');
};

interface ExpectValuesInfo {
  uniqueSymb: ExpectValues;
  value: any;
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
      const res = expecter.expectMethod(values.map((val) => val.value));
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
        return [stringify(item.value, 0), valueErrors.get(item.uniqueSymb)!.get(item)!];
      } else {
        return [stringify(item.value, 0)];
      }
    }
    return item;
  });
};

const tryExpectVal = (
  expected: ExpectValue<any>,
  actual: any,
  depth: number,
  existsInParent: boolean
): ErrorOrTextOrExpect => {
  let matcherRes: undefined | string | void = undefined;
  try {
    matcherRes = expected.expectMethod(actual, existsInParent);
  } catch (err) {
    return [stringify(actual, depth), anyToError(err)];
  }
  if (matcherRes !== undefined && matcherRes !== null) {
    return [matcherRes.toString()];
  }
  return [stringify(actual, depth)];
};

export const errorString: (expected: any, actual: any, depth: number) => ErrorOrTextOrExpect = (
  expected,
  actual,
  depth
) => {
  if (isExpectVal(expected)) {
    return tryExpectVal(expected, actual, depth, true);
  }

  if (isExpectValues(expected)) {
    return [
      {
        uniqueSymb: expected,
        value: actual,
      },
    ];
  }

  if (expected === actual) {
    return [stringify(actual, depth)];
  }
  if (Array.isArray(expected)) {
    if (Array.isArray(actual)) {
      if (actual.length !== expected.length) {
        return [anyToError(`expected length ${expected.length} but got ${actual.length}`), stringify(actual, depth)];
      }

      const res: ErrorOrTextOrExpect = ['[ \n', spaces(depth)];
      for (let i = 0; i < actual.length; i++) {
        res.push(...errorString(expected[i], actual[i], depth + 1), ',');
      }
      res.push(`\n${spaces(depth)}]\n${spaces(depth)}`);
      return res;
    } else {
      return [
        anyToError(`expected ${stringify(expected, 0)} but got ${stringify(actual, 0)}`),
        stringify(actual, depth),
      ];
    }
  }

  if (expected instanceof Object) {
    if (actual instanceof Object) {
      const res: ErrorOrTextOrExpect = [`\n${spaces(depth)}{`];

      const allNames = [...new Set([...Object.keys(expected), ...Object.keys(actual)])];
      const addPropToRes = (name: string, value: ErrorOrTextOrExpect, errorMessage?: string) =>
        res.push(
          `\n ${spaces(depth + 1)}${name}: `,
          ...value,
          ...(errorMessage ? [anyToError(errorMessage)] : []),
          ','
        );
      for (const name of allNames) {
        const stringProp = [stringify(actual[name], depth + 1)];
        const expectedField = expected[name];

        if (isExpectValues(expectedField) && expectedField.allowUndefined && name in actual === false) {
          addPropToRes(name, stringProp);
        } else if (isExpectVal(expectedField) && name in actual === false) {
          const fieldRes = tryExpectVal(expectedField, undefined, depth + 1, false);
          addPropToRes(name, fieldRes);
        } else {
          if (!(name in expected)) {
            addPropToRes(name, stringProp, `${name} exists in actual but not in expected`);
          } else if (!(name in actual)) {
            addPropToRes(name, stringProp, `${name} exists in expected but not in actual`);
          } else {
            addPropToRes(name, errorString(expected[name], actual[name], depth + 1));
          }
        }
      }
      res.push(`\n${spaces(depth)}}`);
      return res;
    }
  }

  return [stringify(actual, depth), anyToError(`expected ${stringify(expected, 0)} but got ${stringify(actual, 0)}`)];
};
