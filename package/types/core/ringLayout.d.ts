/**
 * Pure layout math for Hanging Strings Diagram, perspective-ring ("curtain") mode — the
 * exploration/aesthetic view (D2), as opposed to straight mode's accuracy-first view.
 * No DOM, no rendering-library types — mirrors core/layout.ts's separation of concerns.
 * See wiki/design/visual-design.md decisions D2–D4 and the new ring-geometry decision.
 *
 * Fake-3D approach (D3): the rail is an ellipse; each string's anchor sits on it. A string's
 * angle around the ellipse determines a depth value in [0, 1] (0 = nearest the viewer/front,
 * 1 = farthest/back), which drives a cosmetic scale + opacity falloff — the same "cheap 2D fake"
 * used for the ring's perspective everywhere else in this project (no WebGL, no real 3D).
 *
 * D1 integrity note: `dropPx` (the value → length mapping) is computed identically to straight
 * mode — the same linear scale over the same value domain, completely independent of depth. Only
 * the *rendered* pixels get visually scaled down by depth (a `scale()` transform applied by the
 * renderer, not baked into this module's numbers) — ring mode is intentionally the "exploratory"
 * view where foreshortening is allowed to visually compress far strings; D4's answer for reading
 * exact values in ring mode is to bring the group of interest to the front, not to fight the
 * perspective with geometric correction (that was Q7, already decided against).
 */
import type { HangingStringCategory, HangingStringsDiagramConfig } from "./types";
import { type RailPoint } from "./railForm";
/** M1: RailPoint moved to core/railForm.ts (it's the loop FAMILY's anchor vocabulary, not the
 * ring's alone) — re-exported so this module's existing consumers keep their import path. */
export type { RailPoint } from "./railForm";
export interface RingConfig extends Pick<HangingStringsDiagramConfig, "colorMode" | "knobEncodesSecondMetric" | "tickTarget" | "knobMinRadiusPx" | "knobMaxRadiusPx"> {
    /** Ellipse center, in px. */
    centerX: number;
    centerY: number;
    /** Ellipse semi-axes, in px. `radiusY` should be much smaller than `radiusX` — that squash is
     * what sells the "ring viewed edge-on" perspective. */
    radiusX: number;
    radiusY: number;
    /** Total arc, in degrees, over which strings are distributed — centered on the front (0deg).
     * Deliberately less than 360 so strings don't pile up back-to-back at the rear of the ring
     * (a visible gap there reads as "the far side of the ring," not a rendering bug). */
    visibleArcDeg: number;
    /** Continuous "spin the whole ring" offset (degrees), added to every string's base angle
     * before depth/scale/opacity are derived from it. The rail itself (and its compass ruler,
     * `computeRailTicks`) stays fixed — like a real curtain rod — only the strings' position along
     * it rotates, exactly like curtain rings sliding around a stationary pole. Default 0 leaves the
     * static layout below unchanged. Continuous (any real number, wrapped internally), not
     * quantized to a slot — see Q12 in wiki/design/open-questions.md for why this replaced an
     * earlier discrete-slot version. */
    rotationOffsetDeg: number;
    /** Max pixel drop for the largest value — same role as HangingStringsDiagramConfig.maxDropPx. */
    maxDropPx: number;
    /** Cosmetic depth scale range: front strings render at maxScale, the farthest back at minScale. */
    minScale: number;
    maxScale: number;
    /** Cosmetic depth opacity range, same front/back convention as scale. */
    minOpacity: number;
    maxOpacity: number;
}
export declare const DEFAULT_RING_CONFIG: RingConfig;
export interface RingStringLayout {
    category: HangingStringCategory;
    /** Angle around the ellipse, degrees, 0 = dead-center front (nearest the viewer). */
    angleDeg: number;
    /** Anchor point on the rail ellipse, in px. */
    anchorX: number;
    anchorY: number;
    /** 0 = front (nearest viewer), 1 = back (farthest) — drives scale/opacity below. */
    depthT: number;
    /** Cosmetic depth scale/opacity for the renderer to apply as a transform — never affects
     * `dropPx`, which stays a pure function of `category.value` (D1). */
    scale: number;
    opacity: number;
    /** Pixel length of the string — identical math to straight mode's dropPx (D1: never cosmetic). */
    dropPx: number;
    knobRadius: number;
    ticks: {
        value: number;
        y: number;
    }[];
    /** D16: set on children — the id of the parent whose sub-rail this string hangs from. */
    parentId?: string;
    /** D16: a child's slot offset from its parent's knob, in UNSCALED px — the renderer
     * multiplies by the parent's *live* depth scale every frame, so the whole branch foreshortens
     * coherently as the parent swings toward the back. Since D16.1 (sub-rails are mini rings) the
     * offset is 2D: the X/Y of the child's slot point on the sub-ring ellipse. */
    slotOffsetX?: number;
    slotOffsetY?: number;
    /** D17-for-children: the child's current angle around its mini ring (degrees, 0 = the mini
     * ring's front center, INCLUDING the branch's D19 rotation offset) — same semantics as a
     * root's `angleDeg` on the main rail, one level down. Drag-to-slide starts from here. */
    localAngleDeg?: number;
    /** D16.1: the child's OWN depth multipliers from its angle around the mini ring (1 at the
     * ring's front, minScale/maxScale ratio at its back) — the renderer composes these with the
     * parent's live depth every frame, so a child at the mini ring's edge reads slightly farther
     * away than its front-center sibling, exactly like roots on the main ring. */
    localScale?: number;
    localOpacity?: number;
}
/** D16 in ring mode: a sub-rail hanging from an expanded parent's knob. Stored as unscaled
 * dimensions relative to the parent's knob (not absolute coordinates) because the parent moves
 * around the ellipse and changes depth scale — the renderer positions the actual shape from the
 * parent's live knob every frame. D16.1: the sub-rail is a miniature RING (an ellipse with the
 * same squash as the main rail), not a straight line — the branch repeats its parent's rail
 * vocabulary one level down. */
export interface RingSubRailLayout {
    parentId: string;
    /** The sub-ring ellipse's semi-axes, unscaled px. `radiusY/radiusX` matches the main rail's
     * squash so both rings read as discs seen from the same camera. */
    radiusX: number;
    radiusY: number;
    /** Vertical gap between the parent's knob and the sub-ring's TOP rim (the "hook"), unscaled
     * px — the ellipse's center hangs `gapPx + radiusY` below the knob. */
    gapPx: number;
    /** D19: this branch's own continuous spin offset (degrees), already applied to its children's
     * slot angles — echoed here so the renderer can point the mini disc's arrow spring at it,
     * exactly like the main ring's `rotationOffsetDeg`. */
    rotationDeg: number;
}
export interface RingLayoutResult {
    /** Sorted back-to-front (farthest first) so a renderer can append in this order and get
     * correct painter's-algorithm occlusion for free from normal SVG/DOM stacking. */
    strings: RingStringLayout[];
    maxValue: number;
    /** Value interval between adjacent bead-ticks (D6) — same role as LayoutResult.tickStepValue,
     * so renderers can caption what one bead is worth. */
    tickStepValue: number;
    config: RingConfig;
    /** D16: one entry per expanded parent (see core/ringHierarchy.ts). */
    subRails?: RingSubRailLayout[];
    /** D16: how far down the content reaches (at-rest estimate) — lets the renderer grow the
     * canvas below `height` while branches are expanded, like straight mode. */
    contentHeight?: number;
}
export type DepthConfig = Pick<RingConfig, "centerY" | "radiusY" | "minScale" | "maxScale" | "minOpacity" | "maxOpacity">;
/**
 * Derives depth/scale/opacity purely from an anchor's Y position, rather than from an angle —
 * shared by `pointOnRailEllipse` (exact points on the ellipse, where this is equivalent to the
 * original `(1-cos(rad))/2` formula, since `anchorY = centerY + radiusY*cos(rad)` by
 * construction) and by a renderer's animation loop (whose eased anchor position, mid-transition
 * between two ellipse points, isn't exactly *on* the ellipse — using Y directly still gives a
 * smooth, continuous depth read instead of a value that's only valid at rest). Renderer-facing
 * so ring mode's "spin the ring" (Q12) can grow/shrink/fade each string continuously as it swings,
 * not just snap to a new size once the target position is reached.
 * M1: the math itself is the loop family's shared depth model in core/railForm.ts; this wrapper
 * keeps the signature every existing consumer (renderer, tests) already uses.
 */
export declare function depthFromAnchorY(anchorY: number, config: DepthConfig): {
    depthT: number;
    scale: number;
    opacity: number;
};
/** A point on the rail ellipse at a given angle — exported so the ring renderer can constrain a
 * dragged string's anchor TO the rail (D17: strings slide along the rod, the hanger never
 * detaches from it). M1: delegates to the EllipseRailForm (RingConfig satisfies its geometry
 * structurally); same signature as before for existing consumers. */
export declare function pointOnRailEllipse(config: RingConfig, angleDeg: number): RailPoint;
/**
 * Computes ring-mode positions for `order` around the rail ellipse. `order` is the *same*
 * left-to-right sequence straight mode uses (shared state in the prototype) — index 0 lands at
 * the left edge of the visible arc, the last index at the right edge, spread evenly in between.
 * (Open note: "group to front" (D4) for ring mode should eventually mean "centered on the front
 * of the arc," not "first in this traversal" — that's a Phase-2 interaction concern, not solved
 * by this geometry-only pass; see wiki/design/open-questions.md.)
 *
 * D17: `angles` optionally overrides individual strings' BASE angles (degrees, before
 * `rotationOffsetDeg`) — set when the user slides a string along the rail. A slid string keeps
 * exactly the angle it was dropped at; strings without an entry keep their even-spread slot.
 * Positions in ring mode are therefore free/positional, not ordinal: sliding one string never
 * repositions any other.
 */
export declare function computeRingLayout(categories: HangingStringCategory[], order: string[], config: RingConfig, angles?: ReadonlyMap<string, number>): RingLayoutResult;
export type RailTickTier = "minor" | "medium" | "major";
export interface RailTick extends RailPoint {
    /** minor = every 6°, medium = every 30° (a bit longer), major = every 90° (longest — the
     * compass's "cardinal" marks: front/back/left/right). */
    tier: RailTickTier;
    /** True only for the major tick at the ring's front (angle 0 — "360/0" in compass terms) — the
     * one landmark the ring always needs, so it gets a distinct color instead of just being longer. */
    isFront: boolean;
}
/**
 * Graduated "compass ruler" around the *full* rail ellipse (D13) — a visual aid distinct from
 * D6's per-string bead-ticks. Drawn across all 360°, not just `visibleArcDeg`, so the rail itself
 * reads as a closed ring and the gap where no strings are placed reads as "the far side of the
 * ring," not a rendering bug. Depth/scale/opacity use the exact same math as string anchors
 * (`pointOnRailEllipse`) so the ruler recedes/fades in step with the strings around it.
 *
 * Three graduations, like a real compass rim: minor every 6°, a bit longer every 30°, and major
 * (longest) every 90° — i.e. front/right/back/left, the "90/180/270/360" the front is angle 0.
 */
export declare function computeRailTicks(config: RingConfig, stepDeg?: number): RailTick[];
/**
 * Ring-specific "group to front" (D4 ring variant — resolves the Q12 known-gap: straight mode's
 * `bringGroupToFront` moves a group to the START of `order`, which reads as "the front" only
 * because straight mode is left-to-right. Ring mode instead spreads `order` index 0..n-1 across
 * the visible arc's left..right edge, so index 0 is the arc's *left edge*, not its visual front
 * (angle 0, center, biggest/most opaque). To land there, the group's members need to sit in the
 * MIDDLE of `order` — stable-partitioned there, with the other ids split before/after (preserving
 * their relative order) so the group straddles the front as a natural consequence of the existing
 * index->angle spread, with no changes needed to computeRingLayout itself.
 */
export declare function centerGroupInRing(categories: HangingStringCategory[], order: string[], groupId: string): string[];
