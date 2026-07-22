# Visual design

How to **read** a Hanging Strings Diagram — marks, encodings, product defaults, and
interactions. See also [Concept](concept.md) for encodings and rail-mode framing.

## Marks

| Mark | Role |
| --- | --- |
| **String** | Thin thread from the rail to the knob. Taut and straight at rest. |
| **Knob** | Filled bead at the lower tip — the exact bottom of the value. |
| **Rail** | Top anchor: straight, arc, wave, or perspective ellipse (ring). |
| **Hanger rings** | Curtain-style hangers on the rail (cosmetic chrome). |
| **Bead-ticks** | Small knots along the cord at regular value intervals (scale reference). |
| **Labels** | Rotated labels at the rail (always visible) plus an optional hover info card. |

## How to read the chart

1. **Length is truth.** Vertical drop from rail to knob is the primary metric. Themes,
   textures, shadows, and physics never change that length at rest.
2. **Color is data, not décor.** Group colors and heat-map colors encode categories or a
   second metric. They are not part of the theme system.
3. **Secondary encodings are exclusive.** Use knob size *or* heat-map *or* quipu knots for
   metric 2 — never stack them. See `secondaryEncoding` in the [API](api.md).
4. **Ring mode foreshortens.** Back-of-ring strings look shorter than equal-valued front
   strings. Prefer straight/arc/wave for precise comparison; use ring for exploration and
   group-to-front curation.

## Product defaults (façade)

Out of the box the façade ships the full physical look (overridable per instance):

| Setting | Default |
| --- | --- |
| Theme | `wool-brass` |
| Thread texture | `kernmantle` |
| Backdrop | `"plain"` (white sheet; pass `"off"` to disable) |
| Rail mode | `"straight"` |
| Color mode | `"group"` |
| Secondary encoding | `"none"` (unless derived from legacy flags) |
| Value labels | on |
| Bead-ticks | on, `tickTarget: 8` |
| Stiffness | `0.2` (very flexible) |
| Height | `460` px (canvas grows when branches expand) |
| Hover card | on |

## Themes as materials

Themes dress chrome and thread materials (wood, brass, wool, paper). They set `--hsd-*` CSS
variables and rebuild texture/plate DOM. They do **not** recolor group or heat-map data.
Preset keys: `studio`, `workshop`, `foundry`, `ink-paper`, `wool-brass`. Independent thread
swaps: `THREAD_TEXTURES` (`wool`, `hemp`, `twisted`, `braided`, `kernmantle`, `tracer`).

See [API — Theming](api.md#theming) and [Integration](integration.md).

## Interaction sketch

| Action | Behavior |
| --- | --- |
| **Slide** | Drag a string along the rail; on release, reorder commits (not per-frame). |
| **Ring spin** | Grab the disc; continuous rotation with inertia; strings chase with physics. |
| **Group-to-front** | Select a group to front it (ring: center at the visual front) and dim others. |
| **Hierarchy expand** | Expand a parent knob to unfurl its children on a sub-rail; collapse to tuck away. |
| **Hover** | Built-in info card, or host tooltip via `onHover` with `showHoverCard: false`. |
| **Breeze** | Optional cloth backdrop + cord sway; intensity via `setWindScale`. |
| **Zoom / pan** | Chart window supports pinch/wheel zoom and pan on supported surfaces. |

Motion uses a damped spring “shock absorber”: grab feels 1:1 with the pointer; release flexes
the thread and settles back to taut plumb. Stiffness `0`…`1` controls how floppy vs rigid
strings feel (`0.2` default on the façade).

## Accessibility notes

Partial groundwork ships today: tabbable hit targets with name/value ARIA, arrow-key reorder,
and `prefers-reduced-motion` defaults for breeze. A fuller a11y track (data-table fallback,
keyboard map, sonification) is not yet complete — plan for host-side labels or tables if you
need WCAG-complete non-visual access now.
