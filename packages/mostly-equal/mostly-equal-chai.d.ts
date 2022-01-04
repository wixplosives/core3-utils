declare namespace Chai {
  interface MostlyEqualOptions {
    maxDepth?: number;
  }
  export interface Assertion {
    mostlyEqual(expected: unknown, options?: MostlyEqualOptions): void;
  }
}
