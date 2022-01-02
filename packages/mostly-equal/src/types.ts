/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

export type Path = Array<string | number>;

export type ExpandedValues<T> = Array<{ value: T | undefined; path: Path; fieldDefinedInParent: boolean }>;
export type ExpectSingleMatcher<T> = (value: T, fieldDefinedInParent: boolean, path: Path) => void | string;
export type ExpectMultiMatcher<T> = (values: T[], expandedValues: ExpandedValues<T>) => void | Array<undefined | Error>;
