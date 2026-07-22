/**
 * Q25 (integration.md): the value-hover event both renderers emit for hosts that wire their
 * own tooltips instead of (or alongside) the built-in hover card. Fired with the hovered
 * string's data on pointer enter and `null` on leave/drag-start; never per animation frame.
 */
import type { HangingStringCategory } from "../../core/types";
export interface StringHoverEvent {
    id: string;
    /** The parent category's id when the hovered string is a child on a sub-rail (D16). */
    parentId: string | null;
    category: HangingStringCategory;
    /** Container-px anchor where the built-in card would sit — a host tooltip can use it
     * directly (the chart svg's top-left equals the container's content origin). */
    x: number;
    y: number;
}
