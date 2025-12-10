# Specifiche: node-test-expect

Jest-like assertion library per il native Node.js test runner (`node:test`).

---

## 1. Metadata Progetto

```yaml
name: node-test-expect
version: 1.0.0
description: Jest-like expect assertions for Node.js native test runner (node:test)
license: MIT
author: fracabu
keywords:
  - node
  - test
  - testing
  - expect
  - assertions
  - jest
  - node-test
  - native
  - typescript
  - matcher
engines:
  node: ">=20.0.0"
type: module
```

---

## 2. Analisi di Mercato

### 2.1 Il Gap

Node.js v20+ include `node:test` come test runner nativo, ma:
- Usa solo `node:assert` per le asserzioni
- Nessuna API `expect()` moderna
- Nessun matcher come `.toHaveBeenCalled()`, `.toContain()`, etc.
- Nessuna integrazione con i mock nativi di `node:test`

### 2.2 Competitor Esistenti

| Package | Downloads/week | Note |
|---------|----------------|------|
| `expect` (Jest) | 20M+ | Richiede Jest, non standalone |
| `chai` | 8M+ | Vecchio, non ottimizzato per node:test |
| `expect.js` | 500K | Abbandonato, no TypeScript |

**Nessuno** è progettato specificamente per `node:test`.

### 2.3 Differenziazione

| Feature | Jest expect | chai | **node-test-expect** |
|---------|-------------|------|---------------------|
| Zero dipendenze | ❌ | ❌ | ✅ |
| Usa node:assert internamente | ❌ | ❌ | ✅ |
| Integrazione node:test mocks | ❌ | ❌ | ✅ |
| TypeScript-first | ❌ | ❌ | ✅ |
| API Jest-compatibile | ✅ | ❌ | ✅ |
| Dimensione bundle | ~200KB | ~100KB | **<10KB** |

---

## 3. Struttura Directory

```
node-test-expect/
├── src/
│   ├── index.ts              # Entry point, export expect
│   ├── expect.ts             # Classe Expect principale
│   ├── matchers/
│   │   ├── index.ts          # Export tutti i matchers
│   │   ├── basic.ts          # toBe, toEqual, toBeDefined, etc.
│   │   ├── truthiness.ts     # toBeTruthy, toBeFalsy, toBeNull, etc.
│   │   ├── numbers.ts        # toBeGreaterThan, toBeCloseTo, etc.
│   │   ├── strings.ts        # toContain, toMatch, toHaveLength
│   │   ├── arrays.ts         # toContain, toHaveLength, toContainEqual
│   │   ├── objects.ts        # toHaveProperty, toMatchObject
│   │   ├── errors.ts         # toThrow, toThrowError
│   │   ├── promises.ts       # resolves, rejects
│   │   └── mocks.ts          # toHaveBeenCalled, toHaveBeenCalledWith
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Utility functions
├── test/
│   ├── basic.test.ts
│   ├── matchers.test.ts
│   ├── mocks.test.ts
│   ├── async.test.ts
│   └── typescript.test.ts
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── .github/
│   └── workflows/
│       └── ci.yml
├── README.md
├── LICENSE
└── CHANGELOG.md
```

---

## 4. API Design

### 4.1 Basic Usage

```typescript
import { expect } from 'node-test-expect'
import { test, mock } from 'node:test'

test('basic assertions', () => {
  // Equality
  expect(1 + 1).toBe(2)
  expect({ a: 1 }).toEqual({ a: 1 })

  // Truthiness
  expect(true).toBeTruthy()
  expect(null).toBeNull()
  expect(undefined).toBeUndefined()

  // Numbers
  expect(10).toBeGreaterThan(5)
  expect(0.1 + 0.2).toBeCloseTo(0.3)

  // Strings
  expect('hello world').toContain('world')
  expect('hello').toMatch(/ell/)

  // Arrays
  expect([1, 2, 3]).toContain(2)
  expect([1, 2, 3]).toHaveLength(3)

  // Objects
  expect({ a: 1, b: 2 }).toHaveProperty('a')
  expect({ a: 1, b: 2 }).toMatchObject({ a: 1 })
})
```

### 4.2 Negation with `.not`

```typescript
test('negation', () => {
  expect(1).not.toBe(2)
  expect('hello').not.toContain('world')
  expect([1, 2]).not.toHaveLength(3)
})
```

### 4.3 Mock Assertions (node:test integration)

```typescript
import { expect } from 'node-test-expect'
import { test, mock } from 'node:test'

test('mock assertions', () => {
  const mockFn = mock.fn()

  mockFn('hello', 123)
  mockFn('world')

  expect(mockFn).toHaveBeenCalled()
  expect(mockFn).toHaveBeenCalledTimes(2)
  expect(mockFn).toHaveBeenCalledWith('hello', 123)
  expect(mockFn).toHaveBeenLastCalledWith('world')
  expect(mockFn).toHaveBeenNthCalledWith(1, 'hello', 123)
})
```

### 4.4 Async Assertions

```typescript
test('async assertions', async () => {
  // Promises
  await expect(Promise.resolve(42)).resolves.toBe(42)
  await expect(Promise.reject(new Error('fail'))).rejects.toThrow('fail')

  // Async functions
  const asyncFn = async () => 'result'
  await expect(asyncFn()).resolves.toBe('result')
})
```

### 4.5 Error Assertions

```typescript
test('error assertions', () => {
  const throwError = () => { throw new Error('oops') }

  expect(throwError).toThrow()
  expect(throwError).toThrow('oops')
  expect(throwError).toThrow(Error)
  expect(throwError).toThrow(/oo/)
})
```

### 4.6 Custom Matchers (Estensibile)

```typescript
import { expect, addMatcher } from 'node-test-expect'

// Aggiungi matcher custom
addMatcher('toBeEven', (received: number) => {
  const pass = received % 2 === 0
  return {
    pass,
    message: () => `expected ${received} ${pass ? 'not ' : ''}to be even`
  }
})

// Uso
expect(4).toBeEven()
expect(3).not.toBeEven()
```

---

## 5. TypeScript Types

```typescript
// src/types.ts

export interface MatcherResult {
  pass: boolean
  message: () => string
}

export type CustomMatcher<T = unknown> = (
  received: T,
  ...args: unknown[]
) => MatcherResult

export interface Matchers<T> {
  // Basic
  toBe(expected: T): void
  toEqual(expected: T): void
  toStrictEqual(expected: T): void

  // Truthiness
  toBeTruthy(): void
  toBeFalsy(): void
  toBeNull(): void
  toBeUndefined(): void
  toBeDefined(): void
  toBeNaN(): void

  // Numbers
  toBeGreaterThan(expected: number): void
  toBeGreaterThanOrEqual(expected: number): void
  toBeLessThan(expected: number): void
  toBeLessThanOrEqual(expected: number): void
  toBeCloseTo(expected: number, precision?: number): void

  // Strings
  toContain(expected: string): void
  toMatch(expected: string | RegExp): void
  toHaveLength(expected: number): void

  // Arrays
  toContain(expected: unknown): void
  toContainEqual(expected: unknown): void
  toHaveLength(expected: number): void

  // Objects
  toHaveProperty(path: string | string[], value?: unknown): void
  toMatchObject(expected: object): void
  toBeInstanceOf(expected: Function): void

  // Errors
  toThrow(expected?: string | RegExp | Error | Function): void
  toThrowError(expected?: string | RegExp | Error | Function): void

  // Negation
  not: Matchers<T>
}

export interface AsyncMatchers<T> {
  resolves: Matchers<Awaited<T>>
  rejects: Matchers<unknown>
}

export interface MockMatchers {
  toHaveBeenCalled(): void
  toHaveBeenCalledTimes(times: number): void
  toHaveBeenCalledWith(...args: unknown[]): void
  toHaveBeenLastCalledWith(...args: unknown[]): void
  toHaveBeenNthCalledWith(n: number, ...args: unknown[]): void
  toHaveReturned(): void
  toHaveReturnedTimes(times: number): void
  toHaveReturnedWith(expected: unknown): void
  toHaveLastReturnedWith(expected: unknown): void

  not: MockMatchers
}

export interface Expect {
  <T>(received: T): Matchers<T> & AsyncMatchers<T> & MockMatchers

  // Utility methods
  anything(): unknown
  any(constructor: Function): unknown
  arrayContaining(expected: unknown[]): unknown
  objectContaining(expected: object): unknown
  stringContaining(expected: string): unknown
  stringMatching(expected: string | RegExp): unknown
}

// Augmentation per custom matchers
declare global {
  namespace NodeTestExpect {
    interface CustomMatchers<T> {}
  }
}
```

---

## 6. Implementazione Core

### 6.1 Entry Point

```typescript
// src/index.ts

export { expect } from './expect.js'
export { addMatcher } from './matchers/index.js'
export type { Expect, Matchers, MatcherResult, CustomMatcher } from './types.js'
```

### 6.2 Expect Class

```typescript
// src/expect.ts

import assert from 'node:assert'
import { createMatchers } from './matchers/index.js'
import type { Matchers, MockMatchers, AsyncMatchers } from './types.js'

class Expectation<T> {
  private received: T
  private isNot: boolean = false

  constructor(received: T) {
    this.received = received
  }

  get not(): this {
    this.isNot = !this.isNot
    return this
  }

  get resolves(): Expectation<Awaited<T>> {
    return new AsyncExpectation(this.received as Promise<unknown>, 'resolves') as any
  }

  get rejects(): Expectation<unknown> {
    return new AsyncExpectation(this.received as Promise<unknown>, 'rejects') as any
  }

  // === Basic Matchers ===

  toBe(expected: T): void {
    const pass = Object.is(this.received, expected)
    this.assert(pass, () =>
      `expected ${this.format(this.received)} to${this.isNot ? ' not' : ''} be ${this.format(expected)}`
    )
  }

  toEqual(expected: T): void {
    try {
      assert.deepStrictEqual(this.received, expected)
      this.assert(true, () => '')
    } catch {
      this.assert(false, () =>
        `expected ${this.format(this.received)} to${this.isNot ? ' not' : ''} equal ${this.format(expected)}`
      )
    }
  }

  toStrictEqual(expected: T): void {
    this.toEqual(expected)
  }

  // === Truthiness ===

  toBeTruthy(): void {
    this.assert(!!this.received, () =>
      `expected ${this.format(this.received)} to${this.isNot ? ' not' : ''} be truthy`
    )
  }

  toBeFalsy(): void {
    this.assert(!this.received, () =>
      `expected ${this.format(this.received)} to${this.isNot ? ' not' : ''} be falsy`
    )
  }

  toBeNull(): void {
    this.assert(this.received === null, () =>
      `expected ${this.format(this.received)} to${this.isNot ? ' not' : ''} be null`
    )
  }

  toBeUndefined(): void {
    this.assert(this.received === undefined, () =>
      `expected ${this.format(this.received)} to${this.isNot ? ' not' : ''} be undefined`
    )
  }

  toBeDefined(): void {
    this.assert(this.received !== undefined, () =>
      `expected ${this.format(this.received)} to${this.isNot ? ' not' : ''} be defined`
    )
  }

  toBeNaN(): void {
    this.assert(Number.isNaN(this.received), () =>
      `expected ${this.format(this.received)} to${this.isNot ? ' not' : ''} be NaN`
    )
  }

  // === Numbers ===

  toBeGreaterThan(expected: number): void {
    this.assert((this.received as number) > expected, () =>
      `expected ${this.received} to${this.isNot ? ' not' : ''} be greater than ${expected}`
    )
  }

  toBeGreaterThanOrEqual(expected: number): void {
    this.assert((this.received as number) >= expected, () =>
      `expected ${this.received} to${this.isNot ? ' not' : ''} be greater than or equal to ${expected}`
    )
  }

  toBeLessThan(expected: number): void {
    this.assert((this.received as number) < expected, () =>
      `expected ${this.received} to${this.isNot ? ' not' : ''} be less than ${expected}`
    )
  }

  toBeLessThanOrEqual(expected: number): void {
    this.assert((this.received as number) <= expected, () =>
      `expected ${this.received} to${this.isNot ? ' not' : ''} be less than or equal to ${expected}`
    )
  }

  toBeCloseTo(expected: number, precision: number = 2): void {
    const diff = Math.abs((this.received as number) - expected)
    const pass = diff < Math.pow(10, -precision) / 2
    this.assert(pass, () =>
      `expected ${this.received} to${this.isNot ? ' not' : ''} be close to ${expected} (precision: ${precision})`
    )
  }

  // === Strings & Arrays ===

  toContain(expected: unknown): void {
    const received = this.received as string | unknown[]
    const pass = typeof received === 'string'
      ? received.includes(expected as string)
      : received.includes(expected)
    this.assert(pass, () =>
      `expected ${this.format(this.received)} to${this.isNot ? ' not' : ''} contain ${this.format(expected)}`
    )
  }

  toMatch(expected: string | RegExp): void {
    const regex = typeof expected === 'string' ? new RegExp(expected) : expected
    this.assert(regex.test(this.received as string), () =>
      `expected "${this.received}" to${this.isNot ? ' not' : ''} match ${expected}`
    )
  }

  toHaveLength(expected: number): void {
    const received = this.received as { length: number }
    this.assert(received.length === expected, () =>
      `expected ${this.format(this.received)} to${this.isNot ? ' not' : ''} have length ${expected}, got ${received.length}`
    )
  }

  toContainEqual(expected: unknown): void {
    const received = this.received as unknown[]
    let pass = false
    for (const item of received) {
      try {
        assert.deepStrictEqual(item, expected)
        pass = true
        break
      } catch {}
    }
    this.assert(pass, () =>
      `expected ${this.format(this.received)} to${this.isNot ? ' not' : ''} contain equal ${this.format(expected)}`
    )
  }

  // === Objects ===

  toHaveProperty(path: string | string[], value?: unknown): void {
    const keys = Array.isArray(path) ? path : path.split('.')
    let current: unknown = this.received
    let exists = true

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key]
      } else {
        exists = false
        break
      }
    }

    const pass = exists && (arguments.length === 1 || this.deepEqual(current, value))
    this.assert(pass, () =>
      `expected ${this.format(this.received)} to${this.isNot ? ' not' : ''} have property "${Array.isArray(path) ? path.join('.') : path}"${arguments.length > 1 ? ` with value ${this.format(value)}` : ''}`
    )
  }

  toMatchObject(expected: object): void {
    const pass = this.objectContains(this.received as object, expected)
    this.assert(pass, () =>
      `expected ${this.format(this.received)} to${this.isNot ? ' not' : ''} match object ${this.format(expected)}`
    )
  }

  toBeInstanceOf(expected: Function): void {
    this.assert(this.received instanceof expected, () =>
      `expected ${this.format(this.received)} to${this.isNot ? ' not' : ''} be instance of ${expected.name}`
    )
  }

  // === Errors ===

  toThrow(expected?: string | RegExp | Error | Function): void {
    if (typeof this.received !== 'function') {
      throw new Error('toThrow() requires a function')
    }

    let threw = false
    let error: Error | undefined

    try {
      (this.received as Function)()
    } catch (e) {
      threw = true
      error = e as Error
    }

    let pass = threw

    if (threw && expected !== undefined) {
      if (typeof expected === 'string') {
        pass = error!.message.includes(expected)
      } else if (expected instanceof RegExp) {
        pass = expected.test(error!.message)
      } else if (typeof expected === 'function') {
        pass = error instanceof expected
      } else if (expected instanceof Error) {
        pass = error!.message === expected.message
      }
    }

    this.assert(pass, () =>
      threw
        ? `expected function to${this.isNot ? ' not' : ''} throw ${expected ? this.format(expected) : ''}`
        : `expected function to throw`
    )
  }

  toThrowError(expected?: string | RegExp | Error | Function): void {
    this.toThrow(expected)
  }

  // === Mock Matchers (node:test integration) ===

  toHaveBeenCalled(): void {
    const mock = this.getMock()
    this.assert(mock.calls.length > 0, () =>
      `expected mock to${this.isNot ? ' not' : ''} have been called`
    )
  }

  toHaveBeenCalledTimes(times: number): void {
    const mock = this.getMock()
    this.assert(mock.calls.length === times, () =>
      `expected mock to${this.isNot ? ' not' : ''} have been called ${times} times, got ${mock.calls.length}`
    )
  }

  toHaveBeenCalledWith(...args: unknown[]): void {
    const mock = this.getMock()
    const pass = mock.calls.some((call: { arguments: unknown[] }) =>
      this.deepEqual(call.arguments, args)
    )
    this.assert(pass, () =>
      `expected mock to${this.isNot ? ' not' : ''} have been called with ${this.format(args)}`
    )
  }

  toHaveBeenLastCalledWith(...args: unknown[]): void {
    const mock = this.getMock()
    const lastCall = mock.calls[mock.calls.length - 1]
    const pass = lastCall && this.deepEqual(lastCall.arguments, args)
    this.assert(pass, () =>
      `expected mock to${this.isNot ? ' not' : ''} have been last called with ${this.format(args)}`
    )
  }

  toHaveBeenNthCalledWith(n: number, ...args: unknown[]): void {
    const mock = this.getMock()
    const nthCall = mock.calls[n - 1]
    const pass = nthCall && this.deepEqual(nthCall.arguments, args)
    this.assert(pass, () =>
      `expected mock to${this.isNot ? ' not' : ''} have been called on call ${n} with ${this.format(args)}`
    )
  }

  toHaveReturned(): void {
    const mock = this.getMock()
    const pass = mock.calls.some((call: { result: unknown }) => call.result !== undefined)
    this.assert(pass, () =>
      `expected mock to${this.isNot ? ' not' : ''} have returned`
    )
  }

  toHaveReturnedTimes(times: number): void {
    const mock = this.getMock()
    const returned = mock.calls.filter((call: { result: unknown }) => call.result !== undefined).length
    this.assert(returned === times, () =>
      `expected mock to${this.isNot ? ' not' : ''} have returned ${times} times, got ${returned}`
    )
  }

  toHaveReturnedWith(expected: unknown): void {
    const mock = this.getMock()
    const pass = mock.calls.some((call: { result: unknown }) =>
      this.deepEqual(call.result, expected)
    )
    this.assert(pass, () =>
      `expected mock to${this.isNot ? ' not' : ''} have returned with ${this.format(expected)}`
    )
  }

  toHaveLastReturnedWith(expected: unknown): void {
    const mock = this.getMock()
    const lastCall = mock.calls[mock.calls.length - 1]
    const pass = lastCall && this.deepEqual(lastCall.result, expected)
    this.assert(pass, () =>
      `expected mock to${this.isNot ? ' not' : ''} have last returned with ${this.format(expected)}`
    )
  }

  // === Private Helpers ===

  private assert(pass: boolean, message: () => string): void {
    const finalPass = this.isNot ? !pass : pass
    if (!finalPass) {
      throw new assert.AssertionError({ message: message() })
    }
  }

  private format(value: unknown): string {
    if (typeof value === 'string') return `"${value}"`
    if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }

  private deepEqual(a: unknown, b: unknown): boolean {
    try {
      assert.deepStrictEqual(a, b)
      return true
    } catch {
      return false
    }
  }

  private objectContains(received: object, expected: object): boolean {
    for (const key of Object.keys(expected)) {
      if (!(key in received)) return false
      const recVal = (received as Record<string, unknown>)[key]
      const expVal = (expected as Record<string, unknown>)[key]
      if (typeof expVal === 'object' && expVal !== null) {
        if (!this.objectContains(recVal as object, expVal)) return false
      } else if (!this.deepEqual(recVal, expVal)) {
        return false
      }
    }
    return true
  }

  private getMock(): { calls: Array<{ arguments: unknown[]; result: unknown }> } {
    const fn = this.received as any
    if (!fn?.mock?.calls) {
      throw new Error('Expected a mock function created with node:test mock.fn()')
    }
    return fn.mock
  }
}

class AsyncExpectation<T> extends Expectation<T> {
  private promise: Promise<unknown>
  private type: 'resolves' | 'rejects'

  constructor(promise: Promise<unknown>, type: 'resolves' | 'rejects') {
    super(undefined as T)
    this.promise = promise
    this.type = type
  }

  // Override all matchers to be async
  async toBe(expected: T): Promise<void> {
    const value = await this.getValue()
    return super.toBe.call({ ...this, received: value }, expected)
  }

  // ... altri override async

  private async getValue(): Promise<unknown> {
    if (this.type === 'resolves') {
      return this.promise
    } else {
      try {
        await this.promise
        throw new Error('Expected promise to reject')
      } catch (e) {
        return e
      }
    }
  }
}

export function expect<T>(received: T): Expectation<T> {
  return new Expectation(received)
}

// Utility matchers
expect.anything = () => Symbol.for('expect.anything')
expect.any = (constructor: Function) => ({ $$type: 'expect.any', constructor })
expect.arrayContaining = (arr: unknown[]) => ({ $$type: 'expect.arrayContaining', value: arr })
expect.objectContaining = (obj: object) => ({ $$type: 'expect.objectContaining', value: obj })
expect.stringContaining = (str: string) => ({ $$type: 'expect.stringContaining', value: str })
expect.stringMatching = (pattern: string | RegExp) => ({ $$type: 'expect.stringMatching', value: pattern })
```

---

## 7. Configurazione Build

### 7.1 package.json

```json
{
  "name": "node-test-expect",
  "version": "1.0.0",
  "description": "Jest-like expect assertions for Node.js native test runner (node:test)",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup",
    "test": "node --import tsx --test test/**/*.test.ts",
    "test:coverage": "node --import tsx --test --experimental-test-coverage test/**/*.test.ts",
    "lint": "eslint src test",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm test"
  },
  "keywords": [
    "node",
    "test",
    "testing",
    "expect",
    "assertions",
    "jest",
    "node-test",
    "native",
    "typescript",
    "matcher"
  ],
  "author": "fracabu",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/fracabu/node-test-expect.git"
  },
  "bugs": {
    "url": "https://github.com/fracabu/node-test-expect/issues"
  },
  "homepage": "https://github.com/fracabu/node-test-expect#readme",
  "engines": {
    "node": ">=20.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsup": "^8.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.6.0"
  }
}
```

### 7.2 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

### 7.3 tsup.config.ts

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node20',
  minify: false // Keep readable for debugging
})
```

### 7.4 GitHub Actions CI

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x, 22.x]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - run: npm ci
      - run: npm run build
      - run: npm run typecheck
      - run: npm test

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22.x'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm run build
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        continue-on-error: true
```

---

## 8. Test Cases

### 8.1 Basic Matchers

```typescript
// test/basic.test.ts

import { test, describe } from 'node:test'
import { expect } from '../src/index.js'

describe('basic matchers', () => {
  test('toBe', () => {
    expect(1).toBe(1)
    expect('hello').toBe('hello')
    expect(true).toBe(true)
    expect(null).toBe(null)

    // Objects - same reference
    const obj = { a: 1 }
    expect(obj).toBe(obj)
  })

  test('toBe with not', () => {
    expect(1).not.toBe(2)
    expect('hello').not.toBe('world')
  })

  test('toEqual', () => {
    expect({ a: 1 }).toEqual({ a: 1 })
    expect([1, 2, 3]).toEqual([1, 2, 3])
    expect({ a: { b: 2 } }).toEqual({ a: { b: 2 } })
  })

  test('toEqual with not', () => {
    expect({ a: 1 }).not.toEqual({ a: 2 })
  })
})

describe('truthiness', () => {
  test('toBeTruthy', () => {
    expect(true).toBeTruthy()
    expect(1).toBeTruthy()
    expect('hello').toBeTruthy()
    expect({}).toBeTruthy()
  })

  test('toBeFalsy', () => {
    expect(false).toBeFalsy()
    expect(0).toBeFalsy()
    expect('').toBeFalsy()
    expect(null).toBeFalsy()
    expect(undefined).toBeFalsy()
  })

  test('toBeNull', () => {
    expect(null).toBeNull()
    expect(undefined).not.toBeNull()
  })

  test('toBeUndefined', () => {
    expect(undefined).toBeUndefined()
    expect(null).not.toBeUndefined()
  })

  test('toBeDefined', () => {
    expect(1).toBeDefined()
    expect(null).toBeDefined()
    expect(undefined).not.toBeDefined()
  })
})

describe('numbers', () => {
  test('toBeGreaterThan', () => {
    expect(10).toBeGreaterThan(5)
    expect(5).not.toBeGreaterThan(10)
  })

  test('toBeLessThan', () => {
    expect(5).toBeLessThan(10)
  })

  test('toBeCloseTo', () => {
    expect(0.1 + 0.2).toBeCloseTo(0.3)
    expect(0.1 + 0.2).toBeCloseTo(0.3, 5)
  })
})

describe('strings', () => {
  test('toContain', () => {
    expect('hello world').toContain('world')
    expect('hello').not.toContain('world')
  })

  test('toMatch', () => {
    expect('hello world').toMatch(/world/)
    expect('hello world').toMatch('world')
  })

  test('toHaveLength', () => {
    expect('hello').toHaveLength(5)
    expect([1, 2, 3]).toHaveLength(3)
  })
})

describe('objects', () => {
  test('toHaveProperty', () => {
    expect({ a: 1 }).toHaveProperty('a')
    expect({ a: 1 }).toHaveProperty('a', 1)
    expect({ a: { b: 2 } }).toHaveProperty('a.b')
    expect({ a: { b: 2 } }).toHaveProperty(['a', 'b'], 2)
  })

  test('toMatchObject', () => {
    expect({ a: 1, b: 2 }).toMatchObject({ a: 1 })
    expect({ a: { b: 2, c: 3 } }).toMatchObject({ a: { b: 2 } })
  })

  test('toBeInstanceOf', () => {
    expect(new Error()).toBeInstanceOf(Error)
    expect([]).toBeInstanceOf(Array)
  })
})
```

### 8.2 Mock Tests

```typescript
// test/mocks.test.ts

import { test, describe, mock } from 'node:test'
import { expect } from '../src/index.js'

describe('mock matchers', () => {
  test('toHaveBeenCalled', () => {
    const fn = mock.fn()
    fn()
    expect(fn).toHaveBeenCalled()
  })

  test('toHaveBeenCalledTimes', () => {
    const fn = mock.fn()
    fn()
    fn()
    fn()
    expect(fn).toHaveBeenCalledTimes(3)
  })

  test('toHaveBeenCalledWith', () => {
    const fn = mock.fn()
    fn('hello', 123)
    fn('world')

    expect(fn).toHaveBeenCalledWith('hello', 123)
    expect(fn).toHaveBeenCalledWith('world')
  })

  test('toHaveBeenLastCalledWith', () => {
    const fn = mock.fn()
    fn('first')
    fn('second')
    fn('last')

    expect(fn).toHaveBeenLastCalledWith('last')
  })

  test('toHaveBeenNthCalledWith', () => {
    const fn = mock.fn()
    fn('first')
    fn('second')
    fn('third')

    expect(fn).toHaveBeenNthCalledWith(1, 'first')
    expect(fn).toHaveBeenNthCalledWith(2, 'second')
    expect(fn).toHaveBeenNthCalledWith(3, 'third')
  })

  test('not.toHaveBeenCalled', () => {
    const fn = mock.fn()
    expect(fn).not.toHaveBeenCalled()
  })
})
```

### 8.3 Async Tests

```typescript
// test/async.test.ts

import { test, describe } from 'node:test'
import { expect } from '../src/index.js'

describe('async matchers', () => {
  test('resolves.toBe', async () => {
    await expect(Promise.resolve(42)).resolves.toBe(42)
  })

  test('resolves.toEqual', async () => {
    await expect(Promise.resolve({ a: 1 })).resolves.toEqual({ a: 1 })
  })

  test('rejects.toThrow', async () => {
    await expect(Promise.reject(new Error('fail'))).rejects.toThrow('fail')
  })

  test('rejects.toBeInstanceOf', async () => {
    await expect(Promise.reject(new TypeError('oops'))).rejects.toBeInstanceOf(TypeError)
  })
})
```

### 8.4 Error Tests

```typescript
// test/errors.test.ts

import { test, describe } from 'node:test'
import { expect } from '../src/index.js'

describe('error matchers', () => {
  test('toThrow', () => {
    const throwFn = () => { throw new Error('oops') }
    expect(throwFn).toThrow()
    expect(throwFn).toThrow('oops')
    expect(throwFn).toThrow(Error)
    expect(throwFn).toThrow(/oo/)
  })

  test('not.toThrow', () => {
    const noThrow = () => 'ok'
    expect(noThrow).not.toThrow()
  })

  test('toThrow with specific error', () => {
    class CustomError extends Error {}
    const throwCustom = () => { throw new CustomError('custom') }
    expect(throwCustom).toThrow(CustomError)
  })
})
```

---

## 9. README.md

```markdown
# node-test-expect

[![npm version](https://img.shields.io/npm/v/node-test-expect.svg)](https://www.npmjs.com/package/node-test-expect)
[![CI](https://github.com/fracabu/node-test-expect/actions/workflows/ci.yml/badge.svg)](https://github.com/fracabu/node-test-expect/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Jest-like `expect` assertions for Node.js native test runner (`node:test`).

## Why?

Node.js v20+ includes a native test runner, but:
- Only provides basic `node:assert`
- No `expect()` API
- No Jest-like matchers
- No mock assertion helpers

**node-test-expect** fills this gap with:
- Zero dependencies
- Full TypeScript support
- Jest-compatible API
- Native `node:test` mock integration
- Tiny bundle size (<10KB)

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
- `toBe(value)` - Strict equality (===)
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
- `toContain(item)`
- `toContainEqual(item)`
- `toMatch(regexp)`
- `toHaveLength(number)`

### Objects
- `toHaveProperty(path, value?)`
- `toMatchObject(object)`
- `toBeInstanceOf(Class)`

### Errors
- `toThrow(message?)`
- `toThrowError(message?)`

### Mocks (node:test)
- `toHaveBeenCalled()`
- `toHaveBeenCalledTimes(number)`
- `toHaveBeenCalledWith(...args)`
- `toHaveBeenLastCalledWith(...args)`
- `toHaveBeenNthCalledWith(n, ...args)`

### Async
- `resolves.toBe()` / `resolves.toEqual()` / etc.
- `rejects.toThrow()` / `rejects.toBeInstanceOf()` / etc.

### Negation
All matchers support `.not`:

```typescript
expect(1).not.toBe(2)
expect([]).not.toContain('x')
```

## License

MIT
```

---

## 10. Checklist Pre-Pubblicazione

- [ ] Implementazione tutti i matchers
- [ ] TypeScript types completi e testati
- [ ] Test coverage > 90%
- [ ] Integrazione mock node:test verificata
- [ ] README con esempi
- [ ] CI/CD GitHub Actions
- [ ] npm publish con --dry-run
- [ ] Benchmark vs chai (dimensione bundle)

---

## 11. Roadmap Post-v1.0

### v1.1
- Snapshot testing (`toMatchSnapshot()`)
- Custom matchers registration API
- Better error diff output

### v1.2
- Asymmetric matchers (`expect.any()`, `expect.anything()`)
- Table-driven test helpers
- IDE plugin per autocomplete

---

*Ultimo aggiornamento: 10 Dicembre 2025*
