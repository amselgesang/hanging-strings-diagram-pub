/**
 * v2 hierarchy layout (D16, Q11): "sub-rail from a knob" — an expanded parent's knob anchors a
 * miniature rail its children hang from, strings-from-strings. Pure layout math, no DOM, same
 * separation of concerns as core/layout.ts (which computes the root level and is reused here
 * verbatim, not duplicated).
 *
 * Fail-fast prototype scope (see wiki/design/hierarchy-v2.md):
 * - Two levels (roots + children), straight mode only. The mechanism is recursive by
 *   construction, but recursion ships only after this proves readable.
 * - Any number of branches may be open at once (`expandedIds`) — user feedback rejected the
 *   earlier one-at-a-time accordion.
 * - **Absolute value scale across levels (D1):** children use the exact same px-per-value
 *   mapping as the roots, so a child's length can be compared against any root string directly,
 *   and the root bead-tick step (D6) stays truthful on sub-rail strings too.
 * - Children get a uniform, slightly smaller knob (no D7 second-metric sizing at depth yet).
 * - Child slots are centered under the parent's anchor; the sub-rail spans them with a small
 *   overhang. Sub-rail strings may visually overlap neighboring roots — accepted for the
 *   prototype (hierarchy-v2.md sub-question: sub-rail-aware root spacing vs. overlay).
 */
import type { HangingStringCategory, HangingStringsDiagramConfig } from "./types";
import type { PlanarRailForm } from "./railForm";
import { type LayoutResult } from "./layout";
export interface HierarchyConfig extends HangingStringsDiagramConfig {
    /** Vertical gap between a parent's knob and its children's sub-rail (the "hook" length). */
    subRailGapPx: number;
    /** Horizontal slot width between adjacent child strings on a sub-rail. */
    childGapPx: number;
    /** Extra sub-rail length beyond the outermost child anchors, per side. */
    subRailPadPx: number;
    /** Child knob radius as a fraction of knobMinRadiusPx (children are uniform beads for now). */
    childKnobFactor: number;
}
export declare const DEFAULT_HIERARCHY_EXTRAS: Pick<HierarchyConfig, "subRailGapPx" | "childGapPx" | "subRailPadPx" | "childKnobFactor">;
/**
 * Root layout via computeLayout, plus — for every root in `expandedIds` that has children — a
 * sub-rail hanging `subRailGapPx` below that parent's knob with the children laid out on it.
 * `childOrders` carries per-parent sibling order (initial slot spread only, since D20 retired
 * reorder); parents without an entry use their natural children order.
 */
export declare function computeHierarchyLayout(categories: HangingStringCategory[], order: string[], childOrders: ReadonlyMap<string, string[]>, expandedIds: ReadonlySet<string>, config: HierarchyConfig, 
/** M2: the planar rail geometry (see computeLayout) — the sub-rails themselves stay straight
 * mini rods hanging from the knob whatever the root form is (Q15 interim call, recorded in
 * wiki/design/rail-forms.md). */
form?: PlanarRailForm, 
/** D20: root position overrides, forwarded to computeLayout. */
positions?: ReadonlyMap<string, number>, 
/** D20 one level down: per-child slide overrides as offsets from the PARENT's anchor x —
 * parent-relative (like the ring's child angles) so a slid child keeps riding its parent
 * when the parent moves. Children without an entry keep their even-spread slot. */
childPositions?: ReadonlyMap<string, number>): LayoutResult;
/** The parent category of `childId`, or null when `childId` is a root (or unknown). */
export declare function findParentOf(categories: HangingStringCategory[], childId: string): HangingStringCategory | null;
