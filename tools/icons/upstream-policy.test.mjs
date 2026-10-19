import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'vite-plus/test';

const repoRoot = process.cwd();
const syncScript = path.join(repoRoot, 'tools/icons/sync-material-symbols.mjs');
const originalConfig = fs.readFileSync(path.join(repoRoot, 'tools/icons/upstream.json'), 'utf8');

const runSyncWithConfig = (config) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'upstream-policy-'));
  // The policy check runs before any generation, so the tooling alone is enough.
  fs.cpSync(path.join(repoRoot, 'tools'), path.join(tmp, 'tools'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'tools/icons/upstream.json'), JSON.stringify(config, null, 2));

  return spawnSync(process.execPath, [syncScript, '--target', 'none'], {
    cwd: tmp,
    encoding: 'utf8',
  });
};

test('sync rejects mutable upstream refs before target validation', () => {
  const result = runSyncWithConfig({ ...JSON.parse(originalConfig), ref: 'main' });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /upstream-policy-violation/);
  assert.match(result.stderr, /mutable-ref/);
});

test('sync rejects unexpected upstream owner', () => {
  const result = runSyncWithConfig({ ...JSON.parse(originalConfig), owner: 'example' });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unexpected-owner/);
});
