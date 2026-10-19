import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test';
import {
  computeInputsHash,
  GENERATOR_INPUTS,
  generatedPaths,
  staleReason,
  writeStamp,
} from './generation-stamp.mjs';

const target = { id: 'rounded', projectPath: 'projects/pkg' };
let root;

async function write(relativePath, content = '') {
  const filePath = path.join(root, relativePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}

async function generate(iconCount, { complete = true } = {}) {
  const paths = generatedPaths(root, target);
  for (let i = 0; i < iconCount; i += 1)
    await write(path.relative(root, path.join(paths.generatedDir, `icon-${i}.icon.ts`)));
  for (const file of [
    paths.generatedIndexPath,
    paths.generatedComponentMapPath,
    paths.manifestPath,
  ])
    await write(path.relative(root, file));
  await writeStamp(root, target, {
    inputsHash: await computeInputsHash(root),
    iconCount,
    complete,
  });
}

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'msr-stamp-'));
  for (const input of GENERATOR_INPUTS) await write(input, `content of ${input}`);
});

afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
});

describe('staleReason', () => {
  it('is fresh after a complete generation', async () => {
    await generate(3);
    expect(await staleReason(root, target, await computeInputsHash(root))).toBeNull();
  });

  it('flags a fresh clone with no generated sources', async () => {
    expect(await staleReason(root, target, await computeInputsHash(root))).toBe(
      'no generation stamp',
    );
  });

  it('flags changed generator inputs such as a new upstream ref', async () => {
    await generate(3);
    await write('tools/icons/upstream.json', '{"ref":"changed"}');
    expect(await staleReason(root, target, await computeInputsHash(root))).toBe(
      'generator inputs changed',
    );
  });

  it('flags sample or limited generations', async () => {
    await generate(3, { complete: false });
    expect(await staleReason(root, target, await computeInputsHash(root))).toMatch(/partial/);
  });

  it('flags deleted icon files', async () => {
    await generate(3);
    await fs.rm(path.join(generatedPaths(root, target).generatedDir, 'icon-0.icon.ts'));
    expect(await staleReason(root, target, await computeInputsHash(root))).toBe(
      'expected 3 icon files, found 2',
    );
  });

  it('flags a missing manifest', async () => {
    await generate(3);
    await fs.rm(generatedPaths(root, target).manifestPath);
    expect(await staleReason(root, target, await computeInputsHash(root))).toMatch(
      /^missing .*icon-manifest\.ts$/,
    );
  });
});
