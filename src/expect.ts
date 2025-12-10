import assert from 'node:assert';
import { isMockFn, type MockFn } from './types.js';
import {
  format,
  deepEqual,
  objectContains,
  getProperty,
  arrayContainsEqual,
} from './utils.js';

/**
 * Main Expectation class that wraps a received value and provides matchers
 */
export class Expectation<T> {
  protected received: T;
  protected isNot: boolean = false;

  constructor(received: T) {
    this.received = received;
  }

  /**
   * Negates the following matcher
   */
  get not(): this {
    const negated = Object.create(this) as this;
    negated.isNot = !this.isNot;
    return negated;
  }

  /**
   * For asserting on resolved promise values
   */
  get resolves(): PromiseExpectation<T> {
    return new PromiseExpectation(this.received, 'resolves', this.isNot);
  }

  /**
   * For asserting on rejected promise values
   */
  get rejects(): PromiseExpectation<T> {
    return new PromiseExpectation(this.received, 'rejects', this.isNot);
  }

  // ==================== Basic Matchers ====================

  /**
   * Strict equality using Object.is
   */
  toBe(expected: T): void {
    const pass = Object.is(this.received, expected);
    this.assert(
      pass,
      () =>
        `expected ${format(this.received)} to${this.isNot ? ' not' : ''} be ${format(expected)}`
    );
  }

  /**
   * Deep equality check
   */
  toEqual(expected: T): void {
    const pass = deepEqual(this.received, expected);
    this.assert(
      pass,
      () =>
        `expected ${format(this.received)} to${this.isNot ? ' not' : ''} equal ${format(expected)}`
    );
  }

  /**
   * Strict deep equality (same as toEqual for our implementation)
   */
  toStrictEqual(expected: T): void {
    this.toEqual(expected);
  }

  // ==================== Truthiness Matchers ====================

  /**
   * Check if value is truthy
   */
  toBeTruthy(): void {
    const pass = Boolean(this.received);
    this.assert(
      pass,
      () =>
        `expected ${format(this.received)} to${this.isNot ? ' not' : ''} be truthy`
    );
  }

  /**
   * Check if value is falsy
   */
  toBeFalsy(): void {
    const pass = !this.received;
    this.assert(
      pass,
      () =>
        `expected ${format(this.received)} to${this.isNot ? ' not' : ''} be falsy`
    );
  }

  /**
   * Check if value is null
   */
  toBeNull(): void {
    const pass = this.received === null;
    this.assert(
      pass,
      () =>
        `expected ${format(this.received)} to${this.isNot ? ' not' : ''} be null`
    );
  }

  /**
   * Check if value is undefined
   */
  toBeUndefined(): void {
    const pass = this.received === undefined;
    this.assert(
      pass,
      () =>
        `expected ${format(this.received)} to${this.isNot ? ' not' : ''} be undefined`
    );
  }

  /**
   * Check if value is defined (not undefined)
   */
  toBeDefined(): void {
    const pass = this.received !== undefined;
    this.assert(
      pass,
      () =>
        `expected ${format(this.received)} to${this.isNot ? ' not' : ''} be defined`
    );
  }

  /**
   * Check if value is NaN
   */
  toBeNaN(): void {
    const pass = Number.isNaN(this.received);
    this.assert(
      pass,
      () =>
        `expected ${format(this.received)} to${this.isNot ? ' not' : ''} be NaN`
    );
  }

  // ==================== Number Matchers ====================

  /**
   * Check if number is greater than expected
   */
  toBeGreaterThan(expected: number): void {
    const pass = (this.received as number) > expected;
    this.assert(
      pass,
      () =>
        `expected ${this.received} to${this.isNot ? ' not' : ''} be greater than ${expected}`
    );
  }

  /**
   * Check if number is greater than or equal to expected
   */
  toBeGreaterThanOrEqual(expected: number): void {
    const pass = (this.received as number) >= expected;
    this.assert(
      pass,
      () =>
        `expected ${this.received} to${this.isNot ? ' not' : ''} be greater than or equal to ${expected}`
    );
  }

  /**
   * Check if number is less than expected
   */
  toBeLessThan(expected: number): void {
    const pass = (this.received as number) < expected;
    this.assert(
      pass,
      () =>
        `expected ${this.received} to${this.isNot ? ' not' : ''} be less than ${expected}`
    );
  }

  /**
   * Check if number is less than or equal to expected
   */
  toBeLessThanOrEqual(expected: number): void {
    const pass = (this.received as number) <= expected;
    this.assert(
      pass,
      () =>
        `expected ${this.received} to${this.isNot ? ' not' : ''} be less than or equal to ${expected}`
    );
  }

  /**
   * Check if number is close to expected within precision
   */
  toBeCloseTo(expected: number, precision: number = 2): void {
    const diff = Math.abs((this.received as number) - expected);
    const pass = diff < Math.pow(10, -precision) / 2;
    this.assert(
      pass,
      () =>
        `expected ${this.received} to${this.isNot ? ' not' : ''} be close to ${expected} (precision: ${precision})`
    );
  }

  // ==================== String/Array Matchers ====================

  /**
   * Check if string/array contains expected value
   */
  toContain(expected: unknown): void {
    const received = this.received as string | unknown[];
    let pass: boolean;

    if (typeof received === 'string') {
      pass = received.includes(expected as string);
    } else if (Array.isArray(received)) {
      pass = received.includes(expected);
    } else {
      pass = false;
    }

    this.assert(
      pass,
      () =>
        `expected ${format(this.received)} to${this.isNot ? ' not' : ''} contain ${format(expected)}`
    );
  }

  /**
   * Check if array contains an item deeply equal to expected
   */
  toContainEqual(expected: unknown): void {
    const received = this.received;
    if (!Array.isArray(received)) {
      throw new Error('toContainEqual() requires an array');
    }

    const pass = arrayContainsEqual(received, expected);
    this.assert(
      pass,
      () =>
        `expected ${format(this.received)} to${this.isNot ? ' not' : ''} contain equal ${format(expected)}`
    );
  }

  /**
   * Check if string matches regex or substring
   */
  toMatch(expected: string | RegExp): void {
    const received = this.received as string;
    const regex = typeof expected === 'string' ? new RegExp(expected) : expected;
    const pass = regex.test(received);

    this.assert(
      pass,
      () =>
        `expected "${received}" to${this.isNot ? ' not' : ''} match ${expected}`
    );
  }

  /**
   * Check if string/array has expected length
   */
  toHaveLength(expected: number): void {
    const received = this.received as { length: number };
    const pass = received.length === expected;

    this.assert(
      pass,
      () =>
        `expected ${format(this.received)} to${this.isNot ? ' not' : ''} have length ${expected}, got ${received.length}`
    );
  }

  // ==================== Object Matchers ====================

  /**
   * Check if object has property (optionally with value)
   */
  toHaveProperty(path: string | string[], value?: unknown): void {
    const { exists, value: actualValue } = getProperty(this.received, path);
    const pathStr = Array.isArray(path) ? path.join('.') : path;

    let pass: boolean;
    if (arguments.length === 1) {
      pass = exists;
    } else {
      pass = exists && deepEqual(actualValue, value);
    }

    this.assert(
      pass,
      () =>
        `expected ${format(this.received)} to${this.isNot ? ' not' : ''} have property "${pathStr}"${arguments.length > 1 ? ` with value ${format(value)}` : ''}`
    );
  }

  /**
   * Check if object matches a subset of properties
   */
  toMatchObject(expected: object): void {
    if (typeof this.received !== 'object' || this.received === null) {
      this.assert(
        false,
        () => `expected ${format(this.received)} to be an object`
      );
      return;
    }

    const pass = objectContains(this.received as object, expected);
    this.assert(
      pass,
      () =>
        `expected ${format(this.received)} to${this.isNot ? ' not' : ''} match object ${format(expected)}`
    );
  }

  /**
   * Check if value is instance of constructor
   */
  toBeInstanceOf(expected: new (...args: unknown[]) => unknown): void {
    const pass = this.received instanceof expected;
    this.assert(
      pass,
      () =>
        `expected ${format(this.received)} to${this.isNot ? ' not' : ''} be instance of ${expected.name}`
    );
  }

  // ==================== Error Matchers ====================

  /**
   * Check if function throws an error
   */
  toThrow(expected?: string | RegExp | (new (...args: unknown[]) => Error)): void {
    if (typeof this.received !== 'function') {
      throw new Error('toThrow() requires a function');
    }

    let threw = false;
    let error: Error | undefined;

    try {
      (this.received as () => void)();
    } catch (e) {
      threw = true;
      error = e as Error;
    }

    let pass = threw;

    if (threw && expected !== undefined && error !== undefined) {
      if (typeof expected === 'string') {
        pass = error.message.includes(expected);
      } else if (expected instanceof RegExp) {
        pass = expected.test(error.message);
      } else if (typeof expected === 'function') {
        pass = error instanceof expected;
      }
    }

    this.assert(
      pass,
      () =>
        threw
          ? `expected function to${this.isNot ? ' not' : ''} throw${expected ? ` ${format(expected)}` : ''}, but it threw ${format(error)}`
          : `expected function to throw`
    );
  }

  /**
   * Alias for toThrow
   */
  toThrowError(expected?: string | RegExp | (new (...args: unknown[]) => Error)): void {
    this.toThrow(expected);
  }

  // ==================== Mock Matchers ====================

  /**
   * Check if mock function was called
   */
  toHaveBeenCalled(): void {
    const mock = this.getMock();
    const pass = mock.mock.calls.length > 0;

    this.assert(
      pass,
      () =>
        `expected mock to${this.isNot ? ' not' : ''} have been called, but it was${mock.mock.calls.length > 0 ? ` called ${mock.mock.calls.length} times` : ' not called'}`
    );
  }

  /**
   * Check if mock function was called exactly n times
   */
  toHaveBeenCalledTimes(times: number): void {
    const mock = this.getMock();
    const pass = mock.mock.calls.length === times;

    this.assert(
      pass,
      () =>
        `expected mock to${this.isNot ? ' not' : ''} have been called ${times} times, got ${mock.mock.calls.length}`
    );
  }

  /**
   * Check if mock function was called with specific arguments
   */
  toHaveBeenCalledWith(...args: unknown[]): void {
    const mock = this.getMock();
    const pass = mock.mock.calls.some((call) => deepEqual(call.arguments, args));

    this.assert(
      pass,
      () =>
        `expected mock to${this.isNot ? ' not' : ''} have been called with ${format(args)}`
    );
  }

  /**
   * Check if mock function was last called with specific arguments
   */
  toHaveBeenLastCalledWith(...args: unknown[]): void {
    const mock = this.getMock();
    const lastCall = mock.mock.calls[mock.mock.calls.length - 1];
    const pass = lastCall !== undefined && deepEqual(lastCall.arguments, args);

    this.assert(
      pass,
      () =>
        `expected mock to${this.isNot ? ' not' : ''} have been last called with ${format(args)}`
    );
  }

  /**
   * Check if mock function was called on nth call with specific arguments
   */
  toHaveBeenNthCalledWith(n: number, ...args: unknown[]): void {
    const mock = this.getMock();
    const nthCall = mock.mock.calls[n - 1];
    const pass = nthCall !== undefined && deepEqual(nthCall.arguments, args);

    this.assert(
      pass,
      () =>
        `expected mock to${this.isNot ? ' not' : ''} have been called on call ${n} with ${format(args)}`
    );
  }

  /**
   * Check if mock function returned successfully at least once
   */
  toHaveReturned(): void {
    const mock = this.getMock();
    const pass = mock.mock.calls.some((call) => call.error === undefined);

    this.assert(
      pass,
      () => `expected mock to${this.isNot ? ' not' : ''} have returned`
    );
  }

  /**
   * Check if mock function returned successfully n times
   */
  toHaveReturnedTimes(times: number): void {
    const mock = this.getMock();
    const returned = mock.mock.calls.filter(
      (call) => call.error === undefined
    ).length;
    const pass = returned === times;

    this.assert(
      pass,
      () =>
        `expected mock to${this.isNot ? ' not' : ''} have returned ${times} times, got ${returned}`
    );
  }

  /**
   * Check if mock function returned with specific value
   */
  toHaveReturnedWith(expected: unknown): void {
    const mock = this.getMock();
    const pass = mock.mock.calls.some(
      (call) => call.error === undefined && deepEqual(call.result, expected)
    );

    this.assert(
      pass,
      () =>
        `expected mock to${this.isNot ? ' not' : ''} have returned with ${format(expected)}`
    );
  }

  /**
   * Check if mock function last returned with specific value
   */
  toHaveLastReturnedWith(expected: unknown): void {
    const mock = this.getMock();
    const lastCall = mock.mock.calls[mock.mock.calls.length - 1];
    const pass =
      lastCall !== undefined &&
      lastCall.error === undefined &&
      deepEqual(lastCall.result, expected);

    this.assert(
      pass,
      () =>
        `expected mock to${this.isNot ? ' not' : ''} have last returned with ${format(expected)}`
    );
  }

  // ==================== Protected Helpers ====================

  /**
   * Assert a condition, respecting the isNot flag
   */
  protected assert(pass: boolean, message: () => string): void {
    const finalPass = this.isNot ? !pass : pass;
    if (!finalPass) {
      throw new assert.AssertionError({ message: message() });
    }
  }

  /**
   * Get mock object from received value, throwing if not a mock
   */
  protected getMock(): MockFn {
    if (!isMockFn(this.received)) {
      throw new Error(
        'Expected a mock function created with node:test mock.fn()'
      );
    }
    return this.received;
  }
}

/**
 * Expectation wrapper for promise assertions (resolves/rejects)
 */
class PromiseExpectation<T> {
  private promise: T;
  private type: 'resolves' | 'rejects';
  private isNot: boolean;

  constructor(promise: T, type: 'resolves' | 'rejects', isNot: boolean) {
    this.promise = promise;
    this.type = type;
    this.isNot = isNot;
  }

  get not(): PromiseExpectation<T> {
    return new PromiseExpectation(this.promise, this.type, !this.isNot);
  }

  private async getValue(): Promise<unknown> {
    if (this.type === 'resolves') {
      return this.promise;
    } else {
      try {
        await this.promise;
        throw new assert.AssertionError({
          message: 'Expected promise to reject, but it resolved',
        });
      } catch (e) {
        if (e instanceof assert.AssertionError) throw e;
        return e;
      }
    }
  }

  private createExpectation(value: unknown): Expectation<unknown> {
    const exp = new Expectation(value);
    if (this.isNot) {
      return exp.not;
    }
    return exp;
  }

  async toBe(expected: unknown): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toBe(expected);
  }

  async toEqual(expected: unknown): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toEqual(expected);
  }

  async toStrictEqual(expected: unknown): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toStrictEqual(expected);
  }

  async toBeTruthy(): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toBeTruthy();
  }

  async toBeFalsy(): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toBeFalsy();
  }

  async toBeNull(): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toBeNull();
  }

  async toBeUndefined(): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toBeUndefined();
  }

  async toBeDefined(): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toBeDefined();
  }

  async toBeNaN(): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toBeNaN();
  }

  async toBeGreaterThan(expected: number): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toBeGreaterThan(expected);
  }

  async toBeGreaterThanOrEqual(expected: number): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toBeGreaterThanOrEqual(expected);
  }

  async toBeLessThan(expected: number): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toBeLessThan(expected);
  }

  async toBeLessThanOrEqual(expected: number): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toBeLessThanOrEqual(expected);
  }

  async toBeCloseTo(expected: number, precision?: number): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toBeCloseTo(expected, precision);
  }

  async toContain(expected: unknown): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toContain(expected);
  }

  async toContainEqual(expected: unknown): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toContainEqual(expected);
  }

  async toMatch(expected: string | RegExp): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toMatch(expected);
  }

  async toHaveLength(expected: number): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toHaveLength(expected);
  }

  async toHaveProperty(path: string | string[], value?: unknown): Promise<void> {
    const val = await this.getValue();
    if (arguments.length === 1) {
      this.createExpectation(val).toHaveProperty(path);
    } else {
      this.createExpectation(val).toHaveProperty(path, value);
    }
  }

  async toMatchObject(expected: object): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toMatchObject(expected);
  }

  async toBeInstanceOf(expected: new (...args: unknown[]) => unknown): Promise<void> {
    const value = await this.getValue();
    this.createExpectation(value).toBeInstanceOf(expected);
  }

  async toThrow(expected?: string | RegExp | (new (...args: unknown[]) => Error)): Promise<void> {
    const value = await this.getValue();
    // For rejects, the value IS the error, so we check it directly
    if (this.type === 'rejects') {
      const error = value as Error;
      let pass = true;

      if (expected !== undefined) {
        if (typeof expected === 'string') {
          pass = error.message.includes(expected);
        } else if (expected instanceof RegExp) {
          pass = expected.test(error.message);
        } else if (typeof expected === 'function') {
          pass = error instanceof expected;
        }
      }

      const finalPass = this.isNot ? !pass : pass;
      if (!finalPass) {
        throw new assert.AssertionError({
          message: `expected rejected value to${this.isNot ? ' not' : ''} match ${expected}`,
        });
      }
    } else {
      this.createExpectation(value).toThrow(expected);
    }
  }

  async toThrowError(expected?: string | RegExp | (new (...args: unknown[]) => Error)): Promise<void> {
    await this.toThrow(expected);
  }
}
