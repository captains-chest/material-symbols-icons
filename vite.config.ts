import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { defineConfig } from 'vite-plus';

// One library build task per package target (`lib:rounded`, `lib:sharp-filled`, ...).
const iconTargets: Record<string, { projectPath: string }> = JSON.parse(
  readFileSync('tools/icons/upstream.json', 'utf8'),
).targets;

// Generator output, produced by `pnpm icons:ensure` / `pnpm stories:ensure` and ignored by git. Formatting
// these files would make them diverge from the generator.
const generatedSources = [
  'projects/*/src/lib/icons/**',
  'projects/*/src/lib/generated/**',
  'stories/generated/**',
];
const buildOutputs = ['dist/**', 'storybook-static/**', '.angular/**', '.cache/**'];

// ng-packagr reads its own `.angular` cache and the sourcemap strip step rewrites
// `dist/`, so both are excluded from the inputs to keep the task cacheable.
const libraryBuild = (targetId: string, distDir: string) => ({
  command: `node tools/icons/build-library.mjs ${targetId}`,
  dependsOn: ['icons'],
  cache: {
    input: [{ auto: true }, '!dist/**', '!.angular/**'],
    output: [`${distDir}/**`],
  },
});

export default defineConfig({
  run: {
    tasks: {
      // Cheap freshness check; regenerates icon sources only when missing or stale.
      icons: {
        command: 'pnpm icons:ensure',
        cache: false,
      },
      lib: {
        command: 'echo "Built all icon libraries"',
        dependsOn: Object.keys(iconTargets).map((id) => `lib:${id}`),
        cache: false,
      },
      ...Object.fromEntries(
        Object.entries(iconTargets).map(([id, { projectPath }]) => [
          `lib:${id}`,
          libraryBuild(id, `dist/${basename(projectPath)}`),
        ]),
      ),
    },
  },
  test: {
    include: ['tools/**/*.test.mjs'],
    testTimeout: 60_000,
  },
  lint: {
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    ignorePatterns: [...generatedSources, ...buildOutputs],
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {
    printWidth: 100,
    singleQuote: true,
    sortPackageJson: false,
    associations: [
      {
        files: ['*.html'],
        language: 'angular-html',
      },
    ],
    ignorePatterns: [...generatedSources, ...buildOutputs, 'pnpm-lock.yaml'],
  },
});
