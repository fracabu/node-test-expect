# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-10-28

### Changed

- Dev dependencies updated within their current major versions (all 106 tests pass)
- CI matrix now includes Node.js 24; `actions/checkout` and `actions/setup-node` updated to v7
- Removed the `lint` script: ESLint was never installed, so it always failed

### Security

- Releases are published through npm trusted publishing (OIDC) and staged for 2FA approval, instead of a long-lived `NPM_TOKEN`

## [1.0.0] - 2025-12-10

### Added

- Initial release
