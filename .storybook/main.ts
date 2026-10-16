import type { StorybookConfig } from '@storybook/angular';
import type { StorybookConfigVite } from '@storybook/builder-vite';
import { mergeConfig, type UserConfig } from 'vite';

const config: StorybookConfig & StorybookConfigVite = {
  stories: ['../stories/**/*.stories.ts'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  core: {
    builder: '@storybook/builder-vite',
  },
  async viteFinal(baseConfig: UserConfig) {
    return mergeConfig(baseConfig, {
      // Vite 8 transpiles TS with Oxc, which leaves decorators untouched unless
      // legacy (experimentalDecorators) lowering is enabled. Without this, the
      // stories' @Component ships as raw `@n(...)` and the chunk fails to parse.
      oxc: {
        decorator: {
          legacy: true,
        },
      },
      define: {
        STORYBOOK_ANGULAR_OPTIONS: {
          experimentalZoneless: true,
        },
      },
    });
  },
};

export default config;
