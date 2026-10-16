# Content-sized icon defaults

Generated icon components use content-sized defaults (`inline-flex`, `flex: 0 0 auto`, and `1em` logical sizing) instead of growing to fill available parent space. We changed this because flex-grow-by-default caused icons inside common flex layouts such as `justify-content: space-between` to absorb extra width; consumers that need container-filling icons should opt in with their own CSS using the public variant classes rather than relying on the baseline rendering contract.

These defaults are part of the shared `MSR_ICON_STYLES` / `MSRF_ICON_STYLES` document styles injected by the host directive (see ADR 0002), not per-component styles.
