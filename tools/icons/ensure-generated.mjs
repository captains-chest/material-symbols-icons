#!/usr/bin/env node
// Makes sure generated icon sources exist and match the current generator inputs, running the full
// sync only when they are missing or stale. Builds and Storybook run this first, so a fresh clone
// works without a manual `pnpm sync:icons`.
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { computeInputsHash, staleReason } from './generation-stamp.mjs';

const repoRoot = process.cwd();
const config = JSON.parse(
  await fs.readFile(path.join(repoRoot, 'tools/icons/upstream.json'), 'utf8'),
);
const targets = Object.values(config.targets ?? {});
const inputsHash = await computeInputsHash(repoRoot);

const stale = [];
for (const target of targets) {
  const reason = await staleReason(repoRoot, target, inputsHash);
  if (reason) stale.push(`${target.id}: ${reason}`);
}

if (stale.length === 0) {
  console.log('Generated icon sources are up to date.');
} else {
  console.log(`Regenerating icon sources (${stale.join('; ')})`);
  const syncScript = path.join(repoRoot, 'tools/icons/sync-material-symbols.mjs');
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [syncScript, '--target', 'all'], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('close', resolve);
  });
  if (code !== 0) process.exitCode = code ?? 1;
}
