#!/usr/bin/env node
// Post-build step for `ng build <library>`: emits one ES module (+ .d.ts) per icon to icons/<name>.js, served through
// the "./*" subpath export, e.g. '@captains-chest/material-symbols-rounded-icons/home'. The root entry only carries
// the shared directives, styles, manifest and names. Icon modules import the shared directives from the package
// root by name, so every icon shares one directive instance and consumers resolve host directives through the root.
// ngc runs with the library's prod tsconfig (compilationMode: partial), the same metadata format as the FESM.
// Also packages the `ng update` migration (schematics/) with the class name -> subpath map it needs.
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
const iconsOutDir = path.join(distDir, 'icons');
const schematicsOutDir = path.join(distDir, 'schematics');
const iconsDir = path.join(tmpDir, 'lib', 'icons', 'generated');
const pkg = JSON.parse(fs.readFileSync(path.join(distDir, 'package.json'), 'utf8'));

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

// '../../shared/msr-icon-host.directive' -> '@captains-chest/material-symbols-rounded-icons'
const relativeSpecifier = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]+)\2/g;
const toPackageRoot = (code, file) =>
  code.replace(relativeSpecifier, (_match, prefix, quote, specifier) => {
    if (!specifier.startsWith('../../shared/')) {
      throw new Error(
        `emit-icon-entry-points: unexpected relative import ${specifier} in ${path.relative(tmpDir, file)}`,
      );
    }
    return `${prefix}${quote}${pkg.name}${quote}`;
  });

fs.rmSync(iconsOutDir, { recursive: true, force: true });
fs.mkdirSync(iconsOutDir, { recursive: true });
const subpaths = {};
for (const file of fs.readdirSync(iconsDir)) {
  const match = file.match(/^(.+)\.icon\.(js|d\.ts)$/);
  if (!match) continue;
  const [, subpath, extension] = match;
  const src = path.join(iconsDir, file);
  const code = toPackageRoot(fs.readFileSync(src, 'utf8'), src).replace(
    /\n?\/\/# sourceMappingURL=.*$/m,
    '',
  );
  fs.writeFileSync(path.join(iconsOutDir, `${subpath}.${extension}`), code);
  if (extension === 'js') {
    const className = code.match(/\bexport class (\w+IconComponent)\b/)?.[1];
    if (!className) throw new Error(`emit-icon-entry-points: no icon component class in ${file}`);
    subpaths[className] = subpath;
  }
}
fs.rmSync(tmpDir, { recursive: true, force: true });

const migrationDir = path.join(repoRoot, 'tools/icons/ng-update');
fs.rmSync(schematicsOutDir, { recursive: true, force: true });
fs.mkdirSync(schematicsOutDir, { recursive: true });
for (const file of ['migration.json', 'package.json', 'subpath-imports.js'])
  fs.copyFileSync(path.join(migrationDir, file), path.join(schematicsOutDir, file));
fs.writeFileSync(
  path.join(schematicsOutDir, 'icon-subpaths.json'),
  `${JSON.stringify({ packageName: pkg.name, subpaths })}\n`,
);

if (pkg.exports?.['./*']?.default !== './icons/*.js') {
  throw new Error(
    `emit-icon-entry-points: ${path.relative(repoRoot, distDir)}/package.json lacks the "./*": "./icons/*.js" export`,
  );
}
if (pkg['ng-update']?.migrations !== './schematics/migration.json') {
  throw new Error(
    `emit-icon-entry-points: ${path.relative(repoRoot, distDir)}/package.json lacks "ng-update" migrations`,
  );
}
console.log(
  `emit-icon-entry-points: wrote ${Object.keys(subpaths).length} icon entry points to ${path.relative(repoRoot, iconsOutDir)}`,
);
