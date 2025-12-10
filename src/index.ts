import { Expectation } from './expect.js';
import { deepEqual, objectContains } from './utils.js';
import type { AsymmetricMatcher } from './types.js';

/**
 * Create an expectation for a value to be tested
 *
 * @example
 * ```ts
 * import { expect } from 'node-test-expect'
 * import { test } from 'node:test'
 *
 * test('example', () => {
 *   expect(1 + 1).toBe(2)
 *   expect({ a: 1 }).toEqual({ a: 1 })
 * })
 * ```
 */
export function expect<T>(received: T): Expectation<T> {
  return new Expectation(received);
}

// ==================== Asymmetric Matchers ====================

/**
 * Matches any value (except null and undefined)
 */
expect.anything = (): AsymmetricMatcher => ({
  $$type: 'expect.anything',
  asymmetricMatch(other: unknown): boolean {
    return other !== null && other !== undefined;
  },
  toString(): string {
    return 'Anything';
  },
});

/**
 * Matches any value that is an instance of the given constructor
 */
expect.any = (constructor: new (...args: unknown[]) => unknown): AsymmetricMatcher => ({
  $$type: 'expect.any',
  asymmetricMatch(other: unknown): boolean {
    if (constructor === String) {
      return typeof other === 'string';
    }
    if (constructor === Number) {
      return typeof other === 'number';
    }
    if (constructor === Boolean) {
      return typeof other === 'boolean';
    }
    if (constructor === Function) {
      return typeof other === 'function';
    }
    if (constructor === Object) {
      return typeof other === 'object' && other !== null;
    }
    if (constructor === Array) {
      return Array.isArray(other);
    }
    return other instanceof constructor;
  },
  toString(): string {
    return `Any<${constructor.name}>`;
  },
});

/**
 * Matches an array that contains all the expected elements
 */
expect.arrayContaining = (expected: unknown[]): AsymmetricMatcher => ({
  $$type: 'expect.arrayContaining',
  asymmetricMatch(other: unknown): boolean {
    if (!Array.isArray(other)) return false;
    return expected.every((exp) =>
      other.some((item) => deepEqual(item, exp))
    );
  },
  toString(): string {
    return `ArrayContaining`;
  },
});

/**
 * Matches an object that contains all the expected properties
 */
expect.objectContaining = (expected: object): AsymmetricMatcher => ({
  $$type: 'expect.objectContaining',
  asymmetricMatch(other: unknown): boolean {
    if (typeof other !== 'object' || other === null) return false;
    return objectContains(other as object, expected);
  },
  toString(): string {
    return `ObjectContaining`;
  },
});

/**
 * Matches a string that contains the expected substring
 */
expect.stringContaining = (expected: string): AsymmetricMatcher => ({
  $$type: 'expect.stringContaining',
  asymmetricMatch(other: unknown): boolean {
    return typeof other === 'string' && other.includes(expected);
  },
  toString(): string {
    return `StringContaining "${expected}"`;
  },
});

/**
 * Matches a string that matches the expected pattern
 */
expect.stringMatching = (expected: string | RegExp): AsymmetricMatcher => ({
  $$type: 'expect.stringMatching',
  asymmetricMatch(other: unknown): boolean {
    if (typeof other !== 'string') return false;
    const regex = typeof expected === 'string' ? new RegExp(expected) : expected;
    return regex.test(other);
  },
  toString(): string {
    return `StringMatching ${expected}`;
  },
});

// ==================== Type Exports ====================

export type { MatcherResult, CustomMatcher, MockFn, MockCall, AsymmetricMatcher } from './types.js';
export { Expectation } from './expect.js';
