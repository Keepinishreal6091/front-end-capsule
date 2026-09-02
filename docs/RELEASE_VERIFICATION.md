# Capsule frontend release verification

Milestone 3 starts from approved commit `2d3570b`. No application UI or
authentication behavior is changed in this verification milestone.

## Current verification status (2026-09-02)

`npm ci` succeeds with the lockfile unchanged. Application/spec TypeScript,
the six source-policy tests and active-source scan, and production audit pass
(zero production findings). All 34 browser tests pass before and after the clean
install using the existing Windows launcher.

Standard `npm run test:ci` fails in this sandbox while launching Chrome: encryption
is unavailable and the GPU process repeatedly exits with -1073741790. The existing
local launcher still passes; CI retains standard ChromeHeadless on Linux.
Production builds before/after the clean install fail with
`Cannot read directory "../../../../..": Access is denied` and consequently
unresolved existing main.ts, styles, polyfills and Bootstrap CSS. No imports or
security controls were changed to work around those errors.
The full audit still reports 10 development findings. Workflow YAML parses,
but the remote workflow and real browser/API/PostgreSQL journey have not run.

## Reproduce the checks

Use Node 22.20.0 (see `.nvmrc`), npm 10.9.3, and Chrome/Chromium:

```bash
npm ci
npm run check:source
npm run typecheck
npm run test:ci
npm run build -- --configuration production
npm run audit:production
npm run audit:all
```

`typecheck` covers application and test TypeScript. `test:ci` runs the complete
34-test baseline suite with standard ChromeHeadless, not the no-sandbox launcher.
On the restricted Windows environment the existing `npm test -- --watch=false`
launcher remains available; its success does not prove the production build.
Do not alter application imports, remove styles/polyfills, or disable compiler
checks to work around a filesystem-denied build.

The workflow checks out with read-only permissions and no persisted credentials,
uses commit-pinned actions, runs `npm ci`, both TypeScript checks, browser tests,
the production build, and the production audit. A separate development-audit job
fails on any advisory instead of hiding the known dev-tool findings. No deploy,
publish, merge, or automated dependency-merge step exists.

Known baseline audit: zero production findings; 10 development-tool findings
(3 high, 7 moderate) through image-size/Less, qs/Express/body-parser, and
uuid/SockJS/webpack-dev-server. Do not use npm's suggested forced Angular-builder
downgrade. Compatible upgrades must be tested once the build environment works.
The development-audit gate is expected to remain red until that debt is resolved.

Dependabot configuration targets Milestone 3, with no automatic merge. GitHub
normally reads this configuration from the default branch, so it may remain
inactive while the file exists only on this milestone branch. Do not merge
anything just to activate it. Required-check/branch-protection settings need
owner approval.

## Configuration boundaries

| Context | API | Authentication |
| --- | --- | --- |
| Local `npm start` | environment.development.ts: localhost:9090 | Backend local profile, same hostname, HTTP-only Strict cookies |
| Unit tests | Angular HTTP mocks and component fixtures | No live database or real credentials |
| Production build | environment.ts: same-origin /api | HTTPS reverse proxy and backend prod profile with Secure cookies |

The Angular environment files contain public URLs only. Angular does not
automatically load `.env` or the example's shell variable. Do not add private
backend secrets to Angular's bundle. The default backend configuration already
uses Secure cookies; the explicit production profile additionally removes local
database/CORS defaults and development schema/logging overrides.

## Source-policy gate

The dependency-free Node scanner and six regression tests reject local environment
files, generated/dependency directories, recognized private-key/token formats,
literal database/signing-secret configuration, and obvious browser token writes.
Only file/rule names are printed. This is an active-source guard, not exhaustive
entropy/history scanning. Review remains required; no historical commits are rewritten.

## End-to-end release gate

The backend's `docs/RELEASE_VERIFICATION.md` provides the disposable PostgreSQL
procedure and full two-user browser/API/database checklist. Run registration,
login, create, locked-content redaction, metadata editing, cross-user denial,
refresh/replay rejection, logout/revoked-token denial, re-login and owned deletion.
Compare a non-UTC client input with API UTC and PostgreSQL timestamps, including
DST gap/overlap behavior and preserved seconds on title-only edits.

The existing client Date tests and backend migration timestamp tests are not
proof of the complete browser → API → database path. Keep that gate pending until
the actual three-component application runs together. No external email service
or new reset/verification UI is chosen by this work.
