#!/usr/bin/env node
// Post-build step: publish per-file ES modules (partial-compiled by ngc, same Angular metadata as the FESM)
// behind the single "." entry point, instead of one flat FESM file.
// Usage: node tools/icons/unflatten-esm.mjs --project projects/<name> --dist dist/<name>
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, a) => (v.startsWith('--') ? [...acc, [v.slice(2), a[i + 1]]] : acc), []));
const repoRoot = process.cwd();
const project = path.resolve(repoRoot, args.project);
const dist = path.resolve(repoRoot, args.dist);
const tmp = path.join(repoRoot, 'out-tsc', `esm-${path.basename(project)}`);
fs.rmSync(tmp, { recursive: true, force: true });

execFileSync(path.join(repoRoot, 'node_modules/.bin/ngc'), ['-p', path.join(project, 'tsconfig.lib.prod.json'), '--outDir', tmp, '--rootDir', path.join(project, 'src'), '--declaration', 'false'], { stdio: 'inherit' });

const outDir = path.join(dist, 'esm2022');
fs.rmSync(outDir, { recursive: true, force: true });
const specifier = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]+)\2/g;
let files = 0;
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const src = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(src); continue; }
    if (!entry.name.endsWith('.js')) continue;
    const rel = path.relative(tmp, src);
    const code = fs.readFileSync(src, 'utf8').replace(specifier, (m, pre, q, spec) => {
      const target = path.resolve(path.dirname(src), spec);
      if (fs.existsSync(`${target}.js`)) return `${pre}${q}${spec}.js${q}`;
      if (fs.existsSync(path.join(target, 'index.js'))) return `${pre}${q}${spec}/index.js${q}`;
      throw new Error(`Cannot resolve ${spec} from ${rel}`);
    }).replace(/\n?\/\/# sourceMappingURL=.*$/m, '');
    const dest = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, code);
    files += 1;
  }
};
walk(tmp);

// component-map.js is Storybook-only and not reachable from the public API.
fs.rmSync(path.join(outDir, 'lib/icons/component-map.js'), { force: true });

const pkgPath = path.join(dist, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const entry = './esm2022/public-api.js';
pkg.module = entry;
pkg.exports['.'].default = entry;
pkg.files = [...pkg.files.filter((f) => !f.startsWith('fesm2022')), 'esm2022/**/*.js'];
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
fs.rmSync(path.join(dist, 'fesm2022'), { recursive: true, force: true });
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`unflatten-esm: wrote ${files} ES modules to ${path.relative(repoRoot, outDir)}`);
