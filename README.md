# Capsule frontend

Angular client for Capsule: private messages sealed until a precise unlock instant.

## Prerequisites and setup

- Node.js 22.12+ (or another version supported by Angular 21), npm, and Chrome/Chromium for browser tests.
- The sibling `capsule-backend` repository running on localhost:9090 with its explicit `local` profile for HTTP development.
- Both applications must use the same hostname (use localhost consistently).

```bash
npm ci
npm start
```

Open `http://localhost:4200`.

## Environment configuration

Development uses `src/environments/environment.development.ts` with `apiUrl: 'http://localhost:9090'`. Production uses `src/environments/environment.ts` with `apiUrl: ''`, expecting the hosting reverse proxy to route `/api` to the backend over HTTPS.

`.env.example` contains a public API URL example only. Angular does not automatically consume shell `.env` files: change the appropriate environment file when the public API base URL changes. No database password, JWT signing secret, or refresh credential belongs in Angular configuration.

## Cookie-based sessions

Authentication responses contain a username only. The browser manages the backend's HTTP-only access and refresh cookies. No access JWT or refresh credential is read by JavaScript or saved in browser storage.

On upgrade, the client only deletes the obsolete `capsule_access_token` and `username` localStorage keys. It never reads or writes authentication credentials there.

At startup the client obtains CSRF protection, inspects the session, and attempts refresh when access has expired. API requests use `withCredentials`; state-changing requests send `X-XSRF-TOKEN`. An API 401 triggers one shared refresh attempt for concurrent requests, then retries each original request once. Authentication endpoints are never recursively refreshed.

Logout calls the backend to revoke the current session and expire cookies. If logout cannot reach the server, the UI reports failure rather than falsely claiming the server session was removed.

Production cookies are Secure, HTTP-only, and SameSite=Strict. Only the backend's explicit `local` profile disables Secure for local HTTP. Production must use HTTPS and a same-site frontend/API topology. Do not enable the local profile in production.

## UTC and ownership behavior

The create/edit form interprets `datetime-local` in the client's timezone and submits a canonical UTC ISO timestamp as `unlockAt`. Invalid local dates and daylight-saving gaps are rejected. During an ambiguous fall-back hour, the browser's native Date interpretation selects the earlier occurrence; an explicit offset chooser is future work.

All returned timestamps display through Angular's DatePipe in the client timezone. The server's `locked` flag controls content visibility; the browser clock is not an authorization boundary. Refresh status at the unlock instant to retrieve newly available messages.

Owners can edit metadata/add messages while locked and delete their capsules before or after unlock. Metadata edits omit the hidden messages field so sealed messages are preserved. The server enforces ownership on every operation; other users cannot access or delete a capsule.

## Local workflow

1. Configure PostgreSQL and backend secrets using the backend README.
2. Start the backend with `SPRING_PROFILES_ACTIVE=local`.
3. Start this frontend with `npm start`.
4. Register, create a capsule with a future local time, and inspect its locked metadata.
5. At or after the unlock instant, refresh to read the messages.
6. Delete the capsule if desired; log out to revoke the current session.

Current database credential status:

> Previously exposed credential verified invalid against the current PostgreSQL server. Current credential rotation requires authorized database administrative access and remains a pre-production operational action.

## Build and tests

```bash
npx tsc -p tsconfig.app.json --noEmit
npm test -- --watch=false
npm run build
npm audit --omit=dev
npm audit
```

The Karma configuration uses a headless Chrome launcher for this restricted development environment. Use `--browsers=ChromeHeadless` when a standard sandboxed browser launcher is available. Do not expose Karma or the Angular development server publicly.

Tests cover cookie-session restoration, CSRF, refresh/retry behavior, logout, API contracts, UTC conversion, locked presentation, metadata preservation, deletion, and Capsule naming. Production builds and backend compilation must be rerun outside a Codex Windows sandbox if filesystem-denial errors occur; do not change application logic to bypass those errors.
