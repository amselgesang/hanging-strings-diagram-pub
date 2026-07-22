/**
 * D28: the quipu knot GLYPHS — the SVG half of core/quipu.ts, shared by both renderers
 * (same split as labels.ts) so the six-iteration glyph spec lives in exactly one place:
 *
 *   - simple knot: a round bead, bare cord visible between beads; the 5th-from-bottom is
 *     bigger (count-in-fives);
 *   - long knot: countable separated ellipse WRAPS rotated 45° (helix slant of a real long
 *     knot) + an external bypass strand in the SAME thread paint as the cord, tight on the
 *     LEFT flank, top→bottom (what unifies the wraps into "one knot"); 5th wrap bigger;
 *   - figure-eight: two offset stroked lobes;
 *   - bucket fallback: bead cluster + a small "×unit" caption.
 *
 * Every glyph is one <g> positioned by a translate whose y is FIXED in the string's local
 * frame; the renderers' animation loops re-translate x along the bowed thread each frame
 * (exactly the bead-ticks' sway-follow). Sizes derive from the theme's thread width, so a
 * fat kernmantle rope gets proportionate knots (mockup ratios preserved: bead ≈ 0.9×sw,
 * wrap rx ≈ 1.3×sw).
 */
import { type QuipuConfig, type QuipuLayout } from "../../core/quipu";
export interface QuipuGlyphEl {
    g: SVGGElement;
    /** The glyph's y in the string's local frame (0 = anchor, dropPx = knob) — the animation
     * loop translates to (xAlongPolyline(points, y), y). */
    y: number;
}
/** Wipes and rebuilds `layer` from a computed QuipuLayout; returns the per-glyph groups the
 * animation loop repositions. */
export declare function buildQuipuLayer(layer: SVGGElement, layout: QuipuLayout, dropPx: number, paint: string, strokeWidth: number, cfg: QuipuConfig): QuipuGlyphEl[];
