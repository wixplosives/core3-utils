declare namespace Chai {
    interface Formatter {
        isApplicable: (value: unknown, lookupPath: LookupPath) => boolean;
        format: (value: unknown, lookupPath: LookupPath) => unknown;
    }
    type LookupPath = Array<string | number>;

    interface MostlyEqualOptions {
        maxDepth?: number;
        formatters?: Formatter[];
    }
    export interface Assertion {
        mostlyEqual(expected: unknown, options?: MostlyEqualOptions): void;
    }
}
