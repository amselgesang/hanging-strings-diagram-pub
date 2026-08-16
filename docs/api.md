# API

Façade-first public surface. Prefer `createHangingStringsDiagram` for hosts and adapters.
Types ship in `dist/types/`; this page mirrors the shipped TypeScript contracts.

## Package exports

| Export | Artifact | Use |
| --- | --- | --- |
| `hanging-strings-diagram` | ESM / UMD + types | Core + façade + renderers + themes |
| `hanging-strings-diagram/style.css` | CSS | Required stylesheet |
| `hanging-strings-diagram/chartjs` | Chart.js adapter | `registerHangingStringsDiagram` |
| `hanging-strings-diagram/echarts` | ECharts adapter | `attachHangingStringsDiagram` |
| `hanging-strings-diagram/react` | React wrapper | `HangingStringsDiagramChart` |

Build locally with `npm run build:lib`.

## Recommended entry — façade

```ts
import {
  createHangingStringsDiagram,
  type HangingStringsDiagram,
  type HangingStringsDiagramOptions,
} from "hanging-strings-diagram";
import "hanging-strings-diagram/style.css";

const hsd: HangingStringsDiagram = createHangingStringsDiagram(container, options);
```

UMD global: `HangingStringsDiagram.createHangingStringsDiagram(...)`.

The façade keeps both planar and ring renderers warm (mode switches preserve in-flight
physics), syncs backdrop to the rail, scopes CSS to your container, and uses instance-unique
SVG def ids.

### Options — `HangingStringsDiagramOptions`

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `categories` | `HangingStringCategory[]` | *(required)* | Canonical category list |
| `groups` | `HangingStringGroup[]` | *(required)* | Group registry (colors, names) |
| `railMode` | `"straight" \| "arc" \| "wave" \| "ring"` | `"straight"` | Active rail form |
| `theme` | `string \| HangingStringsDiagramTheme` | `"wool-brass"` | Theme key or object; **unknown keys throw** |
| `threadTexture` | `string \| null` | `"kernmantle"` | Texture key; `null` = theme’s own texture |
| `backdrop` | `"off" \| "plain" \| "tablecloth" \| "bavarian" \| "eu" \| "usa" \| "image"` | `"plain"` | Breeze cloth; pass `"off"` to disable; `"image"` drapes `backdropImageUrl` |
| `backdropImageUrl` | `string` | — | D21.10: the image the `"image"` cloth drapes (any URL — flag, logo, photo) |
| `backdropRenderer` | `"auto" \| "canvas" \| "svg"` | `"auto"` | How the cloth is painted: `"canvas"` draws it into one `<canvas>` (cheapest — a repaint is one texture upload; SVG re-rasterized every pattern cell per frame and pegged WebKit's GPU process); `"auto"` uses canvas when a 2d context exists, else the SVG cloth |
| `colorMode` | `"group" \| "heatmap"` | `"group"` | Legacy color switch (see `secondaryEncoding`) |
| `knobEncodesSecondMetric` | `boolean` | `false` | Legacy knob-size flag |
| `secondaryEncoding` | `"none" \| "knob" \| "heat" \| "quipu"` | derived / `"none"` | **Wins** over the legacy pair when set |
| `showTicks` | `boolean` | `true` | Bead-ticks (hidden automatically in quipu) |
| `tickTarget` | `number` | `8` | Approx ticks on the longest string |
| `labelValues` | `boolean` | `true` | Show values on labels |
| `stiffness` | `number` | `0.2` | `0` floppy … `1` rigid |
| `height` | `number` | `460` | Base canvas height (px) |
| `showHoverCard` | `boolean` | `true` | Built-in hover card |
| `sonification` | `boolean \| SonificationOptions` | `false` | D31: opt-in audio — `true` = signed defaults (physical direction, pentatonic, 150 ms, pan); object tunes `volume` / `pitchDirection` / `scale` / `sweepStepMs` |
| `onSelect` | `(groupId: string \| null) => void` | — | Group-to-front change |
| `onReorder` | `(event: ReorderEvent) => void` | — | Slide **commit** (not per-frame) |
| `onExpand` | `(event: ExpandEvent) => void` | — | Branch expand/collapse |
| `onHover` | `(event: HoverEvent \| null) => void` | — | Hover enter/leave for custom tooltips |

### Methods — `HangingStringsDiagram`

| Method | Purpose |
| --- | --- |
| `update({ categories?, groups? })` | Diffed data replace; surviving ids keep order and slid positions |
| `setRailMode(mode)` | Switch rail form; the rail morphs in place between forms (a sweeping transition, not a snap) |
| `setTheme(theme)` | Theme key or object (unknown keys throw) |
| `setThreadTexture(key)` | Texture key, or `null` for theme default |
| `setBackdrop(mode)` | Backdrop mode |
| `setBackdropImage(url)` | D21.10: drape any image as the cloth (sets the URL **and** switches to `"image"`) |
| `setWindScale(scale)` | Multiply breeze intensity (`1` normal, `0` calm) |
| `setSecondaryEncoding(mode)` | `"none" \| "knob" \| "heat" \| "quipu"` |
| `play()` | D31: pluck the chart left→right (pitch = cord length, pan = x); resolves after the last pluck; no-op while sonification is off; call from a user gesture first (autoplay policy) |
| `stop()` | Silence every scheduled/sounding pluck |
| `setSonification(on)` | `boolean` or a `SonificationOptions` patch (an object implies on) |
| `setOptions(patch)` | Patch `colorMode`, `knobEncodesSecondMetric`, `showTicks`, `tickTarget`, `labelValues`, `stiffness` |
| `toggleGroup(groupId)` | Group-to-front toggle |
| `toggleExpand(id)` | Expand/collapse a branch (no-op without children) |
| `getActiveGroup()` | Current fronted group id or `null` |
| `getRailMode()` | Current rail mode |
| `reset()` | Base order, collapse branches, clear slides/rotation/selection |
| `destroy()` | Remove DOM this instance added; stop all animation |
| `container` | Readonly host element |

Width tracks the container automatically (clamped roughly 560–1800 px).

### Event shapes

```ts
interface ReorderEvent {
  id: string;
  parentId: string | null;
  railMode: RailMode;
  position: number; // planar along-rail px, child offset, or ring base angle (deg)
}

interface ExpandEvent {
  id: string;
  expanded: boolean;
}

// HoverEvent extends the string hover payload with railMode
```

## Data model

### `HangingStringCategory`

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | `string` | Stable identity (animation/drag state keyed by it) |
| `name` | `string` | Label text |
| `value` | `number` | **String length** — primary metric |
| `groupId` | `string` | Group membership |
| `secondaryValue?` | `number` | Optional 2nd metric |
| `children?` | `HangingStringCategory[]` | Expandable branch |

### `HangingStringGroup`

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | `string` | Referenced by `category.groupId` |
| `name` | `string` | Legend / ARIA name |
| `color` | `string` | Data color (not themable) |

## Theming

```ts
import { THEMES, THREAD_TEXTURES, applyTheme } from "hanging-strings-diagram";

// Façade (preferred — scoped to the instance container):
hsd.setTheme("workshop");
hsd.setThreadTexture("hemp");

// Low-level (raw renderer path):
applyTheme(scopeElement, THEMES["wool-brass"]);
```

Presets in `THEMES`: `studio`, `workshop`, `foundry`, `ink-paper`, `wool-brass`.
Textures in `THREAD_TEXTURES`: `wool`, `hemp`, `twisted`, `braided`, `kernmantle`, `tracer`.

A theme is a plain `HangingStringsDiagramTheme` object — copy a preset and override slots.
Textures are grayscale luminance maps so **data colors always show through**.

## Error behavior

- Unknown **theme** string → `TypeError: Unknown Hanging Strings Diagram theme key: "…"`.
- Unknown **thread texture** key → throws similarly when resolved.
- Fail loudly at integration time; do not catch-and-ignore unless you have a fallback UI.

## Advanced surface (prefer façade)

Still exported from the main entry for power users and adapter internals:

| Export | Role |
| --- | --- |
| `SvgRenderer` / `RingSvgRenderer` | Direct SVG renderers (you own layout + state) |
| `computeLayout` / `computeRingLayout` / hierarchy variants | Pure layout math |
| `StraightRailForm`, `ArcRailForm`, `WaveRailForm`, … | Planar rail forms |
| `createSheetBackdrop` | Standalone breeze sheet |
| `DEFAULT_CONFIG`, scale helpers, quipu helpers | Core utilities |

If you use raw renderers you must wire slide/rotate/expand state yourself; new hosts should
stay on the façade. Worked examples: [Integration](integration.md).
