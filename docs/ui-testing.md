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
| Adapters | `src/adapters/chartjs.test.ts`, `echarts.test.ts` |
| Demo registry | `demo/features.test.ts`, `demo/mobileGallery.test.ts` |

They do **not** drive a real browser interaction suite. Renderer DOM behavior beyond those
contracts is verified manually or via the demo gallery.

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
