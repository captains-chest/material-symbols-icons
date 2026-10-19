import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

// Files whose content determines the generated icon sources. Changing any of them invalidates
// every stamp, so `icons:ensure` regenerates instead of reusing stale output.
export const GENERATOR_INPUTS = [
  'tools/icons/upstream.json',
  'tools/icons/sync-material-symbols.mjs',
  'tools/icons/svg-sanitizer.mjs',
  'tools/icons/generation-stamp.mjs',
];

export function generatedPaths(repoRoot, target) {
  const libRoot = path.join(repoRoot, target.projectPath, 'src/lib');
  return {
    generatedDir: path.join(libRoot, 'icons/generated'),
    generatedIndexPath: path.join(libRoot, 'icons/index.ts'),
    generatedComponentMapPath: path.join(libRoot, 'icons/component-map.ts'),
    manifestPath: path.join(libRoot, 'generated/icon-manifest.ts'),
    stampPath: path.join(libRoot, 'generated/.generation-stamp.json'),
  };
}

export async function computeInputsHash(repoRoot) {
  const hash = createHash('sha256');
  for (const input of GENERATOR_INPUTS) {
    hash.update(`${input}\0`);
    hash.update(await fs.readFile(path.join(repoRoot, input)));
    hash.update('\0');
  }
  return hash.digest('hex');
}

export async function writeStamp(repoRoot, target, { inputsHash, iconCount, complete }) {
  const { stampPath } = generatedPaths(repoRoot, target);
  await fs.mkdir(path.dirname(stampPath), { recursive: true });
  await fs.writeFile(
    stampPath,
    `${JSON.stringify({ inputsHash, iconCount, complete }, null, 2)}\n`,
    'utf8',
  );
}

export async function removeStamp(repoRoot, target) {
  await fs.rm(generatedPaths(repoRoot, target).stampPath, { force: true });
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Returns null when the target's generated sources are present and match the current generator
// inputs, otherwise a human-readable reason they need regenerating.
export async function staleReason(repoRoot, target, inputsHash) {
  const paths = generatedPaths(repoRoot, target);

  let stamp;
  try {
    stamp = JSON.parse(await fs.readFile(paths.stampPath, 'utf8'));
  } catch {
    return 'no generation stamp';
  }
  if (stamp.inputsHash !== inputsHash) return 'generator inputs changed';
  if (stamp.complete !== true) return 'partial (sample or limited) generation';

  for (const file of [
    paths.generatedIndexPath,
    paths.generatedComponentMapPath,
    paths.manifestPath,
  ]) {
    if (!(await exists(file))) return `missing ${path.relative(repoRoot, file)}`;
  }

  let iconFiles;
  try {
    iconFiles = (await fs.readdir(paths.generatedDir)).filter((name) => name.endsWith('.icon.ts'));
  } catch {
    return `missing ${path.relative(repoRoot, paths.generatedDir)}`;
  }
  if (iconFiles.length !== stamp.iconCount)
    return `expected ${stamp.iconCount} icon files, found ${iconFiles.length}`;

  return null;
}
