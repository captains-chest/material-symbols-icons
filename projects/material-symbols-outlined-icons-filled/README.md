# @captains-chest/material-symbols-outlined-icons-filled

Standalone Angular filled icon components generated from Material Symbols Outlined.

Browse all icons in the Storybook catalog: https://icons.captains-chest.com

## Usage

```ts
import { Component } from '@angular/core';
import { MsofHomeIconComponent } from '@captains-chest/material-symbols-outlined-icons-filled/home';

@Component({
  imports: [MsofHomeIconComponent],
  template: `<div style="display:flex; width:24px; height:24px; color:#444;">
    <msof-home-icon />
  </div>`,
})
export class DemoComponent {}
```

Import each icon from its own subpath, named after the kebab-case part of its selector (`<msof-arrow-back-icon>` → `@captains-chest/material-symbols-outlined-icons-filled/arrow-back`). Each icon is a separate module, so `ng serve` and production builds only process the icons you import, and icons used only on lazy routes stay in lazy chunks. No `angular.json` changes are needed.

The package root exports the shared API only: `MsofIconHostDirective`, `MsofIconSvgDirective`, `MSOF_ICON_STYLES`, `MSO_ICON_NAMES`/`MsoIconName` and `ICON_MANIFEST`.

Each icon component supports an optional `ariaLabel` input. Bind it in templates, or set it with `ComponentRef.setInput('ariaLabel', …)` / `NgComponentOutlet` inputs:

```html
<msof-home-icon [ariaLabel]="'Home'" />
```

## Styling

Icon components are content-sized by default: each host renders as an `inline-flex` `1em` square, does not grow as a flex item, and inherits color from `currentColor`. The package exposes stable public CSS classes for contextual styling:

- `.msof-icon` on each icon component host
- `.msof-icon-svg` on the inner SVG element

```css
.toolbar .msof-icon {
  inline-size: 1.25rem;
  block-size: 1.25rem;
  color: currentColor;
}
```

To change the default size without selector specificity concerns, set the `--msof-icon-size` custom property (it falls back to `1em`):

```css
.toolbar {
  --msof-icon-size: 1.25rem;
}
```

The default `flex: 0 0 auto` keeps icons from absorbing extra width in flex parents that use layouts such as `justify-content: space-between`.

To opt into filling a sized parent, use consumer CSS:

```css
.icon-box {
  inline-size: 24px;
  block-size: 24px;
}

.icon-box .msof-icon {
  inline-size: 100%;
  block-size: 100%;
}
```

No package stylesheet import is required for baseline rendering. The base styles are shared by all icons: the first rendered icon adds one `<style id="msof-icon-styles">` element to `document.head` (once per page or SSR request). It uses the `CSP_NONCE` value when your app provides one.

Because these styles are global, they don't reach into components that use `ViewEncapsulation.ShadowDom`. If you render icons inside a shadow root, include the exported `MSOF_ICON_STYLES` string in that component's styles:

```ts
import { MSOF_ICON_STYLES } from '@captains-chest/material-symbols-outlined-icons-filled';

@Component({
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [MSOF_ICON_STYLES],
  // ...
})
```

## Angular compatibility matrix (`@captains-chest/material-symbols-outlined-icons-filled`)

> This package uses the same component code as the Material Symbols Rounded packages, which were tested in real Angular apps (`angular-16` … `angular-21`). This package was not tested separately in those apps.

| Angular version | Standalone | NgModule | Status           |
| --------------- | ---------: | -------: | ---------------- |
| 16              |         ❌ |       ❌ | Not compatible   |
| 17              |         ✅ |       ✅ | Verified working |
| 18              |         ✅ |       ✅ | Verified working |
| 19              |         ✅ |      N/A | Verified working |
| 20              |         ✅ |      N/A | Verified working |
| 21              |         ✅ |      N/A | Verified working |

### Why Angular 16 does not work

Angular 16 fails at compile time because this library exposes `InputSignal`-based component inputs in its type declarations.
Angular 16’s `@angular/core` does **not** export `InputSignal`, so TypeScript errors out before runtime:

- `TS2694: Namespace '@angular/core' has no exported member 'InputSignal'`

In short: the package output relies on newer Angular signal-input APIs that are unavailable in Angular 16.

## Support this project

If these icons save you time, you can support my work here:

<a href="https://www.buymeacoffee.com/captainDuckay" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## Upstream availability disclaimer

This package only publishes icons that exist upstream for Material Symbols Outlined (filled variant) at the pinned source ref used for this release.

Authoritative source for release availability: `ICON_MANIFEST.source` in this package.

Catalog browser (mutable, for discovery only): https://fonts.google.com/icons?icon.style=Outlined

## License

MIT © CaptainDuckay. The generated icon data comes from Google's Material Symbols and is licensed under Apache License 2.0; see `LICENSE-THIRD-PARTY.md`.
