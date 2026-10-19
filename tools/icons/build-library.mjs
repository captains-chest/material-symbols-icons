#!/usr/bin/env node
// Builds one publishable icon library: `ng build <project>`, then the post-build steps that strip the
// FESM sourcemap comment and emit the per-icon subpath entry points.
// Usage: node tools/icons/build-library.mjs <target-id>   (target ids from tools/icons/upstream.json)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const { targets } = JSON.parse(
  fs.readFileSync(path.join(repoRoot, 'tools/icons/upstream.json'), 'utf8'),
);
const targetId = process.argv[2];
const target = targets[targetId];
if (!target) {
  throw new Error(
    `Unknown target "${targetId}". Available targets: ${Object.keys(targets).join(', ')}`,
  );
}

const project = path.basename(target.projectPath);
const dist = `dist/${project}`;
const run = (command, args) => execFileSync(command, args, { cwd: repoRoot, stdio: 'inherit' });

run(path.join(repoRoot, 'node_modules/.bin/ng'), ['build', project]);
run(process.execPath, ['tools/icons/strip-sourcemap-comment.mjs', '--dist', dist]);
run(process.execPath, [
  'tools/icons/emit-icon-entry-points.mjs',
  '--project',
  target.projectPath,
  '--dist',
  dist,
]);
