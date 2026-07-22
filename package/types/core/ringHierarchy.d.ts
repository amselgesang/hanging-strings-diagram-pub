/**
 * v2 hierarchy layout for ring mode (D16 extended, Q11): the same "sub-rail from a knob"
 * mechanism straight mode uses (core/hierarchy.ts), mapped onto the perspective ring. Pure
 * layout math, no DOM — mirrors the straight version's separation of concerns and reuses
 * computeRingLayout verbatim for the root level.
 *
 * How the branch inherits the ring's fake-3D (D3): the whole branch lives at the PARENT's depth
 * — children start from the parent's depthT/scale/opacity rather than deriving their own from
 * anchorY (their anchors sit far below the ellipse, where the depth formula is meaningless).
 * D16.1 composes a LOCAL depth on top: the sub-rail is itself a miniature ring, and a child's
 * angle around it contributes its own scale/opacity multiplier (see `localScale`). Child
 * `dropPx` stays pure value math on the ROOT scale (D1 absolute across levels, same as straight
 * mode); only the rendered pixels are foreshortened by the parent's cosmetic depth scale,
 * exactly the compromise ring mode already makes for root strings.
 *
 * Geometry is intentionally parent-RELATIVE where it matters: `slotOffsetX` (unscaled) and the
 * sub-rail's `halfSpanPx`/`gapPx` (unscaled) let the renderer re-derive everything from the
 * parent's live, animated knob every frame — the branch must hang from the parent string as it
 * slides around the arc or is dragged, not float at its resting slot (same attachment semantics
 * the user asked for in straight mode). The at-rest anchors computed here only seed animation
 * targets and hit-area sizing.
 */
import type { HangingStringCategory } from "./types";
import { type RingConfig, type RingLayoutResult } from "./ringLayout";
export interface RingHierarchyConfig extends RingConfig {
    /** Vertical gap between a parent's knob and its children's sub-rail, unscaled px — same role
     * (and same default, via DEFAULT_HIERARCHY_EXTRAS) as HierarchyConfig.subRailGapPx. */
    subRailGapPx: number;
    /** Horizontal slot width between adjacent child strings, unscaled px. */
    childGapPx: number;
    /** Extra sub-rail length beyond the outermost child anchors, per side, unscaled px. */
    subRailPadPx: number;
    /** Child knob radius as a fraction of knobMinRadiusPx (uniform beads, like straight mode). */
    childKnobFactor: number;
}
/**
 * Root layout via computeRingLayout, plus — for every root in `expandedIds` that has children —
 * a sub-rail hanging below that parent's knob with the children on it. Children are spliced into
 * the back-to-front array immediately AFTER their parent so they paint just in front of it
 * (they share its depth; stable order keeps the branch visually on top of its own trunk).
 */
export declare function computeRingHierarchyLayout(categories: HangingStringCategory[], order: string[], childOrders: ReadonlyMap<string, string[]>, expandedIds: ReadonlySet<string>, config: RingHierarchyConfig, 
/** D17: per-string base-angle overrides for slid roots (see computeRingLayout) — children
 * always hang from their parent's knob, so they follow a slid parent automatically. */
angles?: ReadonlyMap<string, number>, 
/** D19: per-parent spin offsets (degrees) for the mini rings — each expanded branch's disc
 * can be rotated independently, exactly like the main ring's `rotationOffsetDeg`. Children of
 * a spun branch travel around their mini ring, including onto its back arc. */
subRotations?: ReadonlyMap<string, number>, 
/** D17-for-children: per-child BASE-angle overrides (degrees, before the branch's rotation
 * offset) for children the user has slid around their mini ring — same free-position contract
 * as `angles` for roots: a slid child stays exactly where it was dropped, nobody else moves.
 * Children without an entry keep their even-spread slot. */
childAngles?: ReadonlyMap<string, number>): RingLayoutResult;
