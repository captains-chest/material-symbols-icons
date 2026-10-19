#!/usr/bin/env node
// Runs a command in every built package directory (dist/<project>), in tools/icons/upstream.json
// target order, and stops at the first failure.
// Usage: node tools/release/for-each-package.mjs npm pack --dry-run
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const { targets } = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'tools/icons/upstream.json'), 'utf8'),
);
const [command, ...args] = process.argv.slice(2);
if (!command) throw new Error('Usage: for-each-package.mjs <command> [...args]');

for (const target of Object.values(targets)) {
  const cwd = path.join(repoRoot, 'dist', path.basename(target.projectPath));
  if (!fs.existsSync(path.join(cwd, 'package.json'))) {
    throw new Error(`${path.relative(repoRoot, cwd)} is not built. Run pnpm build:lib first.`);
  }
  console.log(`\n> ${target.packageName}: ${[command, ...args].join(' ')}`);
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}
