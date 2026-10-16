import { defineConfig } from 'vite-plus';

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
const libraryBuild = (script: string, distDir: string) => ({
  command: `pnpm ${script}`,
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
        command: 'echo "Built outline and filled libraries"',
        dependsOn: ['lib:outline', 'lib:filled'],
        cache: false,
      },
      'lib:outline': libraryBuild('build:lib:outline', 'dist/material-symbols-rounded-icons'),
      'lib:filled': libraryBuild('build:lib:filled', 'dist/material-symbols-rounded-icons-filled'),
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
