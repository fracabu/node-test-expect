import { test, describe } from 'node:test';
import { expect } from '../src/index.js';

describe('async matchers - resolves', () => {
  test('resolves.toBe', async () => {
    await expect(Promise.resolve(42)).resolves.toBe(42);
    await expect(Promise.resolve('hello')).resolves.toBe('hello');
  });

  test('resolves.toEqual', async () => {
    await expect(Promise.resolve({ a: 1 })).resolves.toEqual({ a: 1 });
    await expect(Promise.resolve([1, 2, 3])).resolves.toEqual([1, 2, 3]);
  });

  test('resolves.toBeTruthy', async () => {
    await expect(Promise.resolve(true)).resolves.toBeTruthy();
    await expect(Promise.resolve(1)).resolves.toBeTruthy();
  });

  test('resolves.toBeFalsy', async () => {
    await expect(Promise.resolve(false)).resolves.toBeFalsy();
    await expect(Promise.resolve(0)).resolves.toBeFalsy();
  });

  test('resolves.toBeNull', async () => {
    await expect(Promise.resolve(null)).resolves.toBeNull();
  });

  test('resolves.toBeUndefined', async () => {
    await expect(Promise.resolve(undefined)).resolves.toBeUndefined();
  });

  test('resolves.toBeDefined', async () => {
    await expect(Promise.resolve(1)).resolves.toBeDefined();
  });

  test('resolves.toContain', async () => {
    await expect(Promise.resolve('hello world')).resolves.toContain('world');
    await expect(Promise.resolve([1, 2, 3])).resolves.toContain(2);
  });

  test('resolves.toHaveLength', async () => {
    await expect(Promise.resolve([1, 2, 3])).resolves.toHaveLength(3);
    await expect(Promise.resolve('hello')).resolves.toHaveLength(5);
  });

  test('resolves.toHaveProperty', async () => {
    await expect(Promise.resolve({ a: 1 })).resolves.toHaveProperty('a');
    await expect(Promise.resolve({ a: 1 })).resolves.toHaveProperty('a', 1);
  });

  test('resolves.toMatchObject', async () => {
    await expect(Promise.resolve({ a: 1, b: 2 })).resolves.toMatchObject({ a: 1 });
  });

  test('resolves.toBeInstanceOf', async () => {
    await expect(Promise.resolve(new Error())).resolves.toBeInstanceOf(Error);
  });

  test('resolves.toBeGreaterThan', async () => {
    await expect(Promise.resolve(10)).resolves.toBeGreaterThan(5);
  });

  test('resolves.toBeLessThan', async () => {
    await expect(Promise.resolve(5)).resolves.toBeLessThan(10);
  });

  test('resolves.toBeCloseTo', async () => {
    await expect(Promise.resolve(0.1 + 0.2)).resolves.toBeCloseTo(0.3);
  });

  test('resolves.toMatch', async () => {
    await expect(Promise.resolve('hello world')).resolves.toMatch(/world/);
  });

  test('resolves.toContainEqual', async () => {
    await expect(Promise.resolve([{ a: 1 }, { b: 2 }])).resolves.toContainEqual({ a: 1 });
  });

  test('resolves with not', async () => {
    await expect(Promise.resolve(42)).resolves.not.toBe(43);
    await expect(Promise.resolve({ a: 1 })).resolves.not.toEqual({ a: 2 });
  });
});

describe('async matchers - rejects', () => {
  test('rejects.toThrow', async () => {
    await expect(Promise.reject(new Error('fail'))).rejects.toThrow('fail');
    await expect(Promise.reject(new Error('error message'))).rejects.toThrow(/error/);
  });

  test('rejects.toThrow with error class', async () => {
    await expect(Promise.reject(new TypeError('type error'))).rejects.toThrow(TypeError);
    await expect(Promise.reject(new TypeError('type error'))).rejects.toThrow(Error);
  });

  test('rejects.toBeInstanceOf', async () => {
    await expect(Promise.reject(new TypeError('oops'))).rejects.toBeInstanceOf(TypeError);
    await expect(Promise.reject(new TypeError('oops'))).rejects.toBeInstanceOf(Error);
  });

  test('rejects with not', async () => {
    await expect(Promise.reject(new Error('fail'))).rejects.not.toThrow('success');
    await expect(Promise.reject(new Error('fail'))).rejects.not.toThrow(/success/);
  });

  test('rejects fails if promise resolves', async () => {
    let threw = false;
    try {
      await expect(Promise.resolve('ok')).rejects.toThrow();
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });
});

describe('async functions', () => {
  test('resolves with async function result', async () => {
    const asyncFn = async (): Promise<string> => 'result';
    await expect(asyncFn()).resolves.toBe('result');
  });

  test('rejects with async function error', async () => {
    const asyncFn = async (): Promise<never> => {
      throw new Error('async error');
    };
    await expect(asyncFn()).rejects.toThrow('async error');
  });
});
