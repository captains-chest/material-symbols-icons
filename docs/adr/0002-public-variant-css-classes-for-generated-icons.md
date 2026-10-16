# Public variant CSS classes for generated icons

Generated icon components expose stable public CSS classes for styling: `.msr-icon` / `.msrf-icon` on component hosts and `.msr-icon-svg` / `.msrf-icon-svg` on inner SVG elements. Shared directives apply these classes and own the baseline host and SVG rendering rules, so Consumer Applications get correct container-driven sizing without required package CSS imports; we chose this over Angular style bindings or explicit global stylesheet imports because the rules are static, public, and should work with zero setup.

## Update: shared document styles (issue #29)

Generated components originally carried identical variant-specific `styles` metadata. With more than 4,000 icons per package, that repeated the same CSS in every component. Server-rendered and prerendered HTML got one `<style>` block per distinct icon, and the package JS grew.

The baseline rules now live once in each package as `MSR_ICON_STYLES` / `MSRF_ICON_STYLES`. The host directive injects them into `document.head` as one `<style id="msr-icon-styles">` / `<style id="msrf-icon-styles">` element per document, using `CSP_NONCE` when provided. This works with SSR (one element per request) and isn't duplicated after hydration. Selectors repeat the class (for example `.msr-icon.msr-icon`) to keep the specificity of the old emulated-encapsulation rules, so consumer overrides behave the same.

Each generated icon is now a static template with no class body. The `ariaLabel` input belongs to the host directive and is exposed through `hostDirectives` inputs. The SVG directive owns the `aria-*` and `role` bindings.

Trade-offs:

- Global styles don't reach into `ViewEncapsulation.ShadowDom` components. Shadow DOM consumers include the exported style string themselves.
- `ariaLabel` is no longer a property on the icon component class. Template bindings, `ComponentRef.setInput('ariaLabel', …)` and `NgComponentOutlet` inputs still work, but code that reads `iconInstance.ariaLabel` directly doesn't.
