import { test, describe, mock } from 'node:test';
import { expect } from '../src/index.js';

describe('mock matchers', () => {
  test('toHaveBeenCalled', () => {
    const fn = mock.fn();
    expect(fn).not.toHaveBeenCalled();

    fn();
    expect(fn).toHaveBeenCalled();
  });

  test('toHaveBeenCalledTimes', () => {
    const fn = mock.fn();
    expect(fn).toHaveBeenCalledTimes(0);

    fn();
    expect(fn).toHaveBeenCalledTimes(1);

    fn();
    fn();
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('toHaveBeenCalledTimes with not', () => {
    const fn = mock.fn();
    fn();
    fn();

    expect(fn).not.toHaveBeenCalledTimes(1);
    expect(fn).not.toHaveBeenCalledTimes(3);
  });

  test('toHaveBeenCalledWith', () => {
    const fn = mock.fn();
    fn('hello', 123);
    fn('world');

    expect(fn).toHaveBeenCalledWith('hello', 123);
    expect(fn).toHaveBeenCalledWith('world');
    expect(fn).not.toHaveBeenCalledWith('foo');
    expect(fn).not.toHaveBeenCalledWith('hello', 456);
  });

  test('toHaveBeenCalledWith - deep equality', () => {
    const fn = mock.fn();
    fn({ a: 1 }, [1, 2, 3]);

    expect(fn).toHaveBeenCalledWith({ a: 1 }, [1, 2, 3]);
    expect(fn).not.toHaveBeenCalledWith({ a: 2 }, [1, 2, 3]);
  });

  test('toHaveBeenLastCalledWith', () => {
    const fn = mock.fn();
    fn('first');
    fn('second');
    fn('last');

    expect(fn).toHaveBeenLastCalledWith('last');
    expect(fn).not.toHaveBeenLastCalledWith('first');
    expect(fn).not.toHaveBeenLastCalledWith('second');
  });

  test('toHaveBeenNthCalledWith', () => {
    const fn = mock.fn();
    fn('first');
    fn('second');
    fn('third');

    expect(fn).toHaveBeenNthCalledWith(1, 'first');
    expect(fn).toHaveBeenNthCalledWith(2, 'second');
    expect(fn).toHaveBeenNthCalledWith(3, 'third');

    expect(fn).not.toHaveBeenNthCalledWith(1, 'second');
    expect(fn).not.toHaveBeenNthCalledWith(2, 'first');
  });

  test('toHaveReturned', () => {
    const fn = mock.fn(() => 'result');
    fn();

    expect(fn).toHaveReturned();
  });

  test('toHaveReturned with not (function throws)', () => {
    const fn = mock.fn(() => {
      throw new Error('error');
    });

    try {
      fn();
    } catch {
      // ignore
    }

    expect(fn).not.toHaveReturned();
  });

  test('toHaveReturnedTimes', () => {
    const fn = mock.fn(() => 'result');
    fn();
    fn();

    expect(fn).toHaveReturnedTimes(2);
    expect(fn).not.toHaveReturnedTimes(1);
  });

  test('toHaveReturnedWith', () => {
    const fn = mock.fn((x: number) => x * 2);
    fn(5);
    fn(10);

    expect(fn).toHaveReturnedWith(10);
    expect(fn).toHaveReturnedWith(20);
    expect(fn).not.toHaveReturnedWith(15);
  });

  test('toHaveLastReturnedWith', () => {
    const fn = mock.fn((x: number) => x * 2);
    fn(5);
    fn(10);

    expect(fn).toHaveLastReturnedWith(20);
    expect(fn).not.toHaveLastReturnedWith(10);
  });

  test('throws when not a mock function', () => {
    const regularFn = (): void => {};

    let threw = false;
    try {
      expect(regularFn).toHaveBeenCalled();
    } catch (e) {
      threw = true;
      expect((e as Error).message).toContain('mock function');
    }
    expect(threw).toBe(true);
  });
});
