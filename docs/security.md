# Security

Practical guidance for embedding Hanging Strings Diagram in a host page or app. The library
does not implement authentication, authorization, or data fetching — its surface is DOM
rendering of host-supplied data, plus the **image URLs** you hand it (see
[Image URLs](#image-urls)), which the browser loads.

## Trust model

| Party | Role |
| --- | --- |
| **Host application** | Supplies category/group strings (`id`, `name`, colors, numeric values) and mounts the chart into a container it owns. |
| **Library** | Writes SVG/DOM under that container, applies `hsd-*` classes and `--hsd-*` variables, runs animation loops. |
| **End user** | Interacts with the chart (drag, spin, hover). No credentials go through the library; the only remote loads are image URLs the host supplies. |

Treat category and group **names** as untrusted if they can come from other users. The library
is designed to render them as plain text; your host must not assume HTML markup will be
interpreted.

## XSS posture

- Hover cards and labels set user-facing strings via **`textContent`**, not `innerHTML`, so
  category/group names cannot inject markup through the built-in card or label path.
- Some **static, library-authored** SVG chrome uses `innerHTML` for known-safe markup (defs,
  breeze icon paths). That is not a channel for host data.
- Do **not** pass HTML expecting it to render in `name` fields — it will show as literal text
  (or be ignored), never as DOM structure.
- If you copy chart output into your own HTML templates, **escape on the host side** the same
  way you would for any user string.

Demo gallery pages that build HTML strings use a local `escapeHtml` helper — follow the same
pattern in your app if you concatenate names into markup outside the library.

## Image URLs

Two inputs make the browser load an image on the chart's behalf:

- `backdropImageUrl` / `setBackdropImage(url)` — the `"image"` cloth.
- A custom theme's image thread texture (`thread.texture.multiply` / `.screen`).

The library accepts only `https:`, `http:`, `blob:`, `data:image/…` and relative URLs. Anything
else (`javascript:`, `file:`, `data:text/html`, custom schemes) throws a `TypeError` before the
chart is changed. Image loads never run script, so this is not an XSS boundary — it keeps the
surface to image-shaped URLs.

The library does **not** decide *which sites* may be loaded. If the URL can come from a user,
allowlist origins in your host code and in your CSP `img-src`; otherwise the chart will load
whatever image the user points it at (tracking pixels, very large files, mixed content).

## CSS isolation

- All chart classes are prefixed `hsd-*`.
- Cosmetic values flow through `--hsd-*` custom properties.
- The façade scopes theme variables and chrome attributes to **your container**, not
  `document.documentElement`, so multiple differently themed instances can coexist.

**Do not** inject untrusted CSS into custom theme objects or into host styles that override
`--hsd-*` for attacker-controlled content. Treat theme overrides like any other style surface
you control.

## Multi-instance safety

Each instance mints **unique SVG def ids**, so gradient/pattern references do not collide when
several charts share a page. Mount as many instances as you need; call `destroy()` on teardown
so animation loops and DOM nodes are removed.

## Content Security Policy (CSP)

Typical embeddings need:

- External (or same-origin) stylesheet for `hanging-strings-diagram.css`.
- Inline SVG in the page DOM (the chart is SVG elements, not a remote SVG file).
- No `eval` and no remote script fetches from the library itself.
- `img-src` covering any backdrop/texture image origins you use (the built-in textures are
  `data:` URIs, so `img-src data:` is needed for the default look).

If your CSP forbids inline styles, prefer the shipped stylesheet + theme variables rather than
injecting style attributes from untrusted input. Adjust CSP to allow your chosen script/CDN
origins for the UMD/ESM artifacts.

## Recommendations

1. Validate and sanitize **numeric** fields (`value`, `secondaryValue`) at the host boundary.
2. Treat names/ids as plain text; escape if you embed them in your own HTML.
3. Prefer the façade (`createHangingStringsDiagram`) over hand-wiring renderers so teardown and
   scoping stay consistent.
4. Always call `destroy()` (or adapter `dispose` / Chart.js `destroy`) on unmount.
5. Unknown theme/texture keys and disallowed image URLs **throw** — catch integration bugs
   loudly; do not swallow and continue with half-initialized state.
6. If backdrop or texture image URLs come from users, allowlist their origins on the host and
   in CSP `img-src`.

## Out of scope

- Authentication, API keys, or session handling.
- Data fetching (the library never fetches data; it only lets the browser load the image URLs
  you pass).
- Sandboxing untrusted **code** — if you eval host plugins, that is outside this package.
