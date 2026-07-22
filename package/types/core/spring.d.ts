/**
 * Minimal damped-spring ("shock absorber") integrator — the cheap-physics building block
 * behind D3 (parametric motion + tweens instead of a real physics engine) and now also the
 * pendulum-swing micro-interaction (D10). Pure, DOM-free, reusable by any renderer.
 *
 * Values are unitless: callers decide whether `value`/`target` represent pixels, degrees, etc.
 */
export interface SpringState {
    value: number;
    velocity: number;
}
export interface SpringParams {
    /** Restoring force strength — higher = snappier, faster oscillation. */
    stiffness: number;
    /** Energy dissipation — higher = settles faster, less overshoot. */
    damping: number;
    mass?: number;
}
/**
 * Semi-implicit Euler step of a damped harmonic oscillator toward `target`.
 * The damping term is solved implicitly (velocity_new appears on both sides, then isolated)
 * rather than using the old velocity — plain explicit damping goes numerically unstable
 * (spurious oscillation) once `damping * dt` gets large, which happens easily at typical
 * animation-frame `dt` values for a "snappy but not swingy" (overdamped) preset. The implicit
 * form is unconditionally stable for any damping value, so callers don't need to hand-tune dt.
 */
export declare function stepSpring(state: SpringState, target: number, params: SpringParams, dt: number): SpringState;
/** True once the spring is close enough to, and slow enough near, `target` to call it at rest. */
export declare function isSettled(state: SpringState, target: number, valueEpsilon?: number, velocityEpsilon?: number): boolean;
/** Snaps a spring exactly onto `target` — avoids perpetual imperceptible jitter (keeps D1 exact). */
export declare function settle(target: number): SpringState;
