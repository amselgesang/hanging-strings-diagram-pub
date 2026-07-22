/**
 * Small dependency-free scale helpers (no d3). Kept pure so the core has zero
 * runtime dependencies and can be reused verbatim by every renderer.
 */
/** Rounds a raw step up to a "nice" 1/2/5 * 10^n value (same family as d3.tickStep). */
export declare function niceStep(rawStep: number): number;
/** Picks a "nice" tick step for [0, maxValue] targeting roughly `targetCount` ticks. */
export declare function tickStep(maxValue: number, targetCount: number): number;
/** Generates tick values in (0, maxValue) at the given step — excludes 0 and the endpoint. */
export declare function ticksBelow(maxValue: number, step: number): number[];
export declare function linearScale(domain: [number, number], range: [number, number]): (v: number) => number;
/**
 * Square-root scale — perceptually correct for encoding value via a circle's radius/area.
 * Domain is clamped to >= 0: sqrt is undefined for negatives, so callers encoding a signed
 * metric via size must pre-map to magnitude (abs value) before calling this — sign belongs
 * on a different channel. Clamping here just prevents NaN if that contract is violated.
 */
export declare function sqrtScale(domain: [number, number], range: [number, number]): (v: number) => number;
/** Interpolates a simple blue -> yellow -> red sequential heat-map color for t in [0,1]. */
export declare function heatmapColor(t: number): string;
