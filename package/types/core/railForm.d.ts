/**
 * v2.5 track A (M1): the pluggable rail-form abstraction — see wiki/design/rail-forms.md.
 * A rail form is a geometry the same strings, physics (D10 core/chain.ts) and hierarchy (D16)
 * hang from; new forms plug in here instead of growing another parallel layout/renderer stack
 * (the duplication straight vs ring already created, and the reason this module exists).
 *
 * Two families, per the design page:
 *
 * - **Planar** (open curves in the canvas plane — straight today; arc/wave/freeform later):
 *   no fake-3D depth, anchors parametrized by distance along the rail. Strings still hang
 *   plumb (D1: dropPx is pure value math), so a non-straight planar form only moves the anchor
 *   POINT, never the string's length.
 * - **Loop** (closed/coiling perspective curves — ring today; spiral later): anchors
 *   parametrized by angle, with the D3 cheap-2D depth model (scale/opacity from anchor Y,
 *   cosmetic only, never touching dropPx).
 *
 * Pure math, no DOM — same reusability contract as core/layout.ts. The one renderer-facing
 * concession is PlanarRailForm.railPath (an SVG path string): the rod's rendered shape IS the
 * form, and every target renderer this project cares about consumes path data.
 */
/** A planar anchor point, in layout px. */
export interface RailAnchor {
    x: number;
    y: number;
}
/** D3's cosmetic depth read at some point of a loop rail: 0 = nearest the viewer (front),
 * 1 = farthest (back), with the scale/opacity falloff that follows. Never affects dropPx (D1). */
export interface RailDepth {
    depthT: number;
    scale: number;
    opacity: number;
}
/** A point on a loop rail at a given angle, with the depth that follows from it — shared by
 * string anchors and rail furniture (D13 compass ruler) so both use identical perspective math.
 * Lived in core/ringLayout.ts before M1; re-exported from there for its existing consumers. */
export interface RailPoint extends RailDepth {
    angleDeg: number;
    anchorX: number;
    anchorY: number;
}
/**
 * Open curve in the canvas plane. `along` is the distance along the rail from its left end —
 * for the straight form that is exactly the layout x, which is why core/layout.ts's existing
 * x-spacing (D5) doubles as arc-length spacing and M2/M3 forms can reuse it unchanged: the
 * same gaps become gaps along the curve, and only the anchor POINT moves.
 */
export interface PlanarRailForm {
    readonly family: "planar";
    /** Anchor point for a distance along the rail. Straight: y is constant (railY). */
    anchorAt(along: number): RailAnchor;
    /** M2/D20 — the family's slide semantics: the `along` parameter whose anchor sits at
     * horizontal position x, i.e. the inverse of anchorAt's x component. This is how a renderer
     * maps the pointer to a position on the rail during a positional slide, so the anchor tracks
     * the pointer exactly instead of drifting by the arc-length/x-run difference on curved rods.
     * Planar forms are monotonic in x by contract (Q16: self-overlapping paths are out of scope
     * for now), so the inverse is well-defined. Straight: identity. */
    alongAtX(x: number): number;
    /** SVG path data for the rod's rendered shape between two `along` parameters — the renderer
     * draws whatever the form says the rail looks like instead of assuming a full-width line. */
    railPath(from: number, to: number): string;
}
/**
 * Closed (or coiling, M4) perspective curve. Angles are degrees with 0 = dead-center front,
 * and deliberately UNBOUNDED here — the ring wraps them into (-180, 180] as its own policy
 * (core/ringLayout.ts), while a spiral maps whole turns to successive coils, so wrapping would
 * destroy exactly the information it needs.
 */
export interface LoopRailForm {
    readonly family: "loop";
    /** Point on the rail at an angle, with the D3 depth that follows from it. */
    anchorAt(angleDeg: number): RailPoint;
    /** Depth from a Y position directly — the renderer's animation loop needs this for eased
     * anchors that sit mid-swing BETWEEN two rail points (see depthFromAnchorY's rationale). */
    depthAt(anchorY: number): RailDepth;
}
export type RailForm = PlanarRailForm | LoopRailForm;
/** The depth-model half of a loop form's geometry — structurally what core/ringLayout.ts
 * already exposes as DepthConfig (a Pick of RingConfig). */
export interface LoopDepthConfig {
    centerY: number;
    radiusY: number;
    minScale: number;
    maxScale: number;
    minOpacity: number;
    maxOpacity: number;
}
/** Full geometry of an ellipse loop rail — RingConfig satisfies this structurally, so an
 * EllipseRailForm can be built straight from it. */
export interface EllipseGeometry extends LoopDepthConfig {
    centerX: number;
    radiusX: number;
}
/**
 * Depth purely from an anchor's Y (the ring's original `(1-cos)/2` formula, restated in Y so
 * it also holds for eased mid-transition anchors that aren't exactly on the ellipse) — the
 * loop family's shared depth model, kept standalone so core/ringLayout.ts's depthFromAnchorY
 * keeps its exact signature as a delegating wrapper.
 */
export declare function loopDepthFromY(anchorY: number, config: LoopDepthConfig): RailDepth;
/** The straight horizontal rod at a fixed railY — v1's accuracy-first view (D1: the shared
 * rail height is what makes knob Y positions directly comparable), now the planar family's
 * first implementation. */
export declare class StraightRailForm implements PlanarRailForm {
    private readonly railY;
    readonly family: "planar";
    constructor(railY: number);
    anchorAt(along: number): RailAnchor;
    alongAtX(x: number): number;
    railPath(from: number, to: number): string;
}
/**
 * M2: the arc — the planar family's first NON-straight form (wiki/design/rail-forms.md), a
 * circular arc whose horizontal chord runs from (0, railY) to (spanPx, railY). `sagPx` is the
 * SIGNED sagitta at mid-chord: positive bows the rod downward (a rod sagging under the weight
 * of its strings — the default reading of the hanging metaphor), negative arches it up like a
 * bridge. |sagPx| below ~0.01 degenerates to the straight rod.
 *
 * `along` is true arc length from the rod's left end, per the family contract — D5's gap
 * spacing therefore spreads strings evenly ALONG the curve, not along its x-projection.
 * Beyond the chord's ends the rod continues along the end tangents (C1, no kink): the rendered
 * rod can span a canvas wider than the arc's chord, and a D20 slide can park a string on the
 * straightened end of the rod without falling off a domain edge.
 *
 * Common-baseline note (rail-forms.md): anchors sit at differing heights, so knob Y positions
 * stop being directly comparable — accepted for this exploratory form (same compromise as the
 * ring, D2); dropPx stays pure value math (D1) and bead-ticks (D6) are the scale read.
 */
export declare class ArcRailForm implements PlanarRailForm {
    private readonly railY;
    private readonly sagPx;
    private readonly spanPx;
    readonly family: "planar";
    /** Circle radius; Infinity when degenerate-straight. */
    private readonly radius;
    /** Half the angular sweep of the chord's arc (radians). */
    private readonly halfSweep;
    /** Total arc length between the chord's endpoints. */
    private readonly arcLength;
    constructor(railY: number, sagPx: number, spanPx: number);
    anchorAt(along: number): RailAnchor;
    alongAtX(x: number): number;
    railPath(from: number, to: number): string;
    /** Point on the circle at angle phi from the arc's lowest/highest point (the sag apex). */
    private pointAtPhi;
    /** Continues from a chord endpoint along its unit tangent by `overshoot` arc length —
     * matches the curve's direction at the end, so rod and slide stay C1-smooth. */
    private tangentPoint;
}
/**
 * M3: the freeform engine — the planar family's general case (wiki/design/rail-forms.md: "the
 * named forms are presets over it"). Takes ANY caller-provided curve as a point function over
 * t ∈ [0, 1] (arbitrary speed — the engine re-parametrizes) and implements the whole
 * PlanarRailForm contract numerically: the curve is sampled once into a cumulative arc-length
 * table; `anchorAt` inverts it by binary search + linear interpolation, `alongAtX` does the
 * same on the x column, and `railPath` emits a polyline dense enough (≈6px steps) to read as a
 * smooth rod under the 2px rail stroke.
 *
 * Q16 contract, ENFORCED: the curve must be monotonic in x (strictly increasing sample-to-
 * sample) — the constructor throws otherwise, because `alongAtX` (the D20 pointer→position
 * mapping) is meaningless on a path that doubles back over its own x. Self-overlapping
 * freeform paths stay out of scope for v2.5.
 *
 * Beyond the curve's ends the rod continues along the end tangents, same convention as
 * ArcRailForm (C1 rod extension + slide headroom). Default 256 samples put the interpolation
 * error for gentle rail-scale curves far below a hundredth of a pixel — the preset-equivalence
 * test against the closed-form arc guards that claim. ArcRailForm itself deliberately KEEPS
 * its closed-form implementation (exact inversion, exact SVG arc segment); it is "a preset of
 * the engine" in the proven-equivalent sense, not by delegation.
 */
export declare class FreeformRailForm implements PlanarRailForm {
    readonly family: "planar";
    /** Sampled points, strictly increasing in x (Q16). */
    private readonly pts;
    /** cum[i] = arc length from the curve's start to pts[i]; cum[0] = 0. */
    private readonly cum;
    /** The x column of `pts`, kept separately so alongAtX (called per pointermove during a D20
     * slide) binary-searches without re-projecting the array each call. */
    private readonly xs;
    private readonly totalLength;
    constructor(curve: (t: number) => RailAnchor, samples?: number);
    anchorAt(along: number): RailAnchor;
    alongAtX(x: number): number;
    railPath(from: number, to: number): string;
    /** Unit tangent at an endpoint sample, from its adjacent segment. Monotonic x guarantees a
     * strictly positive x-component, so alongAtX's tangent-region division is safe. */
    private tangentUnit;
    private tangentPoint;
}
/**
 * M3: the wave — a sine rod, the freeform engine's first shipping preset. `amplitudePx` is the
 * crest/trough height from the rail line (keep it gentle: the wave is exploratory decoration
 * and must not eat the vertical budget the strings' lengths encode, D1 — the common-baseline
 * note applies harder here than on the arc, since anchors alternate above AND below railY).
 * `cycles` is how many full sine periods span the chord; integer and half-integer values end
 * the rod exactly on the rail line. Anchors spread by TRUE arc length, courtesy of the engine
 * — this is the form that exercises the family's varying-anchor-heights case hardest.
 */
export declare class WaveRailForm extends FreeformRailForm {
    constructor(railY: number, amplitudePx: number, cycles: number, spanPx: number, samples?: number);
}
/** The perspective ring's ellipse — D3's fake-3D loop, now the loop family's first
 * implementation. Holds the geometry by reference (RingConfig satisfies EllipseGeometry), so
 * constructing one per layout pass is free and it always reads current values. */
export declare class EllipseRailForm implements LoopRailForm {
    private readonly geo;
    readonly family: "loop";
    constructor(geo: EllipseGeometry);
    anchorAt(angleDeg: number): RailPoint;
    depthAt(anchorY: number): RailDepth;
}
