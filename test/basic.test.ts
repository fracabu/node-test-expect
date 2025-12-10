import { test, describe } from 'node:test';
import { expect } from '../src/index.js';

describe('basic matchers', () => {
  test('toBe with primitives', () => {
    expect(1).toBe(1);
    expect('hello').toBe('hello');
    expect(true).toBe(true);
    expect(null).toBe(null);
    expect(undefined).toBe(undefined);
  });

  test('toBe with same reference', () => {
    const obj = { a: 1 };
    expect(obj).toBe(obj);

    const arr = [1, 2, 3];
    expect(arr).toBe(arr);
  });

  test('toBe fails for different references', () => {
    let threw = false;
    try {
      expect({ a: 1 }).toBe({ a: 1 });
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });

  test('toBe with not', () => {
    expect(1).not.toBe(2);
    expect('hello').not.toBe('world');
    expect({ a: 1 }).not.toBe({ a: 1 }); // different references
  });

  test('toEqual with primitives', () => {
    expect(1).toEqual(1);
    expect('hello').toEqual('hello');
    expect(true).toEqual(true);
  });

  test('toEqual with objects (deep equality)', () => {
    expect({ a: 1 }).toEqual({ a: 1 });
    expect({ a: { b: 2 } }).toEqual({ a: { b: 2 } });
    expect([1, 2, 3]).toEqual([1, 2, 3]);
    expect([{ a: 1 }, { b: 2 }]).toEqual([{ a: 1 }, { b: 2 }]);
  });

  test('toEqual with not', () => {
    expect({ a: 1 }).not.toEqual({ a: 2 });
    expect([1, 2]).not.toEqual([1, 2, 3]);
  });

  test('toStrictEqual (same as toEqual)', () => {
    expect({ a: 1 }).toStrictEqual({ a: 1 });
    expect([1, 2]).toStrictEqual([1, 2]);
  });
});

describe('truthiness matchers', () => {
  test('toBeTruthy', () => {
    expect(true).toBeTruthy();
    expect(1).toBeTruthy();
    expect('hello').toBeTruthy();
    expect({}).toBeTruthy();
    expect([]).toBeTruthy();
    expect(() => {}).toBeTruthy();
  });

  test('toBeTruthy with not', () => {
    expect(false).not.toBeTruthy();
    expect(0).not.toBeTruthy();
    expect('').not.toBeTruthy();
    expect(null).not.toBeTruthy();
    expect(undefined).not.toBeTruthy();
  });

  test('toBeFalsy', () => {
    expect(false).toBeFalsy();
    expect(0).toBeFalsy();
    expect('').toBeFalsy();
    expect(null).toBeFalsy();
    expect(undefined).toBeFalsy();
    expect(NaN).toBeFalsy();
  });

  test('toBeFalsy with not', () => {
    expect(true).not.toBeFalsy();
    expect(1).not.toBeFalsy();
    expect('hello').not.toBeFalsy();
  });

  test('toBeNull', () => {
    expect(null).toBeNull();
    expect(undefined).not.toBeNull();
    expect(0).not.toBeNull();
    expect('').not.toBeNull();
  });

  test('toBeUndefined', () => {
    expect(undefined).toBeUndefined();
    expect(null).not.toBeUndefined();
    expect(0).not.toBeUndefined();
  });

  test('toBeDefined', () => {
    expect(1).toBeDefined();
    expect(null).toBeDefined();
    expect('').toBeDefined();
    expect(0).toBeDefined();
    expect(undefined).not.toBeDefined();
  });

  test('toBeNaN', () => {
    expect(NaN).toBeNaN();
    expect(Number('not a number')).toBeNaN();
    expect(0).not.toBeNaN();
    expect(1).not.toBeNaN();
    expect(Infinity).not.toBeNaN();
  });
});

describe('number matchers', () => {
  test('toBeGreaterThan', () => {
    expect(10).toBeGreaterThan(5);
    expect(0).toBeGreaterThan(-1);
    expect(5).not.toBeGreaterThan(10);
    expect(5).not.toBeGreaterThan(5);
  });

  test('toBeGreaterThanOrEqual', () => {
    expect(10).toBeGreaterThanOrEqual(5);
    expect(5).toBeGreaterThanOrEqual(5);
    expect(4).not.toBeGreaterThanOrEqual(5);
  });

  test('toBeLessThan', () => {
    expect(5).toBeLessThan(10);
    expect(-1).toBeLessThan(0);
    expect(10).not.toBeLessThan(5);
    expect(5).not.toBeLessThan(5);
  });

  test('toBeLessThanOrEqual', () => {
    expect(5).toBeLessThanOrEqual(10);
    expect(5).toBeLessThanOrEqual(5);
    expect(6).not.toBeLessThanOrEqual(5);
  });

  test('toBeCloseTo', () => {
    expect(0.1 + 0.2).toBeCloseTo(0.3);
    expect(0.1 + 0.2).toBeCloseTo(0.3, 5);
    expect(0.1 + 0.2).toBeCloseTo(0.3, 10);
    expect(10.01).toBeCloseTo(10, 1);
    expect(10.001).not.toBeCloseTo(10, 3);
  });
});

describe('string matchers', () => {
  test('toContain for strings', () => {
    expect('hello world').toContain('world');
    expect('hello world').toContain('hello');
    expect('hello world').toContain(' ');
    expect('hello').not.toContain('world');
  });

  test('toMatch with regex', () => {
    expect('hello world').toMatch(/world/);
    expect('hello world').toMatch(/^hello/);
    expect('hello world').toMatch(/world$/);
    expect('hello').not.toMatch(/world/);
  });

  test('toMatch with string (converted to regex)', () => {
    expect('hello world').toMatch('world');
    expect('hello world').toMatch('ello');
    expect('hello').not.toMatch('world');
  });

  test('toHaveLength for strings', () => {
    expect('hello').toHaveLength(5);
    expect('').toHaveLength(0);
    expect('hello').not.toHaveLength(4);
  });
});

describe('array matchers', () => {
  test('toContain for arrays', () => {
    expect([1, 2, 3]).toContain(2);
    expect(['a', 'b', 'c']).toContain('b');
    expect([1, 2, 3]).not.toContain(4);
  });

  test('toContainEqual for arrays (deep equality)', () => {
    expect([{ a: 1 }, { b: 2 }]).toContainEqual({ a: 1 });
    expect([{ a: 1 }, { b: 2 }]).toContainEqual({ b: 2 });
    expect([[1, 2], [3, 4]]).toContainEqual([1, 2]);
    expect([{ a: 1 }]).not.toContainEqual({ a: 2 });
  });

  test('toHaveLength for arrays', () => {
    expect([1, 2, 3]).toHaveLength(3);
    expect([]).toHaveLength(0);
    expect([1]).toHaveLength(1);
    expect([1, 2]).not.toHaveLength(3);
  });
});

describe('object matchers', () => {
  test('toHaveProperty - property exists', () => {
    expect({ a: 1 }).toHaveProperty('a');
    expect({ a: { b: 2 } }).toHaveProperty('a');
    expect({}).not.toHaveProperty('a');
  });

  test('toHaveProperty - nested path with dot notation', () => {
    expect({ a: { b: 2 } }).toHaveProperty('a.b');
    expect({ a: { b: { c: 3 } } }).toHaveProperty('a.b.c');
    expect({ a: 1 }).not.toHaveProperty('a.b');
  });

  test('toHaveProperty - nested path with array', () => {
    expect({ a: { b: 2 } }).toHaveProperty(['a', 'b']);
    expect({ a: { b: { c: 3 } } }).toHaveProperty(['a', 'b', 'c']);
  });

  test('toHaveProperty - with value check', () => {
    expect({ a: 1 }).toHaveProperty('a', 1);
    expect({ a: { b: 2 } }).toHaveProperty('a.b', 2);
    expect({ a: { b: 2 } }).toHaveProperty(['a', 'b'], 2);
    expect({ a: 1 }).not.toHaveProperty('a', 2);
  });

  test('toMatchObject - partial match', () => {
    expect({ a: 1, b: 2 }).toMatchObject({ a: 1 });
    expect({ a: 1, b: 2, c: 3 }).toMatchObject({ a: 1, b: 2 });
    expect({ a: { b: 2, c: 3 } }).toMatchObject({ a: { b: 2 } });
  });

  test('toMatchObject with not', () => {
    expect({ a: 1 }).not.toMatchObject({ a: 2 });
    expect({ a: 1 }).not.toMatchObject({ b: 1 });
  });

  test('toBeInstanceOf', () => {
    expect(new Error()).toBeInstanceOf(Error);
    expect(new TypeError()).toBeInstanceOf(Error);
    expect(new TypeError()).toBeInstanceOf(TypeError);
    expect([]).toBeInstanceOf(Array);
    expect({}).toBeInstanceOf(Object);
    expect(new Date()).toBeInstanceOf(Date);
  });

  test('toBeInstanceOf with not', () => {
    expect({}).not.toBeInstanceOf(Array);
    expect([]).not.toBeInstanceOf(Date);
  });
});

describe('error matchers', () => {
  test('toThrow - function throws', () => {
    const throwFn = (): void => {
      throw new Error('oops');
    };
    expect(throwFn).toThrow();
  });

  test('toThrow - function does not throw', () => {
    const noThrow = (): string => 'ok';
    expect(noThrow).not.toThrow();
  });

  test('toThrow with string message', () => {
    const throwFn = (): void => {
      throw new Error('something went wrong');
    };
    expect(throwFn).toThrow('went wrong');
    expect(throwFn).toThrow('something');
  });

  test('toThrow with regex', () => {
    const throwFn = (): void => {
      throw new Error('Error code: 404');
    };
    expect(throwFn).toThrow(/404/);
    expect(throwFn).toThrow(/Error code/);
  });

  test('toThrow with error class', () => {
    const throwType = (): void => {
      throw new TypeError('type error');
    };
    expect(throwType).toThrow(TypeError);
    expect(throwType).toThrow(Error);
  });

  test('toThrowError (alias)', () => {
    const throwFn = (): void => {
      throw new Error('test');
    };
    expect(throwFn).toThrowError();
    expect(throwFn).toThrowError('test');
  });
});
