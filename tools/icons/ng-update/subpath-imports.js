// `ng update` migration for 3.0.0: icon components are no longer exported from the package root.
// Rewrites `import { MsrHomeIconComponent } from '<package>'` to `import { MsrHomeIconComponent } from '<package>/home'`
// and keeps every other specifier on the root import. Copied into dist/<package>/schematics by the library build,
// next to icon-subpaths.json ({ packageName, subpaths: { ClassName: subpath } }).
'use strict';

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function splitSpecifiers(list) {
  return list
    .replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '')
    .split(',')
    .map((specifier) => specifier.trim())
    .filter(Boolean);
}

// The exported name of a specifier: `type Foo as Bar` -> `Foo`.
const importedName = (specifier) =>
  specifier
    .replace(/^type\s+/, '')
    .split(/\s+as\s+/)[0]
    .trim();

/**
 * Rewrites one source file. Returns the new source plus warnings for usages that need a manual change.
 * @param {string} source
 * @param {{ packageName: string, subpaths: Record<string, string> }} config
 */
function migrateSource(source, { packageName, subpaths }) {
  const warnings = [];
  const pkg = escapeRegExp(packageName);
  const statement = new RegExp(
    `(^|\\n)([ \\t]*)(import|export)(\\s+type)?\\s*\\{([^}]*)\\}\\s*from\\s*(['"])${pkg}\\6([ \\t]*;)?`,
    'g',
  );

  const code = source.replace(
    statement,
    (match, lineStart, indent, keyword, typeOnly = '', list, quote, semicolon = '') => {
      const specifiers = splitSpecifiers(list);
      const icons = specifiers.filter((specifier) => subpaths[importedName(specifier)]);
      if (icons.length === 0) return match;

      const rest = specifiers.filter((specifier) => !icons.includes(specifier));
      const end = semicolon ? ';' : '';
      const line = (names, from) =>
        `${indent}${keyword}${typeOnly} { ${names.join(', ')} } from ${quote}${from}${quote}${end}`;
      const lines = [
        ...(rest.length ? [line(rest, packageName)] : []),
        ...icons.map((specifier) =>
          line([specifier], `${packageName}/${subpaths[importedName(specifier)]}`),
        ),
      ];
      return `${lineStart}${lines.join('\n')}`;
    },
  );

  const namespace = new RegExp(`(import|export)\\s*\\*\\s*(as\\s+\\w+\\s*)?from\\s*['"]${pkg}['"]`);
  if (namespace.test(code)) {
    warnings.push(
      `namespace import/export of '${packageName}' no longer includes icon components; import icons from '${packageName}/<icon>'.`,
    );
  }
  if (new RegExp(`import\\(\\s*['"]${pkg}['"]\\s*\\)`).test(code)) {
    warnings.push(
      `dynamic import('${packageName}') no longer includes icon components; use import('${packageName}/<icon>').`,
    );
  }
  return { code, warnings };
}

const sourceFile = /\.(?:[cm]?ts|tsx|[cm]?js|jsx)$/;

function migrate(_options, config = require('./icon-subpaths.json')) {
  return (tree, context) => {
    let files = 0;
    tree.visit((filePath) => {
      if (
        !sourceFile.test(filePath) ||
        filePath.endsWith('.d.ts') ||
        /\/(node_modules|dist|\.angular)\//.test(filePath)
      )
        return;
      const source = tree.read(filePath)?.toString('utf8');
      if (!source || !source.includes(config.packageName)) return;
      const { code, warnings } = migrateSource(source, config);
      for (const warning of warnings) context.logger.warn(`${filePath}: ${warning}`);
      if (code !== source) {
        tree.overwrite(filePath, code);
        files += 1;
      }
    });
    context.logger.info(
      `${config.packageName}: moved icon imports to per-icon subpaths in ${files} file(s).`,
    );
  };
}

module.exports = { migrate, migrateSource };
