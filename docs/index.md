# Hanging Strings Diagram — Developer Guide

Hanging Strings Diagram is a data visualization in which **strings hang from a rail**. String
length encodes the primary value exactly; a knob weights each string's end; optional secondary
encodings (knob size, heat-map color, or quipu knots) and physical motion dress the chart
without changing that reading.

**Integrity guarantee:** string length = value, always. Themes, textures, breeze, and spring
physics are cosmetic by contract and can never alter a quantitative reading. Group and heat-map
colors are data encodings and are deliberately *not* themable.

Package: `hanging-strings-diagram` · CSS prefix: `hsd-` · Recommended entry:
`createHangingStringsDiagram(container, options)`.

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
- [Integration](integration.md) — worked examples (vanilla, Chart.js, ECharts, React).
- Live demo gallery (main package) — run `npm run dev` and open `http://localhost:5173`.
