/**
 * The cloth ENGINE, shared by the SVG and canvas backdrop renderers: the organic breeze
 * signal, the adaptive degradation ladder, and the rAF driver with the ~30 fps draw cap and
 * sub-pixel perceptibility gate (queries/breeze-webkit-gpu-idle-2026-08-16). The renderers
 * own only how a frame is PAINTED (SVG attribute writes vs canvas 2d); everything about
 * when to paint, at what detail, and with what wind lives here — one implementation, so a
 * perf tuning never has to be made twice.
 *
 * BREEZE MODEL — organic, endless, never visibly repeating: real breezes don't loop, so
 * instead of a fixed-period animation the wind is a sum of slow sines with INCOMMENSURATE
 * periods (11.3s / 23.7s / 8.9s / 19.3s share no common multiple within hours), one pair
 * modulating SPEED (how fast the wave travels through the cloth) and one pair INTENSITY (how
 * far the cloth billows). The wave phase INTEGRATES the speed signal, so gusts genuinely
 * accelerate the fabric rather than just scaling it. Deterministic and cheap — no RNG state,
 * no physics solver, and testable as pure math.
 */
/** Peak bottom-edge billow in view units at intensity 1 (also scales the loop's
 * perceptibility estimate — it is the cloth's overall motion gain). */
export declare const WAVE_AMPLITUDE = 26;
/** Moving pleat waves (D21.1): the cloth's shading is sampled as this many vertical strips —
 * enough for smooth ridges at the wave frequencies, few enough to stay trivial. */
export declare const PLEAT_STRIPS = 28;
/** D21.4 warp mesh dimensions at full detail (rung 0). */
export declare const MESH_COLS = 28;
export declare const MESH_ROWS = 4;
/**
 * Adaptive degradation ladder (queries/breeze-cloth-mobile-fps option 4): when the page's
 * measured rAF cadence stays slow, the cloth sheds detail one rung at a time — and climbs
 * back when the budget recovers. Rung 1 is exactly the static coarse-pointer LOD (phones
 * START there); rung 3 freezes the cloth into the same static drape reduced-motion uses,
 * while the chart's thread wind (cheap) keeps the breeze alive.
 */
export interface LadderProfile {
    cols: number;
    rows: number;
    strips: number;
    frozen: boolean;
}
export declare function ladderProfile(rung: number): LadderProfile;
export declare const LADDER_MAX = 3;
/** Minimum ms between DRAWN cloth frames, every rung, every device (~30 fps; supersedes the
 * old rung-1 `halfRate` flag). A cloth wave at 30 fps is visually indistinguishable from 60,
 * and the cap is what keeps 120 Hz ProMotion displays from paying DOUBLE the paint bill —
 * rAF fires at the display rate, and WebKit's GPU process rasterizes every drawn frame.
 * Chosen just under two 60 Hz frames so vsync jitter can't push a draw to the third frame. */
export declare const DRAW_MIN_INTERVAL_MS = 30;
/** Skip a cloth frame entirely when the integrated wind has moved the fabric less than this
 * many view units (~CSS px) since the LAST DRAWN frame — during lulls the phase creeps so
 * slowly that redrawing would repaint for sub-pixel motion the eye can't see. Phase keeps
 * integrating; the skipped motion accumulates and the next draw shows it. */
export declare const DRAW_EPSILON_PX = 0.25;
export interface BreezeSignal {
    /** Wave travel speed multiplier — drifts around 1, gusts up, lulls down. */
    speed: number;
    /** Billow amplitude multiplier, 0.15..~1.2 — calm to fresh breeze. */
    intensity: number;
}
export declare function breezeSignal(t: number): BreezeSignal;
/** What a renderer plugs into the shared loop. */
export interface ClothLoopHost {
    /** Gate: the loop runs only while this is true (enabled && motionEnabled && !suspended). */
    mayRun(): boolean;
    /** D21.8 shake-envelope multiplier applied to the organic intensity each frame. */
    intensityScale(): number;
    /** Mobile perf: coarse pointers start (and never recover past) rung 1. */
    baselineRung: number;
    /** The ladder stepped to a new profile — resize cell pools etc. Called before any draw at
     * the new detail; NOT called for the initial profile (read `profile()` at build time). */
    onProfile(prof: LadderProfile): void;
    /** Paint one frame of cloth at the given wave phase and billow intensity. */
    draw(phase: number, intensity: number): void;
}
export interface ClothLoop {
    /** Start or park the rAF loop to match `mayRun()` — call after any gate flips. */
    ensure(): void;
    /** Fresh ladder start at the baseline rung (explicit breeze turn-on: the user asked for
     * the effect, so give it a full-detail chance instead of honoring stale page-load jank). */
    resetLadder(): void;
    /** The cloth's LOOK changed (texture, top, span, image): draw immediately when the loop is
     * parked or frozen (static drape), else let the next drawable frame bypass the epsilon
     * gate. One call covers both states. */
    poke(): void;
    /** Current detail profile (initial = baseline rung's). */
    profile(): LadderProfile;
    /** True while the rAF loop is scheduled. */
    running(): boolean;
    dispose(): void;
}
export declare function createClothLoop(host: ClothLoopHost): ClothLoop;
