/**
 * Framework-agnostic data & config types for Hanging Strings Diagram.
 * No DOM / rendering-library references belong in this file — see wiki/implementation/typescript-plan.md.
 */
export interface HangingStringGroup {
    id: string;
    name: string;
    /** Categorical color for this group (used in "group" color mode). */
    color: string;
}
export interface HangingStringCategory {
    id: string;
    name: string;
    groupId: string;
    /** Primary metric — encoded as string length (D1: exact, non-cosmetic). */
    value: number;
    /** Optional secondary metric — encodes knob size (D7) and/or heat-map color (D8). */
    secondaryValue?: number;
    /** v2 (D16): optional child categories — rendered as strings hanging from a sub-rail anchored
     * at this category's knob when the branch is expanded. Children may nest further (the sub-rail
     * mechanism is recursive by construction), though the fail-fast prototype renders one expanded
     * branch and two levels. Values are independent of the parent's unless the caller chooses a
     * sum convention — see wiki/design/hierarchy-v2.md sub-question 2. */
    children?: HangingStringCategory[];
}
export type ColorMode = "group" | "heatmap";
export interface HangingStringsDiagramConfig {
    colorMode: ColorMode;
    /** D7: whether knob radius encodes secondaryValue. If false, knobs are a uniform marker size. */
    knobEncodesSecondMetric: boolean;
    /** Approx number of bead-ticks (D6) to place along the longest string. */
    tickTarget: number;
    /** Pixel gap between adjacent strings within the same group. */
    itemGapPx: number;
    /** Additional pixel gap inserted between two different groups (D5: dynamic spacing). */
    groupGapPx: number;
    /** Rail y position in px. */
    railY: number;
    /** Max pixel drop for the largest value in the dataset. */
    maxDropPx: number;
    knobMinRadiusPx: number;
    knobMaxRadiusPx: number;
}
export declare const DEFAULT_CONFIG: HangingStringsDiagramConfig;
