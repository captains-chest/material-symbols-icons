#!/usr/bin/env node
// Post-build step for `ng build <library>`: emits one ES module (+ .d.ts) per icon under esm2022/ so consumers can
// import single icons from per-icon subpaths, e.g. '@captains-chest/material-symbols-rounded-icons/home'.
// The "./*" subpath export lives in the project's package.json; ng-packagr merges it next to the "." FESM entry.
// ngc runs with the library's prod tsconfig (compilationMode: partial), the same metadata format as the FESM.
// Usage: node tools/icons/emit-icon-entry-points.mjs --project projects/<name> --dist dist/<name>
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--project') args.project = argv[++i];
    else if (argv[i] === '--dist') args.dist = argv[++i];
  }
  if (!args.project || !args.dist) {
    throw new Error(
      'Usage: emit-icon-entry-points.mjs --project projects/<name> --dist dist/<name>',
    );
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const projectDir = path.resolve(repoRoot, args.project);
const distDir = path.resolve(repoRoot, args.dist);
const tmpDir = path.join(repoRoot, 'out-tsc', `icon-entry-points-${path.basename(projectDir)}`);
const outDir = path.join(distDir, 'esm2022');
const iconsDir = path.join('lib', 'icons', 'generated');
const sharedDir = path.join('lib', 'shared');

fs.rmSync(tmpDir, { recursive: true, force: true });
execFileSync(
  path.join(repoRoot, 'node_modules/.bin/ngc'),
  [
    '-p',
    path.join(projectDir, 'tsconfig.lib.prod.json'),
    '--outDir',
    tmpDir,
    '--rootDir',
    path.join(projectDir, 'src'),
    '--declaration',
    'true',
  ],
  { stdio: 'inherit' },
);

const [hostDirective] = fs
  .readdirSync(path.join(tmpDir, sharedDir))
  .filter((file) => file.endsWith('-icon-host.directive.js'));
if (!hostDirective)
  throw new Error(`emit-icon-entry-points: no *-icon-host.directive.js in ${sharedDir}`);

// Node ESM and TypeScript node16 resolution need explicit file specifiers: '../../shared/x' -> '../../shared/x.js'.
const relativeSpecifier = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]+)\2/g;
const rewriteSpecifiers = (code, file) =>
  code.replace(relativeSpecifier, (_match, prefix, quote, specifier) => {
    if (!fs.existsSync(`${path.resolve(path.dirname(file), specifier)}.js`)) {
      throw new Error(
        `emit-icon-entry-points: cannot resolve ${specifier} from ${path.relative(tmpDir, file)}`,
      );
    }
    return `${prefix}${quote}${specifier}.js${quote}`;
  });

// Each icon subpath re-exports the shared host directive: the consumer's Angular compiler references host
// directives through the module the component was imported from.
const hostReexport = `export * from '../../shared/${hostDirective}';\n`;

fs.rmSync(outDir, { recursive: true, force: true });
let icons = 0;
for (const dir of [sharedDir, iconsDir]) {
  fs.mkdirSync(path.join(outDir, dir), { recursive: true });
  for (const file of fs.readdirSync(path.join(tmpDir, dir))) {
    if (!file.endsWith('.js') && !file.endsWith('.d.ts')) continue;
    const src = path.join(tmpDir, dir, file);
    let code = rewriteSpecifiers(fs.readFileSync(src, 'utf8'), src).replace(
      /\n?\/\/# sourceMappingURL=.*$/m,
      '',
    );
    if (dir === iconsDir) {
      code = `${code.trimEnd()}\n${hostReexport}`;
      if (file.endsWith('.js')) icons += 1;
    }
    fs.writeFileSync(path.join(outDir, dir, file), code);
  }
}

fs.rmSync(tmpDir, { recursive: true, force: true });
const pkg = JSON.parse(fs.readFileSync(path.join(distDir, 'package.json'), 'utf8'));
if (!pkg.exports?.['./*']?.default?.startsWith('./esm2022/')) {
  throw new Error(
    `emit-icon-entry-points: ${path.relative(repoRoot, distDir)}/package.json lacks the "./*" esm2022 export`,
  );
}
console.log(
  `emit-icon-entry-points: wrote ${icons} per-icon entry points to ${path.relative(repoRoot, outDir)}`,
);
