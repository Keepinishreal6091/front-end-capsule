import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Active-source guard, not a full-history or entropy-based secret scanner.
// Diagnostics deliberately report file/rule names, never matched values.
export function violationsFor(path, content) {
  const problems = [];
  const leaf = path.split('/').at(-1);
  if ((leaf === '.env' || leaf.startsWith('.env.')) && leaf !== '.env.example') {
    problems.push('local environment file');
  }
  if (/(^|\/)(node_modules|target|dist|coverage|\.angular|\.cache)(\/|$)/.test(path)) {
    problems.push('generated/dependency directory');
  }
  if (/\.(pem|p12|pfx|jks|key)$/i.test(path) || /(^|\/)id_(rsa|ed25519)$/.test(path)) {
    problems.push('private credential file');
  }
  const patterns = [
    ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
    ['GitHub credential', /\b(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/],
    ['AWS key ID', /\bAKIA[0-9A-Z]{16}\b/],
    ['JWT credential', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
    ['database URI credential', /(?:postgres(?:ql)?|mysql):\/\/[^\s:/]+:[^\s@]+@/]
  ];
  for (const [rule, pattern] of patterns) {
    if (pattern.test(content)) problems.push(rule);
  }
  for (const line of content.split(/\r?\n/)) {
    const assignment = line.match(/^\s*(spring\.datasource\.password|app\.security\.jwt-secret|DB_PASSWORD|JWT_SECRET)\s*[=:]\s*(.*?)\s*$/);
    if (!assignment) continue;
    const value = assignment[2];
    const environmentReference = /^\$\{[A-Z_]+\}$/.test(value);
    const placeholder = leaf === '.env.example' && value.startsWith('replace-');
    const testFixture = path === 'src/test/resources/application.properties'
      && (value === '' || value === 'test-only-secret-that-is-at-least-32-characters');
    if (!environmentReference && !placeholder && !testFixture) problems.push('literal secret configuration');
  }
  if (/\b(?:localStorage|sessionStorage)\.setItem\s*\(\s*['"][^'"]*(?:token|jwt|password|credential)/i.test(content)) {
    problems.push('browser credential persistence');
  }
  return [...new Set(problems)];
}

export function checkRepository() {
  const paths = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    { encoding: 'utf8' }).split('\0').filter(Boolean);
  let failures = 0;
  for (const path of [...new Set(paths)]) {
    if (!existsSync(path)) continue; // Intentional deletion from the working tree.
    for (const rule of violationsFor(path, readFileSync(path, 'utf8'))) {
      console.error(path + ': ' + rule);
      failures++;
    }
  }
  if (failures) {
    console.error('Source policy failed (' + failures + ' findings); values redacted.');
    return 1;
  }
  console.log('Active-source policy passed; no prohibited files or recognized credentials found.');
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = checkRepository();
}
