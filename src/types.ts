/**
 * Result returned by a custom matcher
 */
export interface MatcherResult {
  pass: boolean;
  message: () => string;
}

/**
 * Custom matcher function signature
 */
export type CustomMatcher<T = unknown> = (
  received: T,
  ...args: unknown[]
) => MatcherResult;

/**
 * Node.js test mock call structure
 */
export interface MockCall {
  arguments: unknown[];
  result: unknown;
  error: unknown;
  target: unknown;
  this: unknown;
}

/**
 * Node.js test mock function interface
 */
export interface MockFn {
  mock: {
    calls: MockCall[];
    callCount: () => number;
    resetCalls: () => void;
  };
}

/**
 * Check if value is a mock function from node:test
 */
export function isMockFn(value: unknown): value is MockFn {
  if (typeof value !== 'function' || value === null) {
    return false;
  }

  // node:test mock functions have a .mock property that may not be enumerable
  const mock = (value as unknown as MockFn).mock;
  if (typeof mock !== 'object' || mock === null) {
    return false;
  }

  return 'calls' in mock && Array.isArray(mock.calls);
}

/**
 * Asymmetric matcher marker
 */
export interface AsymmetricMatcher {
  $$type: string;
  asymmetricMatch(other: unknown): boolean;
  toString(): string;
}

/**
 * Check if value is an asymmetric matcher
 */
export function isAsymmetricMatcher(value: unknown): value is AsymmetricMatcher {
  return (
    typeof value === 'object' &&
    value !== null &&
    '$$type' in value &&
    typeof (value as AsymmetricMatcher).asymmetricMatch === 'function'
  );
}
