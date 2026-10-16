#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
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
  const hostClass = `${directivePrefix}-icon`;
  const svgClass = `${directivePrefix}-icon-svg`;
  return `import { Component, input } from '@angular/core';
import { ${classPrefix}IconHostDirective } from '../../shared/${directivePrefix}-icon-host.directive';
import { ${classPrefix}IconSvgDirective } from '../../shared/${directivePrefix}-icon-svg.directive';

@Component({
  selector: '${selector}',
  imports: [${classPrefix}IconSvgDirective],
  hostDirectives: [${classPrefix}IconHostDirective],
  styles: [\`
    :host.${hostClass} {
      display: inline-flex;
      flex: 0 0 auto;
    }

    :host(:where(.${hostClass})) {
      inline-size: var(--${hostClass}-size, 1em);
      block-size: var(--${hostClass}-size, 1em);
    }

    .${svgClass} {
      display: block;
      inline-size: 100%;
      block-size: 100%;
      fill: currentColor;
    }
  \`],
  template: \
\`<svg
  ${directivePrefix}IconSvg
  focusable="false"
  [attr.viewBox]="'${viewBox}'"
  [attr.aria-hidden]="ariaLabel() ? null : 'true'"
  [attr.aria-label]="ariaLabel()"
  [attr.role]="ariaLabel() ? 'img' : null"
>
  ${escapedInner}
</svg>\`,
})
export class ${className} {
  readonly ariaLabel = input<string | null>(null);
}
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
    violations.push({ code: 'unexpected-owner', expected: UPSTREAM_POLICY.owner, actual: config.owner });
  }
  if (config.repo !== UPSTREAM_POLICY.repo) {
    violations.push({ code: 'unexpected-repo', expected: UPSTREAM_POLICY.repo, actual: config.repo });
  }
  if (!UPSTREAM_POLICY.refPattern.test(config.ref ?? '')) {
    violations.push({ code: 'mutable-ref', expected: '40-character lowercase git commit SHA', actual: config.ref });
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
      await runGit(['clone', '--depth', '1', '--filter=blob:none', '--no-checkout', repoUrl, tmp], repoRoot);
      return tmp;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }

  throw lastError;
}

function filePathForIcon(iconName, config, target) {
  return `symbols/web/${iconName}/${config.symbolFamily}/${iconName}${target.variant.fileSuffix}`;
}

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
    const child = spawn('git', args, { cwd, stdio: ['pipe', captureStdout ? 'pipe' : 'ignore', 'inherit'] });
    const chunks = [];
    child.stdout?.on('data', (chunk) => chunks.push(chunk));
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0 ? resolve(Buffer.concat(chunks)) : reject(new Error(`git ${args.join(' ')} failed (exit ${code})`)),
    );
    child.stdin.end(input);
  });
}

async function createSnapshot(config, targets, snapshotDir) {
  const tmp = await clonePromisorRepo(config);
  try {
    await runGit(['fetch', '--quiet', '--depth', '1', '--filter=blob:none', '--no-tags', 'origin', config.ref], tmp);
    const tree = await runGitRead(['ls-tree', '-r', '--format=%(objectname) %(path)', config.ref, 'symbols/web'], tmp);

    const suffixes = targets.map((target) => target.variant.fileSuffix);
    const wanted = [];
    for (const line of tree.split(/\r?\n/)) {
      const space = line.indexOf(' ');
      const oid = line.slice(0, space);
      const filePath = line.slice(space + 1);
      const match = filePath.match(/^symbols\/web\/([^/]+)\/([^/]+)\/(.+)$/);
      if (!match || match[2] !== config.symbolFamily) continue;
      if (suffixes.some((suffix) => match[3] === `${match[1]}${suffix}`)) wanted.push({ oid, filePath });
    }
    if (wanted.length === 0) throw new Error(`No upstream SVGs found for ${config.symbolFamily} at ${config.ref}`);

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
    const blobs = parseCatFileBatch(await runGitWithStdin(['cat-file', '--batch'], tmp, oidList, { captureStdout: true }));
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
      symbolFamily: config.symbolFamily,
      fileSuffixes: [...suffixes].sort(),
      files: wanted.map(({ filePath }) => filePath).sort(),
    };
    await fs.writeFile(path.join(staging, 'snapshot.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    await fs.rm(snapshotDir, { recursive: true, force: true });
    await ensureDir(path.dirname(snapshotDir));
    await fs.rename(staging, snapshotDir);
    console.log(`Created upstream SVG snapshot ${path.relative(repoRoot, snapshotDir) || snapshotDir} (${wanted.length} files)`);
    return manifest;
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
}

function isUsableSnapshot(manifest, config, targets) {
  const suffixes = new Set(manifest.fileSuffixes ?? []);
  return (
    manifest.ref === config.ref &&
    manifest.symbolFamily === config.symbolFamily &&
    Array.isArray(manifest.files) &&
    targets.every((target) => suffixes.has(target.variant.fileSuffix))
  );
}

async function loadSnapshot(config, targets) {
  const snapshotDir = snapshotDirFor(config);
  try {
    const manifest = JSON.parse(await fs.readFile(path.join(snapshotDir, 'snapshot.json'), 'utf8'));
    if (isUsableSnapshot(manifest, config, targets)) {
      console.log(`Using cached upstream SVG snapshot ${path.relative(repoRoot, snapshotDir) || snapshotDir}`);
      return { dir: snapshotDir, manifest };
    }
  } catch {
    // No usable snapshot; create it below.
  }
  const manifest = await createSnapshot(config, targets, snapshotDir);
  return { dir: snapshotDir, manifest };
}

function discoverIconNames(snapshot, config, target) {
  const iconNames = [];
  for (const filePath of snapshot.manifest.files) {
    const match = filePath.match(/^symbols\/web\/([^/]+)\/[^/]+\/(.+)$/);
    if (match && match[2] === `${match[1]}${target.variant.fileSuffix}`) iconNames.push(match[1]);
  }
  return [...new Set(iconNames)].sort((a, b) => a.localeCompare(b));
}

async function readIconList(args, snapshot, config, target) {
  if (args.iconsFile) {
    const raw = await fs.readFile(args.iconsFile, 'utf8');
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return discoverIconNames(snapshot, config, target);
}

async function clearGeneratedFiles(generatedDir) {
  await ensureDir(generatedDir);
  const existing = await fs.readdir(generatedDir);
  await Promise.all(
    existing.filter((name) => name.endsWith('.ts')).map((name) => fs.unlink(path.join(generatedDir, name))),
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

function targetPaths(target) {
  const libRoot = path.join(repoRoot, target.projectPath, 'src/lib');
  return {
    generatedDir: path.join(libRoot, 'icons/generated'),
    generatedIndexPath: path.join(libRoot, 'icons/index.ts'),
    generatedComponentMapPath: path.join(libRoot, 'icons/component-map.ts'),
    manifestPath: path.join(libRoot, 'generated/icon-manifest.ts'),
  };
}

async function generateForTarget(args, config, target, snapshot) {
  const paths = targetPaths(target);
  const collisionReportPath = path.join(repoRoot, `tools/icons/collision-report-${target.id}.txt`);
  const missingReportPath = path.join(repoRoot, `tools/icons/missing-report-${target.id}.txt`);

  const discoveredOrRequested = await readIconList(args, snapshot, config, target);
  const selected = args.limit ? discoveredOrRequested.slice(0, args.limit) : discoveredOrRequested;

  if (selected.length === 0) throw new Error(`No icons selected for generation for target: ${target.id}`);

  const collisions = new Map();
  for (const iconName of selected) {
    const selector = `${target.selectorPrefix}-${iconName.replaceAll('_', '-')}-icon`;
    collisions.set(selector, (collisions.get(selector) ?? 0) + 1);
  }

  const duplicates = [...collisions.entries()].filter(([, count]) => count > 1).map(([name]) => name);
  if (duplicates.length > 0) {
    await writeLines(collisionReportPath, ['Selector collisions detected:', ...duplicates]);
    throw new Error(`Selector collision detected for ${target.id}. See ${collisionReportPath}`);
  }

  await removeFileIfExists(collisionReportPath);

  await clearGeneratedFiles(paths.generatedDir);

  const missing = [];
  const generated = [];

  for (const iconName of selected) {
    const relativeSvgPath = filePathForIcon(iconName, config, target);
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
    throw new Error(`No icons were generated for ${target.id}. Check variant suffix and upstream paths.`);
  }

  if (missing.length > 0) {
    await writeLines(missingReportPath, ['Missing icons for target:', target.id, ...missing]);
  } else {
    await removeFileIfExists(missingReportPath);
  }

  const indexContent = `${generated
    .map(({ fileName, className }) => `export { ${className} } from './generated/${fileName.replace(/\.ts$/, '')}';`)
    .join('\n')}

export const MSR_ICON_NAMES = [
${generated.map(({ iconName }) => `  '${iconName}',`).join('\n')}
] as const;

export type MsrIconName = (typeof MSR_ICON_NAMES)[number];
`;

  const componentMapContent = `import { Type } from '@angular/core';
import { MsrIconName } from './index';
${generated
  .map(({ fileName, className }) => `import { ${className} } from './generated/${fileName.replace(/\.ts$/, '')}';`)
  .join('\n')}

export const MSR_ICON_COMPONENTS: Type<unknown>[] = [
${generated.map(({ className }) => `  ${className},`).join('\n')}
];

export const MSR_ICON_COMPONENT_MAP: Record<MsrIconName, Type<unknown>> = {
${generated.map(({ iconName, className }) => `  '${iconName}': ${className},`).join('\n')}
};
`;

  await ensureDir(path.dirname(paths.generatedIndexPath));
  await fs.writeFile(paths.generatedIndexPath, indexContent, 'utf8');
  await fs.writeFile(paths.generatedComponentMapPath, componentMapContent, 'utf8');

  const { sha, committedAt } = snapshot.manifest;

  const manifest = `export const ICON_MANIFEST = {
  packageName: '${target.packageName}',
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

  console.log(
    `[${target.id}] Generated ${generated.length} icons from ${config.owner}/${config.repo}@${sha}` +
      (missing.length > 0 ? ` (${missing.length} missing; see ${path.relative(repoRoot, missingReportPath)})` : ''),
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
    throw new Error(`Unknown target "${args.target}". Available targets: ${targets.map((t) => t.id).join(', ')}`);
  }

  const snapshot = await loadSnapshot(config, targets);
  for (const target of selectedTargets) {
    await generateForTarget(args, config, target, snapshot);
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
