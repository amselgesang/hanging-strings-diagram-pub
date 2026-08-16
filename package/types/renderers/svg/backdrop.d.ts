/**
 * D21: the animated backdrop — a white sheet hanging behind the chart, waving as if blown by
 * a breeze (user request, 2026-07-15: "a waving white sheet… in a loop and just like a real
 * breeze it should be random speed and random intensity"). Fits the hanging metaphor: a cloth
 * backdrop pinned up behind the strings, giving the diagram depth.
 *
 * The WIND model, adaptive degradation ladder, and rAF driver (draw cap + perceptibility
 * gate) live in the shared ../clothLoop.ts — this file re-exports them for its historical
 * consumers and adds the SVG-specific painting plus the cloth GEOMETRY math (offsets, warp
 * mesh, pleat shading), which the canvas backdrop imports in turn.
 *
 * PERFORMANCE (texturing.md budget): no SVG filters anywhere — the sheet is one path + a few
 * gradient-filled fold streaks, rebuilt each frame from ~a dozen trig calls. The rAF loop
 * only runs while enabled and parks itself when `prefers-reduced-motion` is set (a static,
 * gently-draped sheet still renders — depth without motion).
 */
export { breezeSignal, DRAW_EPSILON_PX, DRAW_MIN_INTERVAL_MS, LADDER_MAX, ladderProfile, WAVE_AMPLITUDE, type BreezeSignal, type LadderProfile, } from "../clothLoop";
/** The backdrop's own fixed drawing space; the svg stretches it to the container
 * (`preserveAspectRatio="none"`), so cloth geometry never needs resize plumbing. */
export declare const VIEW_W = 1000;
export declare const VIEW_H = 560;
/** Margins that let the page background show around the sheet — it reads as a hung cloth,
 * not a second page background. */
export declare const SHEET_MARGIN_X = 56;
/** Default top edge. D21.5: like the D21.3 hem, the top is LIVE — main.ts measures the
 * visible rail's line (the rod in planar modes, the ring's top rim) in container pixels and
 * pins the cloth there via setTop(), so the sheet visibly hangs from the same line the
 * strings do instead of floating at its own height. This constant only covers the beat
 * before the first measurement. */
export declare const SHEET_TOP = 22;
/** D21.6: the live top is a PROFILE, not one height — main.ts samples the rendered rail's
 * geometry (straight rod, arc, wave, or the ring's back rim) and the cloth's top edge follows
 * that curve, so the sheet visibly hangs from whatever form the rail takes. */
export declare const TOP_PROFILE_POINTS = 33;
/** The top edge — one height (a straight rod) or a sampled curve across the sheet's width. */
export type SheetTopProfile = number | readonly number[];
/** Container-px x of sheet-fraction `u` — main.ts uses this to sample the rail at exactly the
 * cloth's own x positions (the backdrop's x view-units are container-width/1000). */
export declare function sheetXPx(u: number, containerWidthPx: number): number;
/** The profile's height at fraction `u` — scalar passthrough, linear interp for curves. */
export declare function profileAt(top: SheetTopProfile, u: number): number;
/** Hem base distance from the view's bottom edge — leaves room for the downward billow.
 * D21.3: the viewBox HEIGHT is live (the container's pixel height, tracked by a
 * ResizeObserver) and the chart shell reserves extra bottom padding, so the hem hangs BELOW
 * the lowest knob however far branches grow the canvas. */
export declare const SHEET_BOTTOM_MARGIN = 46;
/** Peak pleat opacity at full shading (element opacity scales with the local wave slope). */
export declare const PLEAT_MAX_OPACITY = 0.17;
/** Lateral cloth displacement at height-fraction `v` (0 = pinned top, 1 = free bottom) and
 * horizontal fraction `u`, for wave phase `phase` and billow `intensity`. The top is pinned
 * (displacement → 0), the free edge moves most — like a real hung sheet. Two superimposed
 * traveling waves with irrational frequency ratio keep the cloth from ever looking periodic
 * across its width. */
export declare function clothOffset(u: number, v: number, phase: number, intensity: number): number;
/** The sheet outline at a given phase/intensity — pinned straight top, gently waving sides,
 * billowing bottom edge (smooth quadratic runs through the sampled wave). Pure: testable. */
export declare function sheetPath(phase: number, intensity: number, bottom?: number, top?: SheetTopProfile, left?: number, right?: number): string;
/** D21.4 warp mesh (user, 2026-07-15: "distort the texture as the sheet moves"): the
 * patterned cloths render as a COLS×ROWS mesh of cells whose rectangle paths are STATIC —
 * only each cell's affine transform updates per frame, mapping it onto its displaced corners.
 * The pattern fill rides the element transform, so the weave stretches and shears WITH the
 * fabric (a printed cloth, not a window onto wallpaper); per-cell affinity keeps neighboring
 * checks near-continuous, and a same-paint 1px stroke hides the hairline seams of the
 * non-affine residual. */
/** Cells extend this far into their right/bottom neighbors so affine residual gaps never
 * show the page background through the cloth. */
export declare const MESH_OVERLAP = 0.75;
/** A mesh corner's displaced position — the same wave field as the hem/pleats, applied over
 * the whole cloth: vertical billow (pin-scaled by clothOffset's v²) plus the horizontal
 * shimmy, so the hem row reproduces sheetPath's hem exactly and the top row stays pinned. */
export declare function meshCorner(u: number, v: number, phase: number, intensity: number, bottom?: number, top?: SheetTopProfile, left?: number, right?: number): {
    x: number;
    y: number;
};
/**
 * D21.1 (user, 2026-07-15: "use moving pleat waves instead to show how the sheet is blown"):
 * signed pleat shading at horizontal fraction `u` — the HORIZONTAL GRADIENT of the cloth's
 * displacement field. A ridge angled toward the light reads bright (+), the valley behind it
 * dark (−); and because the displacement waves travel (the phase integrates the wind speed),
 * the pleats sweep across the sheet — the shading IS the physics, so pleats move exactly as
 * fast as the gusts push the fabric. Normalized to −1..1 at full intensity; a calm breeze
 * shades faintly, a gust deepens the pleats. Pure: testable.
 */
export declare function pleatShade(u: number, phase: number, intensity: number): number;
/**
 * D21.2 (user, 2026-07-15: "slightly, randomly move the threads by the same random breeze"):
 * the wind acceleration (px/s²) a thread at horizontal fraction `u` feels. SAME spatial
 * frequencies and phase convention as the cloth waves, so the threads sway in the very gust
 * the sheet's pleats show traveling behind them — one wind for the whole scene. Intensity is
 * squared: lulls leave the threads nearly still, gusts visibly stir them ("slightly, randomly").
 */
export declare function threadWindAccel(u: number, phase: number, intensity: number): number;
/** D21.3 sheet textures: the plain white cloth, a red-gingham tablecloth, or the Bavarian
 * blue-white lozenge check (Rauten). Keys are the Backdrop dropdown's option values. */
export type SheetTexture = "plain" | "tablecloth" | "bavarian" | "eu" | "usa" | "image";
/**
 * Pre-rasterization of the vector flag cloths (queries/breeze-cloth-mobile-fps option 6):
 * as live SVG, every warp-mesh cell re-rasterizes the flag's ~60 vector nodes under a fresh
 * affine each frame. Baked once into a bitmap, each cell is a plain texture sample instead.
 * Drawn with canvas 2D (same geometry as the markup builders above); returns null when no
 * 2d context exists (tests, exotic embeds) — the caller then keeps the vector content.
 */
export declare function bakeFlagCanvas(kind: "eu" | "usa"): HTMLCanvasElement | null;
export interface SheetBackdrop {
    setEnabled(enabled: boolean): void;
    setTexture(texture: SheetTexture): void;
    /** D21.5/D21.6: pin the cloth's top edge (container px) to the visible rail — one height
     * for a straight rod, or a sampled curve (TOP_PROFILE_POINTS values across the cloth's
     * horizontal span) that follows an arc/wave rail or the ring's back rim. */
    setTop(top: SheetTopProfile): void;
    /** D21.7 (2026-07-20): pin the cloth's HORIZONTAL span (container px) to the rendered
     * rail's extent — the sheet hangs exactly as wide as the diagram, not as wide as whatever
     * container hosts it. `containerWidthPx` converts px → the cloth's fixed view units. */
    setSpan(leftPx: number, rightPx: number, containerWidthPx: number): void;
    /** D21.10: the URL the "image" cloth drapes (any flag/logo/photo — stretched like printed
     * fabric). Takes effect when the texture is (or becomes) "image". */
    setImage(url: string): void;
    /** Freeze/resume the breeze loop while an interaction needs the frame budget (disc spin). */
    setSuspended(suspended: boolean): void;
    /**
     * D21.8: allow the sheet to stay visible while its rAF is parked (static drape). Unlike
     * `setEnabled(false)` this does NOT hide the SVG — used for mobile shake-gated breeze.
     * Default true (continuous breeze). Ignored when `prefers-reduced-motion` already forces
     * a static sheet.
     */
    setMotionEnabled(on: boolean): void;
    /**
     * D21.8: multiplies the organic `breezeSignal` intensity each frame (shake envelope scale).
     * Clamped to ≥0; default 1.
     */
    setIntensityScale(scale: number): void;
    dispose(): void;
}
/**
 * Mounts the breeze backdrop as the container's first child (behind the chart svgs — see the
 * .hsd-backdrop stacking rules in style.css) and drives it with its own rAF loop. The loop
 * runs only while enabled; with `prefers-reduced-motion` the sheet renders once, gently
 * draped, and never animates.
 */
export declare function createSheetBackdrop(container: HTMLElement): SheetBackdrop;
