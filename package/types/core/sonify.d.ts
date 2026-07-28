/**
 * D31 (v4, Track F — wiki/design/sonification-v4.md): the sonification MAPPING — pure,
 * DOM/audio-free math (same split as layout.ts vs the SVG renderers): value → frequency,
 * strings → a scheduled left-to-right sweep. The WebAudio half (Karplus-Strong plucks)
 * lives in renderers/audio/pluck.ts and only plays what this module schedules.
 *
 * User-signed parameters (2026-07-22): pitch direction PHYSICAL (longer cord = LOWER note —
 * a real string's frequency ∝ 1/length, so the mapping falls out of the metaphor), scale
 * PENTATONIC over 2 octaves from A2 (quantized rungs beat glides for comparison; pentatonic
 * guarantees no sour adjacent intervals), Karplus-Strong pluck timbre, stereo pan follows x,
 * sweep tempo 150 ms/string.
 *
 * The value domain is 0-based ([0, max]) to mirror dropPx: cord length starts at zero at the
 * rail (D1), so equal values must sound equal and the audio may never contradict geometry.
 */
export type PitchDirection = "physical" | "convention";
export type SonifyScale = "pentatonic" | "chromatic" | "continuous";
export interface SonifyConfig {
    /** The lowest rung of the range. A2 = 110 Hz — deep enough that "longer = lower" has room
     * to feel heavy, high enough for laptop speakers to reproduce. */
    rootHz: number;
    /** Range above the root. 2 octaves ≈ the sweet spot: wide enough to rank ~10 rungs,
     * narrow enough that the ends still sound like the same instrument. */
    octaves: number;
    scale: SonifyScale;
    direction: PitchDirection;
    /** Sweep tempo — one string every this many ms (user-signed: 150). */
    sweepStepMs: number;
    /** Stereo width: the leftmost string pans to −spread, the rightmost to +spread. */
    panSpread: number;
}
/** The D31 defaults exactly as signed off. */
export declare const DEFAULT_SONIFY_CONFIG: SonifyConfig;
/**
 * value → frequency (Hz). `domain` is [min, max] — pass [0, maxValue] in-product (see module
 * note). Quantized scales snap to rungs; "continuous" maps linearly in log-frequency (equal
 * value steps = equal musical intervals, how pitch is actually heard).
 */
export declare function frequencyFor(value: number, domain: [number, number], cfg?: SonifyConfig): number;
/** One scheduled note of a sweep. `atMs` is relative to the sweep's start. */
export interface SweepNote {
    freq: number;
    /** −1..1 stereo position (already spread-limited per cfg.panSpread). */
    pan: number;
    atMs: number;
    gain: number;
}
/**
 * The "play the chart" sweep: strings sorted by x (the current visual order — slid positions
 * and all), one pluck per string at the signed tempo, pan tracking x across the rail. Pure
 * and renderer-agnostic: callers feed {value, x} from whichever layout is live.
 */
export declare function sweepSchedule(items: readonly {
    value: number;
    x: number;
}[], valueDomain: [number, number], cfg?: SonifyConfig): SweepNote[];
