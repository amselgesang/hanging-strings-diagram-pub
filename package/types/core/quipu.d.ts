/**
 * D28 (v4, wiki/design/quipu-v4.md): quipu knot encoding — the 2nd metric rendered as REAL
 * khipu numbers on the cord. Pure, DOM-free layout math; the SVG renderers only draw what
 * this module places (same split as layout.ts/ringLayout.ts).
 *
 * The encoding is the khipu's decimal positional system (encoding B, user sign-off
 * 2026-07-22), with the glyph spec that survived six mockup iterations:
 *   - units digit nearest the knob (the cord's free end): figure-eight = 1, long knot with
 *     n countable wraps + a bypass strand = 2–9;
 *   - tens/hundreds/… as clusters of n simple bead knots, ONE GROUP PER DECIMAL PLACE,
 *     with a clear bare-cord GAP between groups (bands stacked toward the rail);
 *   - zero = a bare band (the gap itself is the digit);
 *   - every 5th knot FROM THE BOTTOM renders bigger (tally/subitizing aid) — in wraps,
 *     bead clusters, and bucket fallback alike;
 *   - when the cord is too short for full-size bands, slots COMPRESS (keeping inter-band
 *     gaps) so multi-digit values stay positional; only extremely short cords fall back
 *     to a single bucketed bead cluster (caption "×unit").
 *
 * Sign/fraction limitation (documented): khipu knots encode counts — the glyphs carry
 * round(abs(value)); `negative` flags the sign for the renderer/hover to surface.
 */
export interface QuipuConfig {
    /** Vertical slot per decimal band, sized for the worst-case digit (9 beads) + air. */
    bandSlotPx: number;
    /** Guaranteed bare cord between adjacent bands — the khipu "space" that also reads as 0. */
    bandGapPx: number;
    /** The units band's bottom sits this far above the knob (free-end reading origin). */
    knobOffsetPx: number;
    /** Bead-to-bead pitch inside a simple-knot cluster (> bead size: bare cord shows between). */
    beadPitchPx: number;
    /** Wrap-to-wrap pitch inside a long knot (tight: the wraps form ONE knot). */
    wrapPitchPx: number;
}
/** Chart-scale defaults — proportionally the mockup's values, tuned for ~300px drops.
 * Invariant (pinned by quipu.test.ts): the worst-case band content (9 beads: 6px inset +
 * 8×pitch + 5px headroom = 87px) must fit inside bandSlot − bandGap. */
export declare const DEFAULT_QUIPU_CONFIG: QuipuConfig;
/** All glyph `y`s are measured UPWARD from the knob (the khipu reading origin: units at the
 * free end). Renderers convert with `cy = dropPx - y`. */
export type QuipuGlyph = {
    type: "fig8";
    y: number;
} | {
    type: "long";
    y: number;
    turns: number;
} | {
    type: "simple";
    y: number;
    big: boolean;
};
export interface QuipuLayout {
    /** "positional" = full khipu bands; "bucket" = short-cord fallback A; "none" = no value. */
    mode: "positional" | "bucket" | "none";
    glyphs: QuipuGlyph[];
    /** Decimal digits, most-significant first (aria/debug/tests). Empty when mode = "none". */
    digits: number[];
    /** Bucket mode only: one bead ≈ this much (caption "×unit"). */
    bucketUnit?: number;
    /** The magnitude actually encoded: round(abs(value)). */
    displayValue: number;
    negative: boolean;
    /** Effective band slot used for this layout (full or compressed). */
    bandSlotPx?: number;
    /** Effective inter-band gap used for this layout. */
    bandGapPx?: number;
    /** Effective pitches used when placing/drawing glyphs (may be compressed). */
    beadPitchPx?: number;
    wrapPitchPx?: number;
}
/** The tally aid: every 5th knot counted from the bottom is bigger. `indexFromBottom` is
 * 0-based, so the 5th knot has index 4. */
export declare function isBigFifth(indexFromBottom: number): boolean;
/** Drop (cord length) needed to fit `nDigits` positional bands at FULL size — THE fallback
 * threshold before compression kicks in. */
export declare function quipuNeededDropPx(nDigits: number, cfg?: QuipuConfig): number;
/** A long knot's wrap-stack height for `turns` wraps (renderer + tests share it). */
export declare function wrapStackHeightPx(turns: number, cfg?: QuipuConfig): number;
/** Fit band slot/gap/pitches into the available cord while keeping digit groups separated. */
export declare function fitQuipuBandMetrics(dropPx: number, nDigits: number, cfg?: QuipuConfig): {
    bandSlotPx: number;
    bandGapPx: number;
    beadPitchPx: number;
    wrapPitchPx: number;
} | null;
export declare function computeQuipuLayout(value: number | undefined, dropPx: number, cfg?: QuipuConfig): QuipuLayout;
