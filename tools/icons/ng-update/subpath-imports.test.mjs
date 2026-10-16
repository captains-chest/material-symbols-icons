import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'vite-plus/test';

const { migrate, migrateSource } = createRequire(import.meta.url)('./subpath-imports.js');

const packageName = '@captains-chest/material-symbols-rounded-icons';
const config = {
  packageName,
  subpaths: { MsrHomeIconComponent: 'home', MsrArrowBackIconComponent: 'arrow-back' },
};

test('splits icon specifiers into per-icon imports and keeps the rest on the root', () => {
  const { code, warnings } = migrateSource(
    `import {
  MsrHomeIconComponent,
  MSR_ICON_NAMES, // names stay on the root
  MsrArrowBackIconComponent as Back,
} from '${packageName}';
`,
    config,
  );
  assert.equal(
    code,
    `import { MSR_ICON_NAMES } from '${packageName}';
import { MsrHomeIconComponent } from '${packageName}/home';
import { MsrArrowBackIconComponent as Back } from '${packageName}/arrow-back';
`,
  );
  assert.deepEqual(warnings, []);
});

test('preserves quotes, semicolons, indentation, type-only imports and re-exports', () => {
  const { code } = migrateSource(
    `  import type { MsrHomeIconComponent } from "${packageName}"
export { type MsrArrowBackIconComponent, MsrHomeIconComponent } from "${packageName}";
`,
    config,
  );
  assert.equal(
    code,
    `  import type { MsrHomeIconComponent } from "${packageName}/home"
export { type MsrArrowBackIconComponent } from "${packageName}/arrow-back";
export { MsrHomeIconComponent } from "${packageName}/home";
`,
  );
});

test('leaves other packages, subpaths and non-icon imports untouched', () => {
  const source = `import { MsrfHomeIconComponent } from '${packageName}-filled';
import { MsrHomeIconComponent } from '${packageName}/home';
import { MsrIconHostDirective, MSR_ICON_STYLES } from '${packageName}';
`;
  assert.equal(migrateSource(source, config).code, source);
});

test('warns about namespace and dynamic imports it cannot rewrite', () => {
  const { warnings } = migrateSource(
    `import * as icons from '${packageName}';
const lazy = () => import('${packageName}');
`,
    config,
  );
  assert.equal(warnings.length, 2);
});

test('rule rewrites workspace sources and skips declarations and node_modules', () => {
  const files = new Map([
    ['/src/app.ts', `import { MsrHomeIconComponent } from '${packageName}';\n`],
    ['/src/app.d.ts', `import { MsrHomeIconComponent } from '${packageName}';\n`],
    ['/node_modules/x/index.js', `import { MsrHomeIconComponent } from '${packageName}';\n`],
  ]);
  const tree = {
    visit: (visitor) => [...files.keys()].forEach((file) => visitor(file)),
    read: (file) => Buffer.from(files.get(file)),
    overwrite: (file, content) => files.set(file, content),
  };
  const logger = { info: () => {}, warn: () => {} };
  migrate({}, config)(tree, { logger });

  assert.equal(
    files.get('/src/app.ts'),
    `import { MsrHomeIconComponent } from '${packageName}/home';\n`,
  );
  assert.match(files.get('/src/app.d.ts'), new RegExp(`'${packageName}';`));
  assert.match(files.get('/node_modules/x/index.js'), new RegExp(`'${packageName}';`));
});
