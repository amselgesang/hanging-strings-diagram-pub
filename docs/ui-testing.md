# UI testing

How to verify Hanging Strings Diagram behavior as an integrator or contributor.

## Unit and contract tests (Vitest)

```bash
npm test           # single run
npm run test:watch # watch mode
```

These are **pure-math and contract tests** (Node environment via Vitest). They cover:

| Area | Examples |
| --- | --- |
| Core layout / geometry | `src/core/layout.test.ts`, `ringLayout`, `hierarchy`, `railForm`, `scale`, `chain`, `spring`, `quipu`, `wheel`, `labelContrast` |
| SVG contracts | `src/renderers/svg/theme.test.ts`, `backdrop.test.ts`, `stringHit.test.ts` |
| Adapters | `src/adapters/chartjs.test.ts`, `echarts.test.ts`, `excel.test.ts` (pure mapper + live sync against a fake Office.js host) |
| Demo registry | `demo/features.test.ts`, `demo/mobileGallery.test.ts` |

They do **not** drive a real browser interaction suite. Renderer DOM behavior beyond those
contracts is verified manually or via the demo gallery.

## Excel integration test (real Excel, Mac)

```bash
npm run test:excel
```

Drives the **installed Microsoft Excel** end to end without any UI clicking: starts the dev
server, registers a test manifest in Excel's sideload folder, restarts Excel if nothing is
unsaved (a new manifest is only read at launch), opens a generated workbook that embeds the
content add-in, and observes the add-in through progress beacons the page posts back:

| Step | Asserts |
| --- | --- |
| activation | Office.js reports `host=Excel`, `platform=Mac`; Pointer Events present |
| render | rows, values, groups, header and column roles read from the sheet; `.hsd-string` count |
| live sync (event) | an edit made through Office.js raises `Worksheet.onChanged` and updates the chart |
| live sync (automation) | an AppleScript cell edit reaches the chart (event or poll fallback — the step says which) |
| used range | an appended row grows the source range |

Teardown closes the workbook unsaved, removes the test manifest, and quits Excel only if the
test launched it. Env: `HSD_EXCEL_PORT`, `HSD_EXCEL_TIMEOUT_MS`, `HSD_EXCEL_POLL_MS`,
`HSD_EXCEL_KEEP=1` (leave Excel open to look). Skips on non-Mac hosts or without Excel.

Manual, in the content object (not automatable without a hand on the mouse): drag a knob
sideways and confirm the slide **commits** (no `pointercancel`); spin the ring; check
"Show as saved image" if the workbook is opened where content add-ins render as snapshots.

## What is not covered (today)

- No Playwright/Cypress **e2e** test suite in CI.
- No automated **visual regression** (image-diff) pipeline.
- `npm run thumbs` uses Playwright Chromium under the hood to **capture marketing thumbs**,
  not to assert pixels in CI.

## Demo thumbs

```bash
npm run thumbs
```

Regenerates landing-card screenshots for atelier (light) and night (dark) gallery skins:

- `demo/thumbs/<slug>.png` and `<slug>-night.png`
- `public/demo/thumbs/…` (Vite public copy)
- `raw/assets/demo-thumbs/…` (immutable archive copy)

Run thumbs when you change a feature page’s default look, gallery skin CSS that affects the
chart frame, or the set of feature slugs. Optional: `npm run glow` for night-glow assets used
by some thumbs.

## Manual UI checklist (integrators)

After embedding the façade or an adapter, verify:

1. **Mount** — chart appears with expected length ordering for your data.
2. **Resize** — container width changes; chart reflows without leftover transforms.
3. **Rail mode** — `setRailMode` across `straight` / `arc` / `wave` / `ring`; physics survive
   the switch.
4. **Theme / texture / backdrop** — swaps apply only inside the container; other page charts
   stay unchanged.
5. **Secondary encoding** — `none` → `knob` → `heat` → `quipu`; ticks hide under quipu.
6. **Interactions** — slide commit, ring spin settle, group-to-front, expand/collapse.
7. **Hover** — built-in card *or* `onHover` with `showHoverCard: false`.
8. **Multi-instance** — two charts, different themes, on one page.
9. **Destroy / remount** — no leftover SVG nodes, rAF loops, or event listeners after
   `destroy()` / adapter dispose / Chart.js `destroy()`.
10. **Reduced motion** — with `prefers-reduced-motion: reduce`, breeze defaults off; explicit
    user toggles may still enable motion depending on host UI.

## Contributor tips

- Prefer **Vitest contract tests** for geometry, theme CSS variables, and adapter mapping.
- Use **feature demo pages** (`npm run dev` → `features/<slug>/`) for interaction feel
  (physics, ring spin, breeze, quipu readability).
- Kitchen sink: `features/kitchen-sink/` for cross-cutting checks.
- Keep thumbs generation out of the critical path of every PR unless visuals on the landing
  page changed.
