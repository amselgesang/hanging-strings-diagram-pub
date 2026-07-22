/**
 * Flexible-string "shock absorber" micro-interaction (D10), extracted from the straight-mode SVG
 * renderer so ring mode can share the exact same physics rather than re-implementing it (per
 * user request: ring-mode strings should feel identical to straight mode's, not have their own
 * bespoke motion). Pure, DOM-free — a renderer owns a `StringChainAnim` per string and calls
 * `stepChainAnim` once per animation frame; everything here only ever produces numbers, never
 * touches the DOM.
 *
 * Modeled as a cheap N-node cascading chain rather than a rigid rotating rod — the anchor (top,
 * attached to the rail) only moves when explicitly dragged or when its target slot changes.
 * Whichever point along the string you grab becomes the "driver" (tracks the pointer 1:1); every
 * other node chases whichever neighbor is closer to the driver, so a flick propagates outward in
 * both directions with increasing delay/amplitude the farther a node is from the grab point.
 * The anchor itself is 2D (`anchorX`/`anchorY`) so a renderer whose attachment point moves along
 * a curve (ring mode's ellipse) can ease it in both axes; the chain nodes stay pure local-X
 * offsets in both renderers, since in both cases "down" is the local +Y direction after the
 * renderer's own transform is applied — only the inertial displacement driving the chain reacts
 * to X motion (in straight mode Y never moves at all, so this is a strict generalization, not a
 * behavior change there).
 *
 * PHASE-CORRECT INERTIA (2026-07-15 fix): anchor motion couples into the chain as an immediate
 * LOCAL DISPLACEMENT (a node with inertia holds its world position while the anchor moves under
 * it), not as a velocity impulse. The previous velocity-impulse coupling propagated so slowly
 * through the cascade that the visible swing arrived only after the anchor had stopped — and in
 * the TRAILING direction, which reads as exactly backwards ("swings the opposite as it would be
 * in reality", user report while spinning the ring's disc). With displacement coupling the
 * string trails immediately while its anchor accelerates, and the spring cascade produces the
 * real forward overshoot after the stop.
 */
import { type SpringState } from "./spring";
export declare const N_NODES = 3;
/** D25: the FASTEST chase rate a rail-mode morph glide uses (the first string in layout
 * order) — a ~280ms time constant, so even the quickest string's cross-geometry travel
 * visibly plays out, vs drag-follow's ~50ms snap. */
export declare const MORPH_ANCHOR_EASE_RATE = 3.6;
/** D25 sweep: the morph's per-string chase rate by layout-order fraction (0 = first string,
 * 1 = last). Later strings glide slower, so the transformation travels ACROSS the chart as a
 * visible left-to-right wave (first strings land ~0.9s, last ~1.6s) instead of everything
 * arriving in lockstep. */
export declare function morphAnchorEaseRate(orderT: number): number;
export interface ChainParams {
    near: {
        stiffness: number;
        damping: number;
    };
    far: {
        stiffness: number;
        damping: number;
    };
    label: {
        stiffness: number;
        damping: number;
    };
    coupling: number;
    labelCoupling: number;
}
export declare function chainParamsForStiffness(stiffness: number): ChainParams;
/** Maps a knob's radius to a physical "weight" for the spring — linear between the smallest and
 * largest knob currently on screen (min radius = baseline mass 1, unaffected). */
export declare function knobMassForRadius(radius: number, radiusMin: number, radiusMax: number): number;
/**
 * Which chain node (or the anchor, -1) sits closest to grab-depth fraction `t` (0 = rail,
 * 1 = knob). Node `i` (0-indexed) sits at depth fraction (i+1)/N_NODES, so the last node is
 * exactly at the knob.
 */
export declare function nearestNodeIndex(t: number): number;
export interface StringChainAnim {
    anchorX: number;
    anchorY: number;
    targetX: number;
    targetY: number;
    /** Horizontal offsets (px, local coords) of points along the string; nodes[N_NODES-1] = knob. */
    nodes: SpringState[];
    /** Which point is being actively dragged: -1 = anchor (rail), 0..N_NODES-1 = a node/the knob. */
    grabbedIndex: number;
    /** Extra rotation (deg) on top of a renderer's own fixed label tilt — a light "tag flutter" echo. */
    labelRot: SpringState;
    /** D25 (rail-mode morph): temporary anchor chase rate (1/s) replacing ANCHOR_EASE_RATE — a
     * seeded cross-geometry glide wants a visibly slower travel than drag-follow's snap.
     * Self-clears once the anchor arrives, so later interactions get normal snappiness. */
    anchorEaseRate?: number;
}
export declare function createChainAnim(x: number, y: number): StringChainAnim;
export interface StepChainInput {
    /** True while this exact string is the live pointer drag. */
    isDraggingThis: boolean;
    stiffness: number;
    /** Precomputed `chainParamsForStiffness(stiffness)` — pass it when stepping many strings in
     * one frame so the (pow/sqrt) derivation runs once per frame, not once per string. Falls back
     * to deriving from `stiffness` when omitted. */
    chainParams?: ChainParams;
    knobRadius: number;
    radiusMin: number;
    radiusMax: number;
    dt: number;
    /** D21.2: lateral wind acceleration (px/s²) the breeze applies to this string this frame —
     * a gentle external force on the chain nodes (scaled toward the free end, like the
     * displacement coupling), so breeze sway rides the SAME spring physics as every other
     * motion and composes naturally with drags and swings. Omit/0 = still air. */
    windAccelPx?: number;
}
export interface StepChainResult {
    /** True once the anchor, every chain node, and the label rotation are all at rest. */
    settled: boolean;
}
/**
 * Advances `anim` by one frame **in place** (mutates the object passed in — the caller keeps
 * whatever Map/identity it already uses to store anim state per string id) and reports whether
 * everything has settled. Mirrors the original straight-mode `tick()` loop body, generalized so
 * the anchor can ease in Y as well as X (ring mode's attachment point moves along an ellipse;
 * straight mode's `targetY` is simply always equal to `anchorY`, so this is a no-op there).
 */
export declare function stepChainAnim(anim: StringChainAnim, input: StepChainInput): StepChainResult;
export interface Point {
    x: number;
    y: number;
}
/**
 * SVG path through `points[0]` (exact) .. `points[n]` (exact), smoothed by using every interior
 * point as a quadratic control point (the standard "smooth polyline" trick — each segment but
 * the last ends at the midpoint to the next point; the last ends exactly at the final point so
 * the knob is always rendered at its true position, never a smoothed offset).
 */
export declare function smoothPathThroughPoints(points: Point[]): string;
/** Approximate X at height `ty` by walking the polyline through `points` (anchor..knob). Cheap
 * cosmetic placement for tick marks — the real thread is the smoothed curve, but ticks sitting a
 * shade off it (vs. exactly on it) is imperceptible at bead-tick size. */
export declare function xAlongPolyline(points: Point[], ty: number): number;
export declare function clamp(v: number, min: number, max: number): number;
export declare function lerp(a: number, b: number, t: number): number;
