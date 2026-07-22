/**
 * D30: slide/grab geometry hugs the lower weight (knob), not the full cord — so a finger or
 * cursor crossing the upper thread does not accidentally start a slide.
 */
export declare function lowerEndHitGeometry(dropPx: number, knobRadius: number): {
    x: number;
    width: number;
    y: number;
    height: number;
};
/** Expand/collapse press target — sits on the knob face, above the slide hit. */
export declare function expandHitRadius(knobRadius: number): number;
