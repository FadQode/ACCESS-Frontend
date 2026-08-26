// Minimal surface of bun:test used by *.test.ts checks (bun runs them via
// `bun test`). ponytail: replace with @types/bun or Vitest when CI needs it.
declare module "bun:test" {
  export function describe(name: string, fn: () => void): void;
  export function expect(value: unknown): {
    toBe(expected: unknown): void;
    toEqual(expected: unknown): void;
    toHaveLength(length: number): void;
    toBeUndefined(): void;
  };
  export function test(name: string, fn: () => void): void;
}
