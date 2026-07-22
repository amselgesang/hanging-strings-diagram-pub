/**
 * Pure layout math for Hanging Strings Diagram, straight-rail mode (v1 focus).
 * No DOM, no rendering-library types — any renderer (SVG/Canvas/React/D3) consumes
 * this same StringLayout[] output. See wiki/design/visual-design.md decisions D1, D5, D6, D7.
 */
import type { HangingStringCategory, HangingStringsDiagramConfig } from "./types";
import { type PlanarRailForm } from "./railForm";
export interface StringLayout {
    category: HangingStringCategory;
    /** x position of the string's anchor on the rail, in px. */
    x: number;
    /** y of the rail this string hangs from (top anchor). One shared value for every root string
     * in straight mode (D1); a child string's railY is its parent's sub-rail (D16). */
    railY: number;
    /** y of the knob (string's lower tip). railY + dropPx. Exact value read channel — D1. */
    knobY: number;
    /** Pixel length of the string. Proportional to category.value — never cosmetic (D1). */
    dropPx: number;
    /** Knob radius in px — uniform, or scaled by secondaryValue when config.knobEncodesSecondMetric (D7). */
    knobRadius: number;
    /** Bead-tick positions along the string, in px from the rail (D6). */
    ticks: {
        value: number;
        y: number;
    }[];
    /** v2 (D16): set when this string is a child hanging from a parent's sub-rail — the parent
     * category's id. Roots leave it undefined. Reorder scoping uses it (siblings only). */
    parentId?: string;
}
/** v2 (D16): a small rail hanging at an expanded parent's knob, carrying its child strings. */
export interface SubRailLayout {
    parentId: string;
    x1: number;
    x2: number;
    y: number;
}
export interface LayoutResult {
    strings: StringLayout[];
    /** M1 (wiki/design/rail-forms.md): the planar form the roots hang from — renderers draw the
     * rod's shape from it (railPath) instead of assuming a full-width straight line. */
    railForm: PlanarRailForm;
    /** The straight form's shared rail height. Kept for straight mode's shared-baseline reads
     * (D1 comparability); per-string anchor heights live on StringLayout.railY, which is what
     * non-straight planar forms (M2+) will vary. */
    railY: number;
    contentWidth: number;
    maxValue: number;
    tickStepValue: number;
    /** v2 (D16): sub-rails for expanded branches. Absent/empty in flat v1 layouts. */
    subRails?: SubRailLayout[];
    /** v2 (D16): lowest content edge (max knobY + knob radius) so a renderer can grow its canvas
     * downward when an expanded branch needs the room. Absent in flat v1 layouts. */
    contentHeight?: number;
}
/**
 * Knob radius scale shared by every rail mode (D7): size = optional secondary metric,
 * magnitude-only (sqrt-scaled) since a size channel can't show sign. Domain is derived once from
 * whatever secondary values are present in the dataset — call this once per layout pass, not per
 * category, and reuse the returned function. Categories without a secondary value (or when
 * `knobEncodesSecondMetric` is off) get the uniform `knobMinRadiusPx` marker size.
 */
export declare function knobRadiusScaleForCategories(categories: HangingStringCategory[], config: Pick<HangingStringsDiagramConfig, "knobEncodesSecondMetric" | "knobMinRadiusPx" | "knobMaxRadiusPx">): (category: HangingStringCategory) => number;
export declare function computeLayout(categories: HangingStringCategory[], order: string[], config: HangingStringsDiagramConfig, 
/** M1: the planar rail geometry the roots hang from. Defaults to the straight rod at
 * config.railY, so every pre-M1 caller (and test) is unchanged; M2+ forms plug in here. */
form?: PlanarRailForm, 
/** D20: per-string along-the-rail position overrides — the planar mirror of ring mode's
 * `angles` map. A string with an entry sits exactly there (arc length from the rod's left
 * end); strings without one keep their D5 even-spread slot. Positions are free, not ordinal:
 * overriding one string never repositions any other. */
positions?: ReadonlyMap<string, number>): LayoutResult;
/**
 * "Group to front" (D4/requirements): stable-partitions `order` so every category in
 * `groupId` moves to the front, preserving relative order within and outside the group.
 */
export declare function bringGroupToFront(categories: HangingStringCategory[], order: string[], groupId: string): string[];
