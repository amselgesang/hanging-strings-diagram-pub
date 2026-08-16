/** Skip no-op SVG attribute writes in hot paths (render + RAF). */
export declare function setAttrIfChanged(el: Element, name: string, value: string): void;
/** Quantize a per-frame display coordinate to 0.1 CSS px. WebKit repaints an SVG region for
 * ANY attribute change, however sub-pixel — under ambient breeze the spring nodes drift by
 * ~0.001 px/frame even when the strings look still, which used to re-rasterize the whole
 * chart every frame (com.apple.webkit.gpu pegged at idle). Rounding the DISPLAY value (never
 * the physics state) makes those writes byte-identical so setAttrIfChanged genuinely skips
 * them; 0.1 px is far below what a 2–3× Retina pixel can show. */
export declare function qpx(n: number): number;
/** Finer quantum for multiplicative per-frame values (depth scale, opacity), where 0.1 would
 * visibly step: 1e-4 error on a unit-ish factor is ~0.01 px over a 100 px string. */
export declare function q4(n: number): number;
