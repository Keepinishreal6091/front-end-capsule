import test from 'node:test';
import assert from 'node:assert/strict';
import { violationsFor } from './check-source-policy.mjs';

test('rejects real environment and generated files', () => {
  for (const path of ['.env', '.env.local', 'node_modules/a.js', 'target/app.jar', 'dist/main.js']) {
    assert.ok(violationsFor(path, '').length > 0);
  }
});
test('allows placeholder-only examples and environment references', () => {
  assert.deepEqual(violationsFor('.env.example', 'DB_PASSWORD=replace-with-local-password'), []);
  assert.deepEqual(violationsFor('src/main/resources/application.properties',
    'spring.datasource.password=${DB_PASSWORD}\napp.security.jwt-secret=${JWT_SECRET}'), []);
});
test('rejects hard-coded configuration, even in an example', () => {
  const fixture = 'fixture-not-a-real-credential';
  assert.ok(violationsFor('src/main/resources/application.properties', 'spring.datasource.password=' + fixture).length);
  assert.ok(violationsFor('.env.example', 'JWT_SECRET=' + fixture).length);
});
test('recognizes key and token shapes without displaying values', () => {
  const key = ['-----BEGIN ', 'OPENSSH ', 'PRIVATE KEY-----'].join('');
  const token = ['ghp', '_', 'a'.repeat(36)].join('');
  assert.ok(violationsFor('notes.txt', key).includes('private key'));
  assert.ok(violationsFor('notes.txt', token).includes('GitHub credential'));
});
test('allows only the exact existing disposable test signing fixture', () => {
  const content = 'app.security.jwt-secret=test-only-secret-that-is-at-least-32-characters';
  assert.deepEqual(violationsFor('src/test/resources/application.properties', content), []);
  assert.ok(violationsFor('src/main/resources/application.properties', content).length);
});
test('rejects browser token writes but allows obsolete-key removal', () => {
  assert.ok(violationsFor('auth.ts', "localStorage." + "setItem('access_token', value)").length);
  assert.deepEqual(violationsFor('auth.ts', "localStorage.removeItem('capsule_access_token')"), []);
});
