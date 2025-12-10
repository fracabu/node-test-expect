import assert from 'node:assert';
import { isAsymmetricMatcher } from './types.js';

/**
 * Format a value for display in error messages
 */
export function format(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'function') {
    return `[Function: ${value.name || 'anonymous'}]`;
  }
  if (value instanceof RegExp) return String(value);
  if (value instanceof Error) return `[${value.name}: ${value.message}]`;
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    if (value.length <= 3) {
      return `[${value.map((v) => format(v)).join(', ')}]`;
    }
    return `[${format(value[0])}, ${format(value[1])}, ... (${value.length} items)]`;
  }
  if (typeof value === 'object') {
    try {
      const str = JSON.stringify(value);
      if (str.length > 100) {
        return str.slice(0, 97) + '...';
      }
      return str;
    } catch {
      return Object.prototype.toString.call(value);
    }
  }
  return String(value);
}

/**
 * Deep equality check with support for asymmetric matchers
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  // Handle asymmetric matchers
  if (isAsymmetricMatcher(b)) {
    return b.asymmetricMatch(a);
  }
  if (isAsymmetricMatcher(a)) {
    return a.asymmetricMatch(b);
  }

  // Same reference or primitives
  if (Object.is(a, b)) {
    return true;
  }

  // Handle null/undefined
  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b;
  }

  // Different types
  if (typeof a !== typeof b) {
    return false;
  }

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle RegExp
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString();
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  // Handle objects
  if (typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a as object);
    const bKeys = Object.keys(b as object);

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    for (const key of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        return false;
      }
      if (
        !deepEqual(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key]
        )
      ) {
        return false;
      }
    }
    return true;
  }

  return false;
}

/**
 * Check if an object contains all properties of another object (subset match)
 */
export function objectContains(received: object, expected: object): boolean {
  for (const key of Object.keys(expected)) {
    if (!(key in received)) return false;

    const recVal = (received as Record<string, unknown>)[key];
    const expVal = (expected as Record<string, unknown>)[key];

    // Handle asymmetric matchers
    if (isAsymmetricMatcher(expVal)) {
      if (!expVal.asymmetricMatch(recVal)) return false;
      continue;
    }

    if (typeof expVal === 'object' && expVal !== null && !Array.isArray(expVal)) {
      if (typeof recVal !== 'object' || recVal === null) return false;
      if (!objectContains(recVal as object, expVal)) return false;
    } else if (!deepEqual(recVal, expVal)) {
      return false;
    }
  }
  return true;
}

/**
 * Get a nested property from an object by path
 */
export function getProperty(
  obj: unknown,
  path: string | string[]
): { exists: boolean; value: unknown } {
  const keys = Array.isArray(path) ? path : path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return { exists: false, value: undefined };
    }
    if (typeof current !== 'object') {
      return { exists: false, value: undefined };
    }
    if (!(key in current)) {
      return { exists: false, value: undefined };
    }
    current = (current as Record<string, unknown>)[key];
  }

  return { exists: true, value: current };
}

/**
 * Check if an array contains an item using deep equality
 */
export function arrayContainsEqual(arr: unknown[], expected: unknown): boolean {
  for (const item of arr) {
    if (deepEqual(item, expected)) {
      return true;
    }
  }
  return false;
}
