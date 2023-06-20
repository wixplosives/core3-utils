declare namespace Chai {
    interface Replacer {
        isApplicable: (value: unknown, lookupPath: LookupPath) => boolean;
        replace: (value: unknown, lookupPath: LookupPath) => unknown;
    }
    type LookupPath = Array<string | number>;

    interface MostlyEqualOptions {
        maxDepth?: number;
        replacers?: Replacer[];
    }
    export interface Assertion {
        mostlyEqual(expected: unknown, options?: MostlyEqualOptions): void;
    }
}
