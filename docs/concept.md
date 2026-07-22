# Concept

A chart that shows **categories with values** as **strings hanging from a top rail**. Each
category is one string; the **length of the string encodes the value** (longer = larger). Each
string ends in a **knob** (a bead/weight at its lower tip). The whole thing reads like plumb
lines or a beaded curtain: physical cords dangling under gravity, each weighted by its knob.

Optionally, the cord can carry **quipu-style knots** that encode a **second metric** as a
readable number tied into the string itself (Incan khipu positional decimal).

## Data model

- **Groups** give categorical color and clustering (`id`, `name`, `color`).
- **Categories** are the strings (`id`, `name`, `value`, `groupId`, optional `secondaryValue`).
- **Hierarchy:** a category may include `children` — expandable branches on their own sub-rails
  (two-level prototype shipped; values are independent of the parent unless you choose a sum
  convention in your data).

See [API — Data model](api.md#data-model) for field tables.

## Visual encodings

| Channel | Encodes |
| --- | --- |
| **String length** (vertical drop) | Primary **value** / metric 1 (longer = bigger) |
| **String color** | **Grouping** = categorical group; **heat-map** = a continuous **second metric** (not the length value) |
| **Knob size** | Optional **second metric**; otherwise a uniform endpoint marker |
| **Quipu knots** along the cord | Optional **second metric** as a tied number |
| **Bead-ticks** along the string | Scale / gridline ticks at regular value intervals; **hidden while quipu is active** |
| **Position along the rail** | Category identity / order (sortable, slidable) |

**Ceiling:** length (metric 1) plus **one** of knob size / heat-map color / quipu knots
(metric 2). Do not encode three metrics at once. The façade exposes this as
`secondaryEncoding`: `"none" | "knob" | "heat" | "quipu"` (mutually exclusive). Default to
length + grouping color; opt into a second metric deliberately.

## Quipu knots (short)

When `secondaryEncoding` is `"quipu"`, knots on each cord encode the second metric as
**positional decimal**, read **bottom-up from the knob** toward the rail (units nearest the
knob; tens/hundreds in bands above; empty band = zero). Short cords fall back to a simpler
bucketed knot count when positional bands will not fit. Bead-ticks hide while quipu is active
so two knot vocabularies never share one cord.

## Rail modes

1. **Straight / arc / wave (analytical):** planar rods. Straight is best for accurate value
   comparison — all strings share a clear top baseline.
2. **Perspective ring (exploratory):** an elliptical “curtain” rail. Slide strings along the
   arc or spin the disc. Beautiful, but **foreshortening** and **occlusion** reduce
   quantitative accuracy — treat ring mode as exploration, not primary measurement.

## Metaphor and integrity

Strings should look and feel like real threads with a weight on the end. At rest they hang
**taut and straight**; length equals value. Swing, breeze, and droop during motion are
**cosmetic and transient** — they must not change the value reading once settled.

## Prior art (positioning)

Closest cousins: lollipop charts (line + dot, hung from a top baseline), hanging rootograms,
and Incan khipu. The encoding is **magnitude as length**, not directional vectors.

## Non-goals

Not a network/force graph. Not a directional flow diagram.
