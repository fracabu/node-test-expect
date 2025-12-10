# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

node-test-expect is a Jest-like assertion library for Node.js native test runner (`node:test`). It provides an `expect()` API with matchers that integrate with `node:assert` internally and support `node:test` mocks.

**Key differentiators:**
- Zero dependencies
- Uses `node:assert` internally
- Native `node:test` mock integration (`.toHaveBeenCalled()`, etc.)
- TypeScript-first, ESM-only
- Target bundle size: <10KB

## Build & Development Commands

```bash
npm run build          # Build with tsup (ESM output)
npm run test           # Run tests with node:test via tsx
npm run test:coverage  # Run tests with coverage
npm run lint           # ESLint (flat config)
npm run typecheck      # TypeScript type checking
npm run prepublishOnly # Build + test before publish
```

**Run a single test file:**
```bash
node --import tsx --test test/basic.test.ts
```

## Architecture

```
src/
├── index.ts          # Entry point, exports expect
├── expect.ts         # Expectation class with all matchers
├── matchers/         # Matcher implementations by category
│   ├── basic.ts      # toBe, toEqual, toStrictEqual
│   ├── truthiness.ts # toBeTruthy, toBeFalsy, toBeNull, etc.
│   ├── numbers.ts    # toBeGreaterThan, toBeCloseTo, etc.
│   ├── strings.ts    # toContain, toMatch, toHaveLength
│   ├── arrays.ts     # toContain, toContainEqual, toHaveLength
│   ├── objects.ts    # toHaveProperty, toMatchObject
│   ├── errors.ts     # toThrow, toThrowError
│   ├── promises.ts   # resolves, rejects
│   └── mocks.ts      # toHaveBeenCalled, toHaveBeenCalledWith, etc.
├── types.ts          # TypeScript types + global augmentation
└── utils.ts          # Utility functions
```

**Core pattern:** The `Expectation<T>` class wraps received values and provides matcher methods. Each matcher calls a private `assert()` method that respects the `isNot` flag for negation.

**Mock integration:** Mock matchers access `fn.mock.calls` from `node:test` mock functions to verify call history.

**Async pattern:** `AsyncExpectation` extends `Expectation` to handle `resolves`/`rejects` by awaiting promises before running matchers.

## Technical Constraints

- Node.js >= 20.0.0 required
- ESM-only (`"type": "module"`)
- TypeScript with strict mode + `noUncheckedIndexedAccess`
- Build target: ES2022, NodeNext module resolution
- Uses `node:assert.AssertionError` for failures (integrates with test runner output)

## Test Coverage Requirements

| Metric | Threshold |
|--------|-----------|
| Lines | >= 90% |
| Functions | >= 90% |
| Branches | >= 85% |
| Statements | >= 90% |
