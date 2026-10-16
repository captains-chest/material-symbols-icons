import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  panelPosition: 'right',
  theme: create({
    base: 'light',
    brandTitle: 'Material Symbols Rounded',
    brandUrl: 'https://github.com/captains-chest/material-symbols-rounded-icons',
    brandTarget: '_blank',
    colorPrimary: '#6750a4',
    colorSecondary: '#6750a4',
    appBg: '#f6f5f9',
    appContentBg: '#fafafb',
    appPreviewBg: '#fafafb',
    appBorderColor: '#e5e3ec',
    appBorderRadius: 10,
    fontBase:
      "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontCode: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace",
    textColor: '#1c1b22',
    textMutedColor: '#5b5868',
    barTextColor: '#5b5868',
    barSelectedColor: '#6750a4',
    barBg: '#ffffff',
    inputBg: '#ffffff',
    inputBorder: '#e5e3ec',
    inputTextColor: '#1c1b22',
    inputBorderRadius: 8,
  }),
});
