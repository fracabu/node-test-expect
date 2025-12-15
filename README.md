<h1 align="center">node-test-expect</h1>
<h3 align="center">Jest-like expect assertions for Node.js native test runner</h3>

<p align="center">
  <em>Zero dependencies, full TypeScript support</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/node-test-expect"><img src="https://img.shields.io/npm/v/node-test-expect.svg" alt="npm version" /></a>
  <img src="https://img.shields.io/badge/Node.js-20%2B-green.svg" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
</p>

<p align="center">
  :gb: <a href="#english">English</a> | :it: <a href="#italiano">Italiano</a>
</p>

---

## Overview

<!-- ![node-test-expect Overview](assets/test-expect-overview.png) -->

---

<a name="english"></a>
## :gb: English

### Why node-test-expect?

Node.js v20+ has a native test runner, but:
- Only provides basic `node:assert`
- No `expect()` API
- No Jest-like matchers

**node-test-expect** provides:
- Zero dependencies (uses `node:assert` internally)
- Full TypeScript support
- Jest-compatible API
- Native `node:test` mock integration

### Install

```bash
npm install node-test-expect
```

### Usage

```typescript
import { expect } from 'node-test-expect'
import { test, mock } from 'node:test'

test('basic assertions', () => {
  expect(1 + 1).toBe(2)
  expect({ a: 1 }).toEqual({ a: 1 })
  expect('hello').toContain('ell')
})

test('mock assertions', () => {
  const fn = mock.fn()
  fn('hello')
  expect(fn).toHaveBeenCalledWith('hello')
})

test('async', async () => {
  await expect(Promise.resolve(42)).resolves.toBe(42)
})
```

### Available Matchers

**Basic**: `toBe`, `toEqual`, `toStrictEqual`
**Truthiness**: `toBeTruthy`, `toBeFalsy`, `toBeNull`, `toBeUndefined`
**Numbers**: `toBeGreaterThan`, `toBeLessThan`, `toBeCloseTo`
**Strings/Arrays**: `toContain`, `toMatch`, `toHaveLength`
**Objects**: `toHaveProperty`, `toMatchObject`, `toBeInstanceOf`
**Mocks**: `toHaveBeenCalled`, `toHaveBeenCalledWith`, `toHaveBeenCalledTimes`

---

<a name="italiano"></a>
## :it: Italiano

### Perche node-test-expect?

Node.js v20+ ha un test runner nativo, ma:
- Fornisce solo `node:assert` base
- Nessuna API `expect()`
- Nessun matcher stile Jest

**node-test-expect** fornisce:
- Zero dipendenze (usa `node:assert` internamente)
- Supporto TypeScript completo
- API compatibile Jest
- Integrazione mock `node:test` nativa

### Installazione

```bash
npm install node-test-expect
```

### Utilizzo

```typescript
import { expect } from 'node-test-expect'
import { test, mock } from 'node:test'

test('asserzioni base', () => {
  expect(1 + 1).toBe(2)
  expect({ a: 1 }).toEqual({ a: 1 })
  expect('ciao').toContain('ia')
})

test('asserzioni mock', () => {
  const fn = mock.fn()
  fn('ciao')
  expect(fn).toHaveBeenCalledWith('ciao')
})
```

### Asymmetric Matchers

```typescript
expect({ name: 'John', age: 30 }).toEqual({
  name: expect.any(String),
  age: expect.any(Number)
})

expect('hello world').toEqual(expect.stringContaining('world'))
expect([1, 2, 3]).toEqual(expect.arrayContaining([1, 2]))
```

---

## Requirements

- Node.js >= 20.0.0

## License

MIT

---

<p align="center">
  <a href="https://github.com/fracabu">
    <img src="https://img.shields.io/badge/Made_by-fracabu-8B5CF6?style=flat-square" alt="Made by fracabu" />
  </a>
</p>
