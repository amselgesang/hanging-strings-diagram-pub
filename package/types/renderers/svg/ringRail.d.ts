/**
 * D19: the ring-rail assembly — the reusable "spinnable disc" component. One instance bundles
 * everything a perspective ring rail is made of:
 *
 *   - the vinyl plate (D13 follow-up) — the filled disc inside the rail ellipse;
 *   - the D18 spin-affordance arrows lying on the plate surface, rotating on their inertia
 *     spring and foreshortening per-point through the squashed-ellipse projection;
 *   - the rail ellipse itself (the rod strings hang from);
 *   - optionally the D13 compass ruler (graduated marks around the full ellipse);
 *   - the Q12b rotate gesture: drag anywhere on the disc to spin it, deltas coalesced per
 *     animation frame and reported through `onRotate`.
 *
 * Extracted from RingSvgRenderer so the exact same component serves both the top-level ring and
 * each expanded parent's D16.1 mini ring — the branch doesn't just LOOK like its parent rail, it
 * IS the same rail, at a smaller geometry (all arrow/plate proportions are fractions of the
 * disc's semi-axes, so they scale for free), with its own rotation offset.
 *
 * The component owns no animation loop: the renderer's existing rAF tick drives it by calling
 * `flushRotation()` (forward coalesced drag deltas to the caller, which re-renders) and then
 * `step(dt)` (advance the arrow spring). Geometry is pushed in via `setGeometry` — every frame
 * for mini rings, whose disc rides the parent string's live knob.
 */
import { type RingConfig } from "../../core/ringLayout";
export interface RingRailGeometry {
    centerX: number;
    centerY: number;
    radiusX: number;
    radiusY: number;
}
export interface RingRailAssemblyOptions {
    /** D13 compass ruler around the rail — on for the main ring; off for mini rings, where its
     * ticks would be sub-pixel noise. When on, pass the full RingConfig to `setGeometry` (the
     * ruler's depth fade needs the scale/opacity ranges). */
    showRuler: boolean;
    /** Inset of the plate inside the rail ellipse, px per axis (see the main ring's gap band). */
    plateGapRx: number;
    plateGapRy: number;
    /** Incremental rotation (degrees) accumulated from the drag gesture — invoked only from
     * `flushRotation()`, so at most once per animation frame. The caller owns the running offset
     * and re-renders. */
    onRotate: (deltaDeg: number) => void;
    /** Fired once when the user grabs the disc to spin — before the first delta. */
    onRotateGestureStart?: () => void;
    /** Fired on any pointer activity on the disc — the renderer uses it to (re)start its rAF
     * loop, which is what drives `flushRotation`/`step`. */
    onInteraction?: () => void;
}
export declare class RingRailAssembly {
    /** Layers exposed for stacking: `backLayer` (plate + arrows) paints behind whatever the
     * caller puts between them (string hangers, on the main ring), `frontLayer` (rail + ruler +
     * rotate hit target) in front of it. */
    readonly backLayer: SVGGElement;
    readonly frontLayer: SVGGElement;
    private options;
    private svg;
    private plate;
    private arrowEls;
    private rail;
    private rulerLayer;
    private rulerKey;
    private hit;
    private geo;
    private plateRx;
    private plateRy;
    private spring;
    private drag;
    private pendingDeltaDeg;
    constructor(svg: SVGSVGElement, backParent: SVGElement, frontParent: SVGElement, options: RingRailAssemblyOptions, 
    /** D26: where the rotate hit-target mounts. The ring renderer passes a layer stacked
     * ABOVE the strings, so anywhere inside the disc the pointer ALWAYS turns the disc —
     * strings crossing the disc's interior can't steal the grab. Geometry is absolute
     * (cx/cy in svg coords), so the hit works from any layer. Defaults to frontLayer. */
    hitParent?: SVGElement);
    get isDragging(): boolean;
    /** Pushes the disc's current place/size. Mini rings call this every frame (their disc rides
     * the parent string's live knob); the main ring only on layout changes. `rulerConfig` is
     * required for the ruler to (re)build — only geometry-relevant changes trigger a rebuild. */
    setGeometry(geo: RingRailGeometry, rulerConfig?: RingConfig): void;
    /** Retargets the arrow spring at the disc's current rotation offset. A jump of more than a
     * full turn is not a drag — it's a programmatic reset (e.g. group-to-front zeroing the
     * offset), so snap rather than whip the platter through N revolutions. */
    setTargetRotation(deg: number): void;
    /** Depth fade for mini rings — the whole disc dims with its parent string. */
    setOpacity(opacity: number): void;
    /** Forwards rotation accumulated since the last frame as ONE `onRotate` call — pointermove
     * can fire far faster than the display refreshes, and each onRotate re-runs the caller's full
     * layout, so this coalescing is what keeps a fast spin cheap. Call at the top of each tick.
     * Also advances the local arrow-spring target by the same delta so D18 arrows keep turning
     * even when the caller uses a rotate fast-path that skips a full `setTargetRotation`. */
    flushRotation(): void;
    /** Advances the arrow spring one frame; returns true when it's at rest on the target.
     * While the disc is being dragged, snap the arrows to the live target so the spin affordance
     * turns with the gesture (the spring only needs to settle residual motion after release). */
    step(dt: number): boolean;
    dispose(): void;
    /** Pointer clientX → the svg's viewBox coordinate space (responsive canvases scale). */
    private localX;
    private attachRotateInteractions;
    /** A point ON the disc's top surface — polar (angle around the disc, fraction of its radius)
     * → px, through the same squashed-ellipse projection as the rail/strings: r=1 is the plate's
     * edge, r=0 its center. */
    private plateSurfacePoint;
    /** Rebuilds both D18 arrows at the spring's current angle. Each is a wide annular band capped
     * by a flared triangular head, sampled in disc coordinates and projected per-point — that
     * per-point projection is what makes the arrow visibly bend around the disc and foreshorten
     * in perspective as it rides toward the sides/back. */
    private redrawArrows;
    /** D13 amendment (user, 2026-07-15): the ruler's graduations render as KNOTS tied on the
     * rail — a knotted measuring line (the ship's log line that gave "knots" their name), not
     * engraved tick strokes. Each grade is a bump radius; the front landmark stays the biggest. */
    private static readonly KNOT_RADIUS;
    /** The knot bulge is slightly wider than tall — the same vertical squash convention the
     * whole disc perspective uses (rail ellipse, plate, D18 arrows). */
    private static readonly KNOT_SQUASH;
    private buildRailTick;
}
