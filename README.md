# node-test-expect

[![npm version](https://img.shields.io/npm/v/node-test-expect.svg)](https://www.npmjs.com/package/node-test-expect)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Jest-like `expect` assertions for Node.js native test runner (`node:test`).

## Why?

Node.js v20+ includes a native test runner, but:
- Only provides basic `node:assert`
- No `expect()` API
- No Jest-like matchers
- No mock assertion helpers

**node-test-expect** fills this gap with:
- **Zero dependencies** - uses `node:assert` internally
- **Full TypeScript support** - written in TypeScript, ships with types
- **Jest-compatible API** - familiar syntax for Jest users
- **Native `node:test` mock integration** - works with `mock.fn()`
- **Tiny bundle size** - ~23KB (unminified)

## Installation

```bash
npm install node-test-expect
```

## Usage

```typescript
import { expect } from 'node-test-expect'
import { test, mock } from 'node:test'

test('basic assertions', () => {
  expect(1 + 1).toBe(2)
  expect({ a: 1 }).toEqual({ a: 1 })
  expect('hello').toContain('ell')
  expect([1, 2, 3]).toHaveLength(3)
})

test('mock assertions', () => {
  const fn = mock.fn()
  fn('hello')

  expect(fn).toHaveBeenCalled()
  expect(fn).toHaveBeenCalledWith('hello')
})

test('async assertions', async () => {
  await expect(Promise.resolve(42)).resolves.toBe(42)
  await expect(Promise.reject(new Error('fail'))).rejects.toThrow('fail')
})
```

## Available Matchers

### Basic
- `toBe(value)` - Strict equality (`Object.is`)
- `toEqual(value)` - Deep equality
- `toStrictEqual(value)` - Strict deep equality

### Truthiness
- `toBeTruthy()`
- `toBeFalsy()`
- `toBeNull()`
- `toBeUndefined()`
- `toBeDefined()`
- `toBeNaN()`

### Numbers
- `toBeGreaterThan(number)`
- `toBeGreaterThanOrEqual(number)`
- `toBeLessThan(number)`
- `toBeLessThanOrEqual(number)`
- `toBeCloseTo(number, precision?)`

### Strings & Arrays
- `toContain(item)` - Check if string/array contains item
- `toContainEqual(item)` - Check if array contains item (deep equality)
- `toMatch(regexp)` - Check if string matches pattern
- `toHaveLength(number)`

### Objects
- `toHaveProperty(path, value?)` - Check property existence/value
- `toMatchObject(object)` - Partial object match
- `toBeInstanceOf(Class)`

### Errors
- `toThrow(message?)` - Check if function throws
- `toThrowError(message?)` - Alias for toThrow

### Mocks (node:test)
- `toHaveBeenCalled()`
- `toHaveBeenCalledTimes(number)`
- `toHaveBeenCalledWith(...args)`
- `toHaveBeenLastCalledWith(...args)`
- `toHaveBeenNthCalledWith(n, ...args)`
- `toHaveReturned()`
- `toHaveReturnedTimes(number)`
- `toHaveReturnedWith(value)`
- `toHaveLastReturnedWith(value)`

### Async
- `resolves.toBe()` / `resolves.toEqual()` / etc.
- `rejects.toThrow()` / `rejects.toBeInstanceOf()` / etc.

### Negation
All matchers support `.not`:

```typescript
expect(1).not.toBe(2)
expect([]).not.toContain('x')
```

## Asymmetric Matchers

```typescript
expect({ name: 'John', age: 30 }).toEqual({
  name: expect.any(String),
  age: expect.any(Number),
})

expect('hello world').toEqual(expect.stringContaining('world'))
expect([1, 2, 3]).toEqual(expect.arrayContaining([1, 2]))
expect({ a: 1, b: 2 }).toEqual(expect.objectContaining({ a: 1 }))
expect('test@example.com').toEqual(expect.stringMatching(/@/))
expect(42).toEqual(expect.anything())
```

## Requirements

- Node.js >= 20.0.0

## License

MIT

