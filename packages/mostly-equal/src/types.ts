/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

export type LookupPath = Array<string | number>;

export type ExpandedValues<T> = Array<{ value: T | undefined; path: LookupPath; fieldDefinedInParent: boolean }>;
export type ExpectSingleMatcher<T> = (value: T, fieldDefinedInParent: boolean, path: LookupPath) => void | string;
export type ExpectMultiMatcher<T> = (
  values: readonly T[],
  expandedValues: ExpandedValues<T>
) => void | Array<undefined | Error>;

export type UnknownObjectRecord = Record<string | number, unknown>;
