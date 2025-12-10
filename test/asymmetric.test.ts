import { test, describe } from 'node:test';
import { expect } from '../src/index.js';

describe('asymmetric matchers', () => {
  describe('expect.anything()', () => {
    test('matches any value except null and undefined', () => {
      expect(1).toEqual(expect.anything());
      expect('hello').toEqual(expect.anything());
      expect({}).toEqual(expect.anything());
      expect([]).toEqual(expect.anything());
      expect(true).toEqual(expect.anything());
      expect(0).toEqual(expect.anything());
      expect('').toEqual(expect.anything());
    });

    test('does not match null or undefined', () => {
      expect(null).not.toEqual(expect.anything());
      expect(undefined).not.toEqual(expect.anything());
    });

    test('works in nested objects', () => {
      expect({ a: 1, b: 'test' }).toEqual({
        a: expect.anything(),
        b: expect.anything(),
      });
    });
  });

  describe('expect.any()', () => {
    test('matches strings', () => {
      expect('hello').toEqual(expect.any(String));
      expect('').toEqual(expect.any(String));
    });

    test('matches numbers', () => {
      expect(42).toEqual(expect.any(Number));
      expect(0).toEqual(expect.any(Number));
      expect(3.14).toEqual(expect.any(Number));
    });

    test('matches booleans', () => {
      expect(true).toEqual(expect.any(Boolean));
      expect(false).toEqual(expect.any(Boolean));
    });

    test('matches functions', () => {
      expect(() => {}).toEqual(expect.any(Function));
      expect(function named() {}).toEqual(expect.any(Function));
    });

    test('matches objects', () => {
      expect({}).toEqual(expect.any(Object));
      expect({ a: 1 }).toEqual(expect.any(Object));
    });

    test('matches arrays', () => {
      expect([]).toEqual(expect.any(Array));
      expect([1, 2, 3]).toEqual(expect.any(Array));
    });

    test('matches class instances', () => {
      class MyClass {}
      expect(new MyClass()).toEqual(expect.any(MyClass));
      expect(new Error()).toEqual(expect.any(Error));
      expect(new Date()).toEqual(expect.any(Date));
    });

    test('works in nested objects', () => {
      expect({ name: 'John', age: 30 }).toEqual({
        name: expect.any(String),
        age: expect.any(Number),
      });
    });
  });

  describe('expect.stringContaining()', () => {
    test('matches strings containing substring', () => {
      expect('hello world').toEqual(expect.stringContaining('world'));
      expect('hello world').toEqual(expect.stringContaining('hello'));
      expect('testing').toEqual(expect.stringContaining('test'));
    });

    test('does not match strings without substring', () => {
      expect('hello').not.toEqual(expect.stringContaining('world'));
    });

    test('works in nested objects', () => {
      expect({ message: 'Error: something went wrong' }).toEqual({
        message: expect.stringContaining('Error'),
      });
    });
  });

  describe('expect.stringMatching()', () => {
    test('matches strings with regex', () => {
      expect('hello world').toEqual(expect.stringMatching(/world/));
      expect('test123').toEqual(expect.stringMatching(/\d+/));
      expect('hello').toEqual(expect.stringMatching(/^hello$/));
    });

    test('matches strings with string pattern', () => {
      expect('hello world').toEqual(expect.stringMatching('world'));
    });

    test('does not match non-matching strings', () => {
      expect('hello').not.toEqual(expect.stringMatching(/world/));
    });
  });

  describe('expect.arrayContaining()', () => {
    test('matches arrays containing all expected elements', () => {
      expect([1, 2, 3]).toEqual(expect.arrayContaining([1, 2]));
      expect([1, 2, 3]).toEqual(expect.arrayContaining([2, 3]));
      expect([1, 2, 3]).toEqual(expect.arrayContaining([1]));
    });

    test('order does not matter', () => {
      expect([1, 2, 3]).toEqual(expect.arrayContaining([3, 1]));
    });

    test('does not match if elements are missing', () => {
      expect([1, 2]).not.toEqual(expect.arrayContaining([1, 2, 3]));
    });

    test('works with empty array', () => {
      expect([1, 2, 3]).toEqual(expect.arrayContaining([]));
    });
  });

  describe('expect.objectContaining()', () => {
    test('matches objects containing all expected properties', () => {
      expect({ a: 1, b: 2, c: 3 }).toEqual(expect.objectContaining({ a: 1 }));
      expect({ a: 1, b: 2, c: 3 }).toEqual(expect.objectContaining({ a: 1, b: 2 }));
    });

    test('does not match if properties are missing', () => {
      expect({ a: 1 }).not.toEqual(expect.objectContaining({ a: 1, b: 2 }));
    });

    test('does not match if property values differ', () => {
      expect({ a: 1, b: 2 }).not.toEqual(expect.objectContaining({ a: 2 }));
    });

    test('works with nested objects', () => {
      expect({ a: { b: 1, c: 2 } }).toEqual(
        expect.objectContaining({ a: { b: 1, c: 2 } })
      );
    });
  });

  describe('combining asymmetric matchers', () => {
    test('complex nested matching', () => {
      const response = {
        status: 200,
        data: {
          id: 12345,
          name: 'Test User',
          email: 'test@example.com',
          createdAt: new Date(),
          tags: ['admin', 'active'],
        },
      };

      expect(response).toEqual({
        status: expect.any(Number),
        data: expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          email: expect.stringContaining('@'),
          createdAt: expect.any(Date),
          tags: expect.arrayContaining(['admin']),
        }),
      });
    });
  });
});
