# Hanging Strings Diagram — Developer Guide

Hanging Strings Diagram is a data visualization in which **strings hang from a rail**. String
length encodes the primary value exactly; a knob weights each string's end; optional secondary
encodings (knob size, heat-map color, or quipu knots), opt-in sonification (plucked strings,
pitch = value), and physical motion dress the chart without changing that reading.

**Integrity guarantee:** string length = value, always. Themes, textures, breeze, and spring
physics are cosmetic by contract and can never alter a quantitative reading. Group and heat-map
colors are data encodings and are deliberately *not* themable.

Package: `hanging-strings-diagram` · **Version: 4.3.0** · CSS prefix: `hsd-` · Recommended entry:
`createHangingStringsDiagram(container, options)`.

## What changed in 4.3.0

- **Image URLs are checked.** `backdropImageUrl`, `setBackdropImage(url)` and custom image
  thread textures accept only `https:`, `http:`, `blob:`, `data:image/…` or relative URLs;
  anything else throws a `TypeError` (see [Security](security.md#image-urls)).
- **The ESM bundle is now minified.** `hanging-strings-diagram.min.js` shrank from 573 kB to
  455 kB; exports and tree-shaking are unchanged, stack traces now need the shipped source map.
- **Browser floor stated:** the bundles are ES2020 syntax — Chrome 87+, Edge 88+,
  Firefox 78+, Safari 14+ (see [API](api.md#package-exports)). This is unchanged from 4.2.
- Build tooling moved to Vite 8 (Rolldown); no API changes.

## Prerequisites

- A modern browser with SVG support.
- The library stylesheet (`hanging-strings-diagram/style.css` or the built `.css` file).
- A container element with a non-zero width (the façade sizes responsively from the container).

## Reading order

1. [Concept](concept.md) — what the visualization is and how encodings work.
2. [Visual design](visual-design.md) — marks, defaults, interactions, and how to read the chart.
3. [Security](security.md) — trust model and safe embedding practices.
4. [API](api.md) — façade options, methods, data types, and package exports.
5. [UI testing](ui-testing.md) — Vitest, demo thumbs, and manual verification.
6. [Integration](integration.md) — best practices and worked examples (vanilla, Chart.js, ECharts, React).

## Also useful

- [Developer README](developer_readme.md) — short landing page with links to every chapter.
- [API](api.md) — install entry points, façade options, and package exports.
- [Integration](integration.md) — worked examples (vanilla, Chart.js, ECharts, React, Excel).
- Live demo gallery (main package) — run `npm run dev` and open `http://localhost:5173`.
