# Piano di Implementazione: fastify-api-key

Questo documento contiene tutte le informazioni raccolte durante l'analisi e le best practice npm moderne (2024-2025) per lo sviluppo del plugin.

---

## 1. Configurazione Progetto

### 1.1 package.json (Best Practice Moderne)

```json
{
  "name": "fastify-api-key",
  "version": "1.0.0",
  "description": "Complete API Key authentication for Fastify with scopes, multiple sources, and TypeScript support",
  "author": "fracabu",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./errors": {
      "import": {
        "types": "./dist/errors.d.ts",
        "default": "./dist/errors.js"
      },
      "require": {
        "types": "./dist/errors.d.cts",
        "default": "./dist/errors.cjs"
      }
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ],
  "sideEffects": false,
  "engines": {
    "node": ">=20.0.0"
  },
  "packageManager": "npm@10.8.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/fracabu/fastify-api-key.git"
  },
  "bugs": {
    "url": "https://github.com/fracabu/fastify-api-key/issues"
  },
  "homepage": "https://github.com/fracabu/fastify-api-key#readme",
  "keywords": [
    "fastify",
    "fastify-plugin",
    "api-key",
    "authentication",
    "auth",
    "security",
    "scopes",
    "permissions",
    "authorization",
    "api-authentication",
    "typescript"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run lint && npm run typecheck && npm run test && npm run build",
    "clean": "rimraf dist coverage",
    "prepare": "npm run build"
  },
  "dependencies": {
    "fastify-plugin": "^5.0.1"
  },
  "peerDependencies": {
    "fastify": "^5.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.16.0",
    "@types/node": "^22.10.1",
    "@vitest/coverage-v8": "^2.1.8",
    "eslint": "^9.16.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.2.1",
    "fastify": "^5.2.0",
    "globals": "^15.13.0",
    "prettier": "^3.4.2",
    "rimraf": "^6.0.1",
    "tsup": "^8.3.5",
    "typescript": "^5.7.2",
    "typescript-eslint": "^8.17.0",
    "vitest": "^2.1.8"
  }
}
```

**Campi Moderni Spiegati:**
- **`type: "module"`**: ESM come sistema di moduli predefinito
- **`exports`**: Export condizionali per supporto ESM/CJS duale (types DEVE venire prima)
- **`sideEffects: false`**: Abilita tree-shaking per bundler
- **`engines`**: Richiede Node.js 20+
- **`packageManager`**: Dichiara versione npm per compatibilità corepack
- **`files`**: Approccio whitelist (preferito rispetto a `.npmignore`)

---

### 1.2 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test", "**/*.test.ts"]
}
```

---

### 1.3 tsup.config.ts

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/errors.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node20',
  treeshake: true,
  splitting: false,
  minify: false,
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
});
```

---

## 2. Tooling di Sviluppo

### 2.1 ESLint Flat Config (eslint.config.js)

Il nuovo standard ESLint (flat config) introdotto in ESLint 9:

```javascript
// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // Ignores globali
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', '*.config.js', '*.config.ts'],
  },

  // Config JS base
  eslint.configs.recommended,

  // Config TypeScript
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Settings TypeScript-specific
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Regole file sorgente
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
    },
  },

  // File test - regole rilassate
  {
    files: ['test/**/*.ts', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },

  // Prettier deve essere ultimo
  eslintConfigPrettier
);
```

---

### 2.2 Prettier (.prettierrc.json)

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true
}
```

**.prettierignore:**
```
dist
coverage
node_modules
*.md
```

---

### 2.3 Vitest (vitest.config.ts)

**Perché Vitest invece di tap:**
1. Supporto ESM + TypeScript nativo
2. API compatibile con Jest
3. Prestazioni eccellenti con Worker threads
4. DX superiore (watch mode, UI, coverage)

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
```

---

## 3. Struttura Directory

```
fastify-api-key/
├── src/
│   ├── index.ts              # Entry point con wrapper fp ed export
│   ├── plugin.ts             # Implementazione plugin principale
│   ├── types.ts              # TypeScript types + Fastify augmentation
│   ├── extractors.ts         # Estrazione API key da varie sorgenti
│   ├── validators.ts         # Helper validazione scopes
│   ├── errors.ts             # Classi errore custom
│   └── utils.ts              # Timing-safe comparison, utilities
├── test/
│   ├── plugin.test.ts        # Test integrazione
│   ├── extractors.test.ts    # Unit test extractors
│   ├── validators.test.ts    # Unit test validators
│   ├── scopes.test.ts        # Test sistema scopes
│   ├── errors.test.ts        # Test gestione errori
│   └── helpers.ts            # Utilities test e fixtures
├── .github/
│   └── workflows/
│       ├── ci.yml            # Test, lint, build su PR/push
│       └── release.yml       # npm publish con provenance
├── eslint.config.js
├── vitest.config.ts
├── tsup.config.ts
├── tsconfig.json
├── package.json
├── .prettierrc.json
├── .prettierignore
├── .gitignore
├── README.md
├── LICENSE
├── CHANGELOG.md
└── CLAUDE.md
```

---

## 4. GitHub Actions CI/CD

### 4.1 CI (.github/workflows/ci.yml)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

      - name: Type check
        run: npm run typecheck

  test:
    name: Test (Node ${{ matrix.node-version }})
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        node-version: [20, 22]

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: matrix.node-version == 22
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - run: npm ci

      - name: Build package
        run: npm run build

      - name: Check package exports
        run: |
          node -e "import('./dist/index.js').then(m => console.log('ESM OK:', Object.keys(m)))"
          node -e "const m = require('./dist/index.cjs'); console.log('CJS OK:', Object.keys(m))"

      - name: Validate package
        run: npm pack --dry-run
```

---

### 4.2 Release (.github/workflows/release.yml)

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write
  id-token: write

jobs:
  release:
    name: Release to npm
    runs-on: ubuntu-latest
    environment: npm
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build

      - name: Publish to npm with provenance
        run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
          files: |
            *.tgz
```

---

## 5. Best Practice npm Publishing

### 5.1 Configurazioni Chiave

1. **Campo `files`** (approccio whitelist - preferito):
   ```json
   "files": ["dist", "README.md", "LICENSE", "CHANGELOG.md"]
   ```

2. **Script `prepublishOnly`** (esegue prima di `npm publish`):
   ```json
   "prepublishOnly": "npm run lint && npm run typecheck && npm run test && npm run build"
   ```

3. **Provenance** (sicurezza supply chain):
   - Usare flag `--provenance` quando si pubblica da GitHub Actions
   - Richiede permesso `id-token: write`
   - Verificato su npmjs.com con badge "Built and signed on GitHub Actions"

4. **Semantic Versioning**:
   - MAJOR: Breaking changes
   - MINOR: Nuove funzionalità (retrocompatibili)
   - PATCH: Bug fix (retrocompatibili)

### 5.2 Workflow Pubblicazione

1. Aggiornare versione: `npm version patch|minor|major`
2. Crea automaticamente un git tag
3. Push con tags: `git push && git push --tags`
4. GitHub Actions release workflow si attiva
5. Package pubblicato con attestazione provenance

### 5.3 Tool di Validazione

Prima di pubblicare, validare con:
- [publint](https://publint.dev/) - Verifica configurazione package.json
- [Are the Types Wrong?](https://arethetypeswrong.github.io/) - Valida export TypeScript

---

## 6. Requisiti Coverage Test

| Metrica | Soglia Minima |
|---------|---------------|
| Lines | >= 90% |
| Functions | >= 90% |
| Branches | >= 85% |
| Statements | >= 90% |

---

## 7. Fonti e Riferimenti

- [Building an npm package compatible with ESM and CJS in 2024](https://snyk.io/blog/building-npm-package-compatible-with-esm-and-cjs-2024/)
- [Guide to the package.json exports field](https://hirok.io/posts/package-json-exports)
- [Pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)
- [typescript-eslint Getting Started](https://typescript-eslint.io/getting-started/)
- [Modern Linting in 2025: ESLint Flat Config](https://advancedfrontends.com/eslint-flat-config-typescript-javascript/)
- [Testing in Node: A Comparison](https://betterstack.com/community/guides/testing/best-node-testing-libraries/)
- [Vitest Documentation](https://vitest.dev/)
- [npm Provenance Documentation](https://docs.npmjs.com/generating-provenance-statements/)
- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
- [Using tsup to bundle your TypeScript package](https://blog.logrocket.com/tsup/)
- [Dual Publishing ESM and CJS with tsup](https://johnnyreilly.com/dual-publishing-esm-cjs-modules-with-tsup-and-are-the-types-wrong)

---

*Documento generato il 10 Dicembre 2025*
