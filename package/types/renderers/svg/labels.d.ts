/**
 * Shared label-content builder for both SVG renderers (straight + ring), so the two-line
 * label option renders identically in either rail mode.
 */
import type { HangingStringCategory } from "../../core/types";
/**
 * Fills a string's `<text>` label: single line (name only), or — when `twoLine` — the category
 * name on line 1 and "(value)" on line 2 via tspans. `x` must match the text element's own x
 * so the second line left-aligns with the first (tspans don't inherit x, only the flow
 * position), including inside rotated root labels, where "below" means along the tilted
 * baseline.
 */
export declare function setLabelContent(label: SVGTextElement, category: HangingStringCategory, twoLine: boolean, x: number): void;
