# Hanging Strings Diagram

Hanging Strings Diagram is a data visualization in which **strings hang from a rail** — string
length encodes the value exactly, a knob weights each string's end, and the whole chart behaves
like a physical object: strings swing with inertia when moved, hang from real hanger rings, and
can be dressed in photorealistic materials.

- **Capabilities:** four rail forms (straight / arc / wave / perspective ring), two-level
  hierarchy, drag-to-slide, spin-able ring, group-to-front, heat-map or group coloring, knob
  size or quipu knots as a second metric, knot-style ticks, five preset themes, photoreal
  thread textures, optional breeze cloth backdrop, opt-in sonification (plucked-string
  audio, pitch = value).
- **Integrity guarantee:** string length = value, always. Themes and physics are cosmetic by
  contract. Group/heat colors are data encodings and are deliberately *not* themable.


## Developer guide

| Chapter | Contents |
| --- | --- |
| [Index](docs/index.md) | Reading order, prerequisites, package entry |
| [Concept](docs/concept.md) | What the visualization is; encodings and rail modes |
| [Visual design](docs/visual-design.md) | Marks, product defaults, interactions |
| [Security](docs/security.md) | Trust model, XSS posture, CSP notes |
| [API](docs/api.md) | Façade options/methods, data model, package exports |
| [UI testing](docs/ui-testing.md) | Vitest, demo thumbs, manual checklist |
| [Integration](docs/integration.md) | Best practices + vanilla / Chart.js / ECharts / React examples |

Public distribution mirror for developers using Hanging Strings Diagram. Prebuilt package,
static demo, developer guide, and thread texture sources — no library source tree.

## What's in this repository

| Path | Contents |
| --- | --- |
| [docs/](docs/) | Developer guide chapters |
| [demo/](demo/) | Static feature-gallery build (open `demo/index.html`) |
| [package/](package/) | Prebuilt ESM/UMD/CSS/types + Chart.js / ECharts / React adapters |
| [textures/](textures/) | Source thread/rope photos used to bake photoreal cord materials |

Baked luminance maps already ship inside `package/*.min.js` via `THREAD_TEXTURES`. The
`textures/` folder is the editable photo sources for customization or re-baking.

Published from the private/source project at version **4.1.3** (2026-07-29T15:25Z).
