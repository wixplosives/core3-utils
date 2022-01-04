interface MostlyEqualOptions {
  maxDepth?: number;
}

declare namespace Chai {
  export interface Assertion {
    mostlyEqual(expected: unknown, options?: MostlyEqualOptions): void;
  }
}
