#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { computeInputsHash, generatedPaths, removeStamp, writeStamp } from './generation-stamp.mjs';
import { formatSanitizationError, sanitizeSvg, SvgSanitizationError } from './svg-sanitizer.mjs';

const execFileAsync = promisify(execFile);

const repoRoot = process.cwd();
const configPath = path.join(repoRoot, 'tools/icons/upstream.json');
const defaultSampleIconsPath = path.join(repoRoot, 'tools/icons/sample-icons.txt');

function parseArgs(argv) {
  const args = { limit: undefined, iconsFile: undefined, target: 'all' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--limit') args.limit = Number(argv[++i]);
    if (arg === '--icons-file') args.iconsFile = path.resolve(repoRoot, argv[++i]);
    if (arg === '--sample') args.iconsFile = defaultSampleIconsPath;
    if (arg === '--target') args.target = argv[++i];
  }
  return args;
}

function toPascalCase(iconName) {
  return iconName
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function componentSource({ selector, className, viewBox, innerSvg, classPrefix, directivePrefix }) {
  const escapedInner = innerSvg.replace(/`/g, '\\`').replace(/\$\{/g, '\\\${');
  return `import { Component } from '@angular/core';
import { ${classPrefix}IconHostDirective } from '../../shared/${directivePrefix}-icon-host.directive';
import { ${classPrefix}IconSvgDirective } from '../../shared/${directivePrefix}-icon-svg.directive';

@Component({
  selector: '${selector}',
  imports: [${classPrefix}IconSvgDirective],
  hostDirectives: [{ directive: ${classPrefix}IconHostDirective, inputs: ['ariaLabel'] }],
  template: \`<svg ${directivePrefix}IconSvg focusable="false" viewBox="${viewBox}">${escapedInner}</svg>\`,
})
export class ${className} {}
`;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

const EXEC_MAX_BUFFER = 1024 * 1024 * 1024;
const UPSTREAM_POLICY = {
  owner: 'google',
  repo: 'material-design-icons',
  refPattern: /^[0-9a-f]{40}$/,
};

function validateUpstreamPolicy(config) {
  const violations = [];
  if (config.owner !== UPSTREAM_POLICY.owner) {
    violations.push({
      code: 'unexpected-owner',
      expected: UPSTREAM_POLICY.owner,
      actual: config.owner,
    });
  }
  if (config.repo !== UPSTREAM_POLICY.repo) {
    violations.push({
      code: 'unexpected-repo',
      expected: UPSTREAM_POLICY.repo,
      actual: config.repo,
    });
  }
  if (!UPSTREAM_POLICY.refPattern.test(config.ref ?? '')) {
    violations.push({
      code: 'mutable-ref',
      expected: '40-character lowercase git commit SHA',
      actual: config.ref,
    });
  }
  if (violations.length === 0) return;

  throw new Error(
    JSON.stringify(
      {
        error: 'upstream-policy-violation',
        configPath: path.relative(repoRoot, configPath),
        violations,
      },
      null,
      2,
    ),
  );
}

async function runGit(args, cwd) {
  await execFileAsync('git', args, { cwd, maxBuffer: EXEC_MAX_BUFFER });
}

async function runGitRead(args, cwd) {
  const { stdout } = await execFileAsync('git', args, { cwd, maxBuffer: EXEC_MAX_BUFFER });
  return stdout.trim();
}

async function clonePromisorRepo(config) {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'msr-sync-'));
  const repoUrl = `https://github.com/${config.owner}/${config.repo}.git`;

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await runGit(
        ['clone', '--depth', '1', '--filter=blob:none', '--no-checkout', repoUrl, tmp],
        repoRoot,
      );
      return tmp;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }

  throw lastError;
}

function filePathForIcon(iconName, target) {
  return `symbols/web/${iconName}/${target.symbolFamily}/${iconName}${target.variant.fileSuffix}`;
}

// Each target reads one upstream file per icon, identified by its style family and file suffix.
const sourceKey = (target) => `${target.symbolFamily}/${target.variant.fileSuffix}`;

// Upstream snapshot: the SVGs for every target at the pinned ref, stored in a local cache directory
// (default .cache/material-symbols/<ref>, override with MSR_SVG_CACHE_DIR). CI caches this directory
// keyed on the pinned ref, so a warm run needs no network at all. A cold run clones once (blobless),
// lists the tree once, and fetches exactly the needed blobs in one batch instead of a sparse checkout.
function snapshotDirFor(config) {
  return process.env.MSR_SVG_CACHE_DIR
    ? path.resolve(repoRoot, process.env.MSR_SVG_CACHE_DIR)
    : path.join(repoRoot, '.cache/material-symbols', config.ref);
}

function parseCatFileBatch(buffer) {
  const blobs = new Map();
  let offset = 0;
  while (offset < buffer.length) {
    const headerEnd = buffer.indexOf(0x0a, offset);
    const [oid, type, size] = buffer.subarray(offset, headerEnd).toString('utf8').split(' ');
    if (type !== 'blob') throw new Error(`Unexpected git object for ${oid}: ${type}`);
    const start = headerEnd + 1;
    const end = start + Number(size);
    blobs.set(oid, buffer.subarray(start, end));
    offset = end + 1;
  }
  return blobs;
}

function runGitWithStdin(args, cwd, input, { captureStdout = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('git', args, {
      cwd,
      stdio: ['pipe', captureStdout ? 'pipe' : 'ignore', 'inherit'],
    });
    const chunks = [];
    child.stdout?.on('data', (chunk) => chunks.push(chunk));
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0
        ? resolve(Buffer.concat(chunks))
        : reject(new Error(`git ${args.join(' ')} failed (exit ${code})`)),
    );
    child.stdin.end(input);
  });
}

async function createSnapshot(config, targets, snapshotDir) {
  const tmp = await clonePromisorRepo(config);
  try {
    await runGit(
      ['fetch', '--quiet', '--depth', '1', '--filter=blob:none', '--no-tags', 'origin', config.ref],
      tmp,
    );
    // Default `<mode> <type> <oid>\t<path>` entries, not `--format` (git >= 2.36): build images
    // such as Cloudflare Pages v3 ship git 2.34.
    const tree = await runGitRead(['ls-tree', '-r', '-z', config.ref, 'symbols/web'], tmp);

    const sources = targets.map(sourceKey);
    const wanted = [];
    for (const entry of tree.split('\0')) {
      const tab = entry.indexOf('\t');
      if (tab === -1) continue;
      const [, type, oid] = entry.slice(0, tab).split(' ');
      if (type !== 'blob') continue;
      const filePath = entry.slice(tab + 1);
      const match = filePath.match(/^symbols\/web\/([^/]+)\/([^/]+)\/(.+)$/);
      if (!match) continue;
      const [, iconName, family, fileName] = match;
      if (
        targets.some(
          (target) =>
            target.symbolFamily === family &&
            fileName === `${iconName}${target.variant.fileSuffix}`,
        )
      )
        wanted.push({ oid, filePath });
    }
    if (wanted.length === 0)
      throw new Error(`No upstream SVGs found for any target at ${config.ref}`);

    // One batched fetch of exactly the needed blobs; noop negotiation skips the commit walk.
    const oidList = `${wanted.map(({ oid }) => oid).join('\n')}\n`;
    await runGitWithStdin(
      [
        '-c',
        'fetch.negotiationAlgorithm=noop',
        'fetch',
        '--quiet',
        '--no-tags',
        '--no-write-fetch-head',
        '--filter=blob:none',
        '--stdin',
        'origin',
      ],
      tmp,
      oidList,
    );
    const blobs = parseCatFileBatch(
      await runGitWithStdin(['cat-file', '--batch'], tmp, oidList, { captureStdout: true }),
    );
    const sha = await runGitRead(['rev-parse', `${config.ref}^{commit}`], tmp);
    const committedAt = await runGitRead(['log', '-1', '--format=%cI', config.ref], tmp);

    const staging = `${snapshotDir}.tmp-${process.pid}`;
    await fs.rm(staging, { recursive: true, force: true });
    for (const { oid, filePath } of wanted) {
      const dest = path.join(staging, filePath);
      await ensureDir(path.dirname(dest));
      await fs.writeFile(dest, blobs.get(oid));
    }
    const manifest = {
      ref: config.ref,
      sha,
      committedAt,
      sources: [...new Set(sources)].sort((a, b) => a.localeCompare(b)),
      files: wanted.map(({ filePath }) => filePath).sort(),
    };
    await fs.writeFile(
      path.join(staging, 'snapshot.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
      'utf8',
    );
    await fs.rm(snapshotDir, { recursive: true, force: true });
    await ensureDir(path.dirname(snapshotDir));
    await fs.rename(staging, snapshotDir);
    console.log(
      `Created upstream SVG snapshot ${path.relative(repoRoot, snapshotDir) || snapshotDir} (${wanted.length} files)`,
    );
    return manifest;
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
}

function isUsableSnapshot(manifest, config, targets) {
  const sources = new Set(manifest.sources ?? []);
  return (
    manifest.ref === config.ref &&
    Array.isArray(manifest.files) &&
    targets.every((target) => sources.has(sourceKey(target)))
  );
}

async function loadSnapshot(config, targets) {
  const snapshotDir = snapshotDirFor(config);
  try {
    const manifest = JSON.parse(await fs.readFile(path.join(snapshotDir, 'snapshot.json'), 'utf8'));
    if (isUsableSnapshot(manifest, config, targets)) {
      console.log(
        `Using cached upstream SVG snapshot ${path.relative(repoRoot, snapshotDir) || snapshotDir}`,
      );
      return { dir: snapshotDir, manifest };
    }
  } catch {
    // No usable snapshot; create it below.
  }
  const manifest = await createSnapshot(config, targets, snapshotDir);
  return { dir: snapshotDir, manifest };
}

function discoverIconNames(snapshot, target) {
  const iconNames = [];
  for (const filePath of snapshot.manifest.files) {
    const match = filePath.match(/^symbols\/web\/([^/]+)\/([^/]+)\/(.+)$/);
    if (
      match &&
      match[2] === target.symbolFamily &&
      match[3] === `${match[1]}${target.variant.fileSuffix}`
    )
      iconNames.push(match[1]);
  }
  return [...new Set(iconNames)].sort((a, b) => a.localeCompare(b));
}

async function readIconList(args, snapshot, target) {
  if (args.iconsFile) {
    const raw = await fs.readFile(args.iconsFile, 'utf8');
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return discoverIconNames(snapshot, target);
}

async function clearGeneratedFiles(generatedDir) {
  await ensureDir(generatedDir);
  const existing = await fs.readdir(generatedDir);
  await Promise.all(
    existing
      .filter((name) => name.endsWith('.ts'))
      .map((name) => fs.unlink(path.join(generatedDir, name))),
  );
}

async function removeFileIfExists(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

async function writeLines(filePath, lines) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${lines.join('\n')}\n`, 'utf8');
}

async function generateForTarget(args, config, target, snapshot, inputsHash) {
  const paths = generatedPaths(repoRoot, target);
  const collisionReportPath = path.join(repoRoot, `tools/icons/collision-report-${target.id}.txt`);
  const missingReportPath = path.join(repoRoot, `tools/icons/missing-report-${target.id}.txt`);

  const discoveredOrRequested = await readIconList(args, snapshot, target);
  const selected = args.limit ? discoveredOrRequested.slice(0, args.limit) : discoveredOrRequested;

  if (selected.length === 0)
    throw new Error(`No icons selected for generation for target: ${target.id}`);

  const collisions = new Map();
  for (const iconName of selected) {
    const selector = `${target.selectorPrefix}-${iconName.replaceAll('_', '-')}-icon`;
    collisions.set(selector, (collisions.get(selector) ?? 0) + 1);
  }

  const duplicates = [...collisions.entries()]
    .filter(([, count]) => count > 1)
    .map(([name]) => name);
  if (duplicates.length > 0) {
    await writeLines(collisionReportPath, ['Selector collisions detected:', ...duplicates]);
    throw new Error(`Selector collision detected for ${target.id}. See ${collisionReportPath}`);
  }

  await removeFileIfExists(collisionReportPath);

  // Drop the stamp first so a failed run never leaves half-written output marked as fresh.
  await removeStamp(repoRoot, target);
  await clearGeneratedFiles(paths.generatedDir);

  const missing = [];
  const generated = [];

  for (const iconName of selected) {
    const relativeSvgPath = filePathForIcon(iconName, target);
    const svgPath = path.join(snapshot.dir, relativeSvgPath);

    let svgText;
    try {
      svgText = await fs.readFile(svgPath, 'utf8');
    } catch {
      missing.push(iconName);
      continue;
    }

    const { viewBox, inner } = sanitizeSvg(svgText, {
      targetId: target.id,
      iconName,
      sourcePath: relativeSvgPath,
    });
    const className = `${target.classPrefix}${toPascalCase(iconName)}IconComponent`;
    const fileName = `${iconName.replaceAll('_', '-')}.icon.ts`;
    const selector = `${target.selectorPrefix}-${iconName.replaceAll('_', '-')}-icon`;

    await fs.writeFile(
      path.join(paths.generatedDir, fileName),
      componentSource({
        selector,
        className,
        viewBox,
        innerSvg: inner,
        classPrefix: target.classPrefix,
        directivePrefix: target.directivePrefix,
      }),
      'utf8',
    );

    generated.push({ iconName, className, fileName });
  }

  if (generated.length === 0) {
    throw new Error(
      `No icons were generated for ${target.id}. Check variant suffix and upstream paths.`,
    );
  }

  if (missing.length > 0) {
    await writeLines(missingReportPath, ['Missing icons for target:', target.id, ...missing]);
  } else {
    await removeFileIfExists(missingReportPath);
  }

  // Icon components are published only through per-icon subpaths; the root entry carries just the names.
  // Names are per style (both fill packages of a style export the same MSR_/MSO_/MSS_ICON_NAMES).
  const namesConst = `${target.namesPrefix.toUpperCase()}_ICON_NAMES`;
  const nameType = `${target.namesPrefix}IconName`;
  const indexContent = `export const ${namesConst} = [
${generated.map(({ iconName }) => `  '${iconName}',`).join('\n')}
] as const;

export type ${nameType} = (typeof ${namesConst})[number];
`;

  const componentMapContent = `import { Type } from '@angular/core';
import { ${nameType} } from './index';
${generated
  .map(
    ({ fileName, className }) =>
      `import { ${className} } from './generated/${fileName.replace(/\.ts$/, '')}';`,
  )
  .join('\n')}

export const ${target.namesPrefix.toUpperCase()}_ICON_COMPONENTS: Type<unknown>[] = [
${generated.map(({ className }) => `  ${className},`).join('\n')}
];

export const ${target.namesPrefix.toUpperCase()}_ICON_COMPONENT_MAP: Record<${nameType}, Type<unknown>> = {
${generated.map(({ iconName, className }) => `  '${iconName}': ${className},`).join('\n')}
};
`;

  await ensureDir(path.dirname(paths.generatedIndexPath));
  await fs.writeFile(paths.generatedIndexPath, indexContent, 'utf8');
  await fs.writeFile(paths.generatedComponentMapPath, componentMapContent, 'utf8');

  const { sha } = snapshot.manifest;
  // Git versions disagree on the UTC suffix of %cI (`Z` vs `+00:00`); normalize so output is stable.
  const committedAt = new Date(snapshot.manifest.committedAt).toISOString().replace(/\.000Z$/, 'Z');

  const manifest = `export const ICON_MANIFEST = {
  packageName: '${target.packageName}',
  style: '${target.style}',
  source: {
    owner: '${config.owner}',
    repo: '${config.repo}',
    ref: '${config.ref}',
    resolvedSha: '${sha}',
    resolvedCommittedAt: '${committedAt}',
  },
  variant: {
    fill: ${target.variant.fill},
    wght: ${target.variant.wght},
    grad: ${target.variant.grad},
    opsz: ${target.variant.opsz},
  },
  iconCount: ${generated.length},
} as const;
`;

  await ensureDir(path.dirname(paths.manifestPath));
  await fs.writeFile(paths.manifestPath, manifest, 'utf8');
  await writeStamp(repoRoot, target, {
    inputsHash,
    iconCount: generated.length,
    complete: !args.iconsFile && !args.limit,
  });

  console.log(
    `[${target.id}] Generated ${generated.length} icons from ${config.owner}/${config.repo}@${sha}` +
      (missing.length > 0
        ? ` (${missing.length} missing; see ${path.relative(repoRoot, missingReportPath)})`
        : ''),
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
  validateUpstreamPolicy(config);
  const targets = Object.values(config.targets ?? {});

  if (targets.length === 0) {
    throw new Error('No targets configured in tools/icons/upstream.json');
  }

  const selectedTargets =
    args.target === 'all' ? targets : targets.filter((target) => target.id === args.target);

  if (selectedTargets.length === 0) {
    throw new Error(
      `Unknown target "${args.target}". Available targets: ${targets.map((t) => t.id).join(', ')}`,
    );
  }

  const snapshot = await loadSnapshot(config, targets);
  const inputsHash = await computeInputsHash(repoRoot);
  for (const target of selectedTargets) {
    await generateForTarget(args, config, target, snapshot, inputsHash);
  }
}

main().catch((error) => {
  if (error instanceof SvgSanitizationError) {
    console.error(formatSanitizationError(error));
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
