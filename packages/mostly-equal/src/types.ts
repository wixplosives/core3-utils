export interface Formatter {
    isApplicable: (value: unknown, lookupPath: LookupPath) => boolean;
    format: (value: unknown, lookupPath: LookupPath) => unknown;
}
export type LookupPath = Array<string | number>;

export type ExpandedValues<T> = Array<{ value: T | undefined; path: LookupPath; fieldDefinedInParent: boolean }>;
export type ExpectSingleMatcher<T> = (value: T, fieldDefinedInParent: boolean, path: LookupPath) => void | string;
export type ExpectMultiMatcher<T> = (
    values: readonly T[],
    expandedValues: ExpandedValues<T>,
) => void | Array<undefined | Error>;

export type UnknownObjectRecord = Record<string | number, unknown>;

const _secretMarkerSymbol = Symbol('marker');
export type MarkerSymbol = {
    __mostlyEqlMarker: typeof _secretMarkerSymbol;
};

export type AllowMarkers<T, NOTFIELDS = '__unknown__'> =
    | T
    | MarkerSymbol
    | {
          [key in keyof T]: key extends NOTFIELDS ? T[key] : MarkerSymbol | AllowMarkers<T[key]>;
      };

export type AllowMarkersObj<T> =
    | T
    | {
          [key in keyof T]: MarkerSymbol | AllowMarkers<T[key]>;
      };

export function allowMarkersInFactory<F extends (...args: any[]) => any>(
    f: F,
): F extends (...args: infer A) => infer R ? (...args: AllowMarkersObj<A>) => AllowMarkers<R> : never {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return f as any;
}
