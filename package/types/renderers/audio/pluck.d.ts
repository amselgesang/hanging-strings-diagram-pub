/**
 * D31 (Track F): the INSTRUMENT — Karplus-Strong plucked-string synthesis, the WebAudio half
 * of core/sonify.ts (which does all the math; this module only plays what it schedules).
 *
 * Karplus-Strong is the classic physically-modeled string: a burst of noise fed through a
 * tuned, damped delay line. ~15 lines, no dependency, no samples to ship — and it IS a
 * string, which is the whole point of the metaphor. Each pluck renders offline into an
 * AudioBuffer (deterministic, no live feedback-node fragility) and buffers are cached per
 * frequency, so a sweep re-plucks cached strings for free.
 *
 * AudioContext policy: ONE shared context per page (browsers cap concurrent contexts),
 * created LAZILY on the first pluck — which is always inside a user gesture (a Play click,
 * a drag release), satisfying autoplay rules by construction. Instances own only their
 * master gain node; dispose() disconnects it and leaves the shared context alone.
 */
export interface PluckOptions {
    /** −1..1 stereo position. Default 0 (center). */
    pan?: number;
    /** 0..1 per-pluck gain (velocity). Default 0.5. */
    gain?: number;
    /** Delay before the pluck sounds, ms from now. Default 0. */
    whenMs?: number;
}
export interface PluckPlayer {
    /** Schedules one pluck. Safe to call in bursts — a sweep is just many of these. */
    pluck(freq: number, opts?: PluckOptions): void;
    /** Silences every scheduled/sounding pluck immediately (the façade's stop()). */
    stopAll(): void;
    /** Master volume for this player (0..1). */
    setVolume(volume: number): void;
    /** stopAll + disconnect this player's nodes. The shared AudioContext survives. */
    dispose(): void;
}
export declare function createPluckPlayer(initialVolume?: number): PluckPlayer;
