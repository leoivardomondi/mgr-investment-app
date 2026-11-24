import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execSync, spawnSync } from 'node:child_process';
import {
  INITIAL_MEMBERS,
  INITIAL_GROUP_ASSETS,
  getQuarterForDate
} from '../src/data/initialData.js';

const ROOT = process.cwd();
const readText = (relPath) => fs.readFileSync(path.join(ROOT, relPath), 'utf8');

// ============================================================================
// 1. BACKEND PHP (public/api.php) SYNTAX, SCHEMA PARITY & SYNC THRESHOLDS
// ============================================================================
test('PHP backend: public/api.php has zero unbalanced braces, brackets, parens, or quotes', () => {
  const s = readText('public/api.php');
  let braces = 0;
  let parens = 0;
  let brackets = 0;
  let quote = null;
  let escaped = false;
  let line = 1;
  const negativeEvents = [];

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const n = s[i + 1];
    if (c === '\n') line++;
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (c === '\\') {
        escaped = true;
        continue;
      }
      if (c === quote) quote = null;
      continue;
    }
    if ((c === '/' && n === '/') || c === '#') {
      while (i < s.length && s[i] !== '\n') i++;
      line++;
      continue;
    }
    if (c === '/' && n === '*') {
      i += 2;
      while (i < s.length && !(s[i] === '*' && s[i + 1] === '/')) {
        if (s[i] === '\n') line++;
        i++;
      }
      i++;
      continue;
    }
    if (c === "'" || c === '"') {
      quote = c;
      continue;
    }
    if (c === '{') braces++;
    else if (c === '}') {
      braces--;
      if (braces < 0) negativeEvents.push(`Unmatched '}' at line ${line}`);
    } else if (c === '(') parens++;
    else if (c === ')') {
      parens--;
      if (parens < 0) negativeEvents.push(`Unmatched ')' at line ${line}`);
    } else if (c === '[') brackets++;
    else if (c === ']') {
      brackets--;
      if (brackets < 0) negativeEvents.push(`Unmatched ']' at line ${line}`);
    }
  }

  assert.deepEqual(negativeEvents, [], `Structural syntax errors in public/api.php: ${negativeEvents.join('; ')}`);
  assert.equal(quote, null, 'Unclosed string literal in public/api.php');
  assert.equal(braces, 0, `Unbalanced curly braces in public/api.php (delta=${braces})`);
  assert.equal(parens, 0, `Unbalanced parentheses in public/api.php (delta=${parens})`);
  assert.equal(brackets, 0, `Unbalanced square brackets in public/api.php (delta=${brackets})`);
});

test('PHP backend: passes native `php -l` syntax check when PHP CLI is available', (t) => {
  const probe = spawnSync('php', ['-v'], { encoding: 'utf8' });
  if (probe.error || probe.status !== 0) {
    t.skip('PHP CLI not installed on this local machine (enforced in GitHub Actions CI)');
    return;
  }
  const lint = spawnSync('php', ['-l', path.join(ROOT, 'public/api.php')], { encoding: 'utf8' });
  assert.equal(lint.status, 0, `php -l failed:\n${lint.stdout}\n${lint.stderr}`);
});

test('PHP backend: MySQL and SQLite schema migrations stay in parity & JSON error handler is active', () => {
  const php = readText('public/api.php');

  assert.match(php, /set_exception_handler\s*\(/, 'Global JSON exception handler must be registered in public/api.php');

  // Verify MySQL migration block includes critical user & audit telemetry columns
  const mysqlMigrationStart = php.indexOf("else if ($driverUsed === 'mysql')");
  assert.ok(mysqlMigrationStart !== -1, 'MySQL migration block must exist');
  const mysqlBlock = php.slice(mysqlMigrationStart, mysqlMigrationStart + 2500);

  for (const col of [
    'account_pin',
    'national_id',
    'location_city',
    'profile_completed',
    'kyc_docs_json',
    'privacy_agreed_at',
    'action_type',
    'actor_id',
    'location_open'
  ]) {
    assert.ok(mysqlBlock.includes(col), `MySQL migration block is missing column: ${col}`);
  }

  // Verify getStoredState reconciles mgr_users into state['members']
  const getStateIdx = php.indexOf('function getStoredState');
  const getStateBlock = php.slice(getStateIdx, getStateIdx + 3000);
  assert.ok(
    getStateBlock.includes('FROM mgr_users'),
    'getStoredState() must reconcile mgr_users into state["members"] so new members always appear in Members & Deposit dropdowns'
  );
});

// ============================================================================
// 2. FRONTEND STATIC ANALYSIS & UNDEFINED REFERENCE THRESHOLDS
// ============================================================================
test('Frontend static analysis: zero no-undef errors across src/ via oxlint', () => {
  const res = spawnSync('npx oxlint -c .oxlintrc.json --quiet --deny no-undef src/', {
    cwd: ROOT,
    encoding: 'utf8',
    shell: true
  });
  assert.equal(
    res.status,
    0,
    `oxlint detected undefined variable(s) in src/:\n${res.stdout}\n${res.stderr}`
  );
});

test('Frontend regression guards: no MGR-012 exclusion filter and no broken modal refs', () => {
  const appCtx = readText('src/context/AppContext.jsx');
  const membersView = readText('src/components/MembersView.jsx');

  assert.equal(
    /\.filter\s*\([^)]*MGR-012/.test(appCtx),
    false,
    'AppContext.jsx must NEVER filter out MGR-012 from members'
  );
  assert.equal(
    membersView.includes('liveM?.phone'),
    false,
    'MembersView.jsx must not reference out-of-scope liveM?.phone'
  );
});

// ============================================================================
// 3. SECURITY, RBAC, PRIVACY & REFERRAL THRESHOLDS
// ============================================================================
test('RBAC & Security: designated System Administrators have super_admin access on frontend and backend', () => {
  const php = readText('public/api.php');
  const appCtx = readText('src/context/AppContext.jsx');

  assert.ok(php.includes('leoivardomondi@gmail.com'), 'public/api.php must recognize leoivardomondi@gmail.com as System Admin');
  assert.ok(appCtx.includes('leoivardomondi@gmail.com'), 'AppContext.jsx must recognize leoivardomondi@gmail.com as System Admin');
  assert.ok(appCtx.includes("currentMemberId === 'MGR-011'"), 'AppContext.jsx must include MGR-011 in super admin checks');
});

test('Privacy & Governance rules: PIN non-editable by admin, no member dropdown in mandatory form, clean auth modal', () => {
  const adminView = readText('src/components/AdminAccessMailView.jsx');
  const firstLogin = readText('src/components/FirstLoginProfileModal.jsx');
  const authModal = readText('src/components/AuthGateModal.jsx');

  // Admin cannot edit 4-digit security PIN
  assert.equal(
    /onChange=\{[^}]*accountPin/.test(adminView),
    false,
    'AdminAccessMailView.jsx must NOT allow editing a user 4-digit security PIN'
  );

  // First login mandatory modal must not expose a <select> dropdown of all members
  assert.equal(
    /<select[^>]*>[\s\S]*members\.map/.test(firstLogin),
    false,
    'FirstLoginProfileModal.jsx must NOT expose a dropdown listing all club members'
  );

  // AuthGateModal must support referral links (?ref=) and must NOT show the removed governance hierarchy card
  assert.ok(authModal.includes("params.get('ref')"), 'AuthGateModal.jsx must detect ?ref= referral query parameter');
  assert.ok(authModal.includes('recruitedBy'), 'AuthGateModal.jsx must pass recruitedBy into signupUser');
  assert.equal(
    authModal.includes('App Governance &amp; System Access Hierarchy') ||
      authModal.includes('App Governance & System Access Hierarchy'),
    false,
    'AuthGateModal.jsx must NOT render the App Governance & System Access Hierarchy card (belongs in App Guide)'
  );
});

// ============================================================================
// 4. FINANCIAL & ACCOUNTING BASELINE THRESHOLDS
// ============================================================================
test('Financial baseline: founding roster (MGR-001..MGR-011), assets, and quarter attribution are valid', () => {
  assert.ok(Array.isArray(INITIAL_MEMBERS) && INITIAL_MEMBERS.length >= 11, 'Expected at least 11 founding members');

  const ids = new Set();
  for (const m of INITIAL_MEMBERS) {
    assert.ok(m.id && /^MGR-\d{3}$/.test(m.id), `Invalid member ID format: ${m.id}`);
    assert.equal(ids.has(m.id), false, `Duplicate member ID found: ${m.id}`);
    ids.add(m.id);
    assert.ok(typeof m.shares === 'number' && m.shares >= 0, `Invalid share balance for ${m.id}: ${m.shares}`);
  }

  assert.ok(INITIAL_GROUP_ASSETS.mansaX.totalBalance > 0, 'Mansa X baseline balance must be > 0');
  assert.ok(INITIAL_GROUP_ASSETS.eticaMmf.statementBalance > 0, 'Etica MMF baseline balance must be > 0');
  assert.ok(INITIAL_GROUP_ASSETS.groupReserveAccount.balance >= 0, 'Group Reserve balance must be >= 0');

  assert.match(getQuarterForDate('2026-02-15'), /Q1[- ]2026/);
  assert.match(getQuarterForDate('2026-05-15'), /Q2[- ]2026/);
  assert.match(getQuarterForDate('2026-08-15'), /Q3[- ]2026/);
  assert.match(getQuarterForDate('2026-11-15'), /Q4[- ]2026/);
});

// ============================================================================
// 5. PRODUCTION BUILD & BUNDLE SIZE THRESHOLDS
// ============================================================================
test('Production build: dist/ contains all required cPanel artifacts within bundle size thresholds', () => {
  // Ensure fresh build exists
  if (!fs.existsSync(path.join(ROOT, 'dist/index.html'))) {
    execSync('npm run build', { cwd: ROOT, stdio: 'pipe' });
  }

  const requiredFiles = [
    'dist/index.html',
    'dist/api.php',
    'dist/.htaccess',
    'dist/manifest.webmanifest',
    'dist/sw.js'
  ];
  for (const f of requiredFiles) {
    assert.ok(fs.existsSync(path.join(ROOT, f)), `Missing required production artifact: ${f}`);
  }

  const assetsDir = path.join(ROOT, 'dist/assets');
  assert.ok(fs.existsSync(assetsDir), 'Missing dist/assets directory');
  const assetFiles = fs.readdirSync(assetsDir);
  const jsFiles = assetFiles.filter((f) => f.endsWith('.js'));
  const cssFiles = assetFiles.filter((f) => f.endsWith('.css'));

  assert.ok(jsFiles.length >= 1, 'Expected at least one JS bundle in dist/assets');
  assert.ok(cssFiles.length >= 1, 'Expected at least one CSS bundle in dist/assets');

  // Bundle size thresholds (gzipped): JS <= 350 KB, CSS <= 35 KB
  const MAX_JS_GZIP_BYTES = 350 * 1024;
  const MAX_CSS_GZIP_BYTES = 35 * 1024;

  for (const f of jsFiles) {
    const gzSize = zlib.gzipSync(fs.readFileSync(path.join(assetsDir, f))).length;
    assert.ok(
      gzSize <= MAX_JS_GZIP_BYTES,
      `JS bundle ${f} gzipped size (${(gzSize / 1024).toFixed(1)} KB) exceeds 350 KB threshold`
    );
  }
  for (const f of cssFiles) {
    const gzSize = zlib.gzipSync(fs.readFileSync(path.join(assetsDir, f))).length;
    assert.ok(
      gzSize <= MAX_CSS_GZIP_BYTES,
      `CSS bundle ${f} gzipped size (${(gzSize / 1024).toFixed(1)} KB) exceeds 35 KB threshold`
    );
  }
});
