/**
 * Second reference renderer (SVG), perspective-ring ("curtain") mode — D2's exploration/
 * aesthetic view. Consumes core/ringLayout.ts output; mirrors render.ts's per-string visual
 * vocabulary (thread/ticks/shadow/knob/label) and reuses its CSS classes so colors, D6 bead-
 * ticks, and D11 elevation shadows look identical across both rail modes for free.
 *
 * Phase 1 (geometry only) shipped static positions, no interactions. Phase 2 (Q12) added the two
 * candidate ring interactions — grab-and-slide a single string (`onReorder`) and spin the whole
 * ring (`onRotate`) — but as a discrete, un-eased jump. Per user feedback ("not realistic...
 * discreet without any transition"), this pass replaces both with the *exact same* D10 flexible-
 * string physics straight mode uses (`core/chain.ts`, shared, not reimplemented): every string
 * has a persistent 2D anchor (`anchorX`/`anchorY`, since its attachment point moves along an
 * ellipse rather than a straight rail) that eases toward its current slot, a cascading chain of
 * local-X node offsets that swings/settles behind it, and `onRotate` now reports a small
 * *continuous* angle delta every pointermove instead of a whole discrete slot on release — so
 * "spinning the ring" plays out as every string's anchor smoothly sliding around the ellipse,
 * with the string itself swinging with inertia, precisely like straight mode's reorder-and-settle
 * feel. Depth/scale/opacity are derived every frame from the *animated* anchor's current Y
 * position (`depthFromAnchorY`), not the resting layout, so a string visibly shrinks/fades as it
 * swings toward the back and grows/brightens as it swings toward the front — continuous, not a
 * pop at redraw time. Renders diff by category id (persistent DOM + anim state) instead of a
 * full rebuild every `render()` call, since physics needs somewhere to live between frames.
 * Rotate-drag deltas are coalesced to one layout+retarget per animation frame (a
 * 120 Hz pointer would otherwise re-layout faster than the display can show); the rotate
 * fast-path (`retargetForRotate`) skips color/label/aria rebuilds. The static compass ruler
 * is only rebuilt when the rail geometry itself changes.
 */
import type { HangingStringGroup } from "../../core/types";
import { type RingLayoutResult } from "../../core/ringLayout";
import { type HangingStringsDiagramTheme } from "../../core/theme";
import type { StringHoverEvent } from "./hover";
export interface RingSvgRendererOptions {
    width: number;
    height: number;
    groups: HangingStringGroup[];
    colorMode: "group" | "heatmap";
    showTicks: boolean;
    /** Two-line labels (name / "(value)") — same option as straight mode's
     * `SvgRendererOptions.labelValues`. */
    labelValues: boolean;
    /** D28 (v4): render the 2nd metric as khipu knots on each cord — same option as straight
     * mode's `SvgRendererOptions.quipuKnots`. D6 bead-ticks hide while active (Q30). */
    quipuKnots?: boolean;
    /** String flexibility for the D10 swing (0 = floppy, 1 = near-rigid rod) — same option, same
     * physics, as straight mode's `SvgRendererOptions.stiffness`. */
    stiffness: number;
    /** Called with the *incremental* angle change (degrees) while spinning the ring (Q12b) —
     * continuous, not quantized to a slot. Deltas are accumulated across pointermoves and flushed
     * at most once per animation frame. The caller adds each delta to its own running rotation
     * offset and re-renders; there is nothing to "commit" on release since the state was never a
     * preview. */
    onRotate: (deltaDeg: number) => void;
    /** Fired once when the user grabs the vinyl plate to spin (Q12b) — before the first delta.
     * Caller can drop tick granularity etc. for the duration of the spin+settle. */
    onRotateGestureStart?: () => void;
    /** Fired once when the spin session settles: no disc grabbed and every rotation spring at
     * rest (threads may still swing — with ambient wind they always do, so waiting on them would
     * mean never firing). Used to restore temporary spin-time LOD changes. */
    onSettle?: () => void;
    /** D19: same contract as `onRotate`, for an expanded parent's mini ring — dragging a branch's
     * disc spins THAT branch's children around their sub-ring. The caller keeps one running
     * offset per parent id. */
    onSubRotate?: (parentId: string, deltaDeg: number) => void;
    /** D16: pressing a branch knob's +/− button (or Enter/Space on a focused parent) toggles its
     * sub-rail — shared expand state with straight mode lives in the caller. */
    onToggleExpand?: (id: string) => void;
    /** D17: called on release after sliding a string along ITS rail, with the angle (degrees,
     * INCLUDING that ring's current rotation offset) it was dropped at — the main rail for roots,
     * the branch's mini rim for children. The caller persists the base angle so the string stays
     * exactly where it was slid — no slots, no snapping, and no other string moves. */
    onSlide?: (id: string, angleDeg: number) => void;
    /** v2.5 T1: theme for the surfaces this renderer builds itself (today only the D13 plate's
     * <defs> gradient — everything else themes through style.css's --hsd-* variables, see
     * renderers/svg/theme.ts). Defaults to Studio, the pre-theming look. */
    theme?: HangingStringsDiagramTheme;
    /** Q25: fired with the hovered string's data on pointer enter and `null` on leave — for a
     * host's own tooltip. Independent of `showHoverCard`. */
    onHover?: (event: StringHoverEvent | null) => void;
    /** Q25: whether the built-in hover info card renders (default true) — hosts bringing their
     * own tooltip via `onHover` switch it off. */
    showHoverCard?: boolean;
}
export declare class RingSvgRenderer {
    private svg;
    /** D19: the top-level ring's disc — plate, D18 arrows, rail, ruler, and the Q12b rotate
     * gesture, all bundled in the reusable RingRailAssembly (shared with the mini rings below). */
    private mainRail;
    private hangerLayer;
    private captionEl;
    private subRailLayer;
    /** D16/D19: per-expanded-parent mini ring — the SAME RingRailAssembly as the main rail, at
     * branch scale, plus the sub-ring's unscaled dimensions. Geometry is re-derived from the
     * parent's live knob (position, sway, depth scale) every frame in applyTransform — the branch
     * hangs from the parent string, wherever it currently is. Diffed by parent id (not rebuilt
     * per render) so each mini disc's arrow-spring state survives re-renders mid-spin. */
    private subRailEls;
    private stringLayer;
    /** D26: all disc rotate hit-targets, stacked above the strings — inside a disc, the
     * pointer always turns that disc. */
    private railHitLayer;
    /** Current canvas height — grows below options.height while branches are expanded (children
     * hang past the base canvas near the ring's front), returns to base when all are collapsed. */
    private effectiveHeight;
    private hoverCard;
    private options;
    private activeGroupId;
    private lastLayout;
    private stringById;
    private radiusMin;
    private radiusMax;
    private stringEls;
    private anim;
    private rafId;
    /** Q25: the currently hovered string (null = none) — dedupes onHover enter/leave firing. */
    private hoverId;
    /** D25 (Q13 morph): screen-px anchors handed over by the planar renderer at a rail-mode
     * switch — consumed by the next render() (see render.ts's twin for the mechanism). */
    private morphSeedScreen;
    private morphSeedLayout;
    private morphTimer;
    /** D23: true while a disc-turn session runs (any disc grabbed, or rotation springs still
     * moving). ONLY this sheds detail (hsd-animating hides knots/floor-shadows, knot tracking
     * pauses) — breeze sway and single-thread pulls keep the full picture. */
    private spinActive;
    private lastFrameTime;
    private groupColorById;
    private groupNameById;
    /** Live single-string drag (D17) — set on pointerdown on a string's hit target, cleared on
     * release. Both levels slide by ANGLE along their own ring: roots on the main rail, children
     * on their branch's mini rim. A plain click (angle unchanged) commits nothing. */
    private dragState;
    private liveDragId;
    /** The svg's <defs> — kept so setTheme (T3) can rebuild the theme-derived plate fill. */
    private defs;
    /** v2 photoreal: per-tint thread stroke paint (plain tint, or a textured yarn pattern when
     * the theme ships a thread texture) — see createThreadPaintSource. */
    private threadPaint;
    /** D21.2: whether the scene breeze also stirs the threads (same signal as the backdrop
     * sheet). While on and visible, the physics loop never parks — the air never goes still. */
    private windEnabled;
    /** D21.8: multiplies organic breeze intensity for threadWindAccel (shake envelope). */
    private windScale;
    private windPhase;
    private visible;
    /** Q23: document-unique prefix for this instance's SVG def ids (plate fill, thread
     * patterns) — url(#…) resolves document-wide, so ids must never repeat across instances. */
    private readonly uid;
    constructor(container: HTMLElement, options: RingSvgRendererOptions);
    /** True while ANY disc (main or a branch's mini ring) has a live rotate drag. */
    private anyRailDragging;
    setOptions(patch: Partial<RingSvgRendererOptions>): void;
    private rebuildGroupMaps;
    /** T3 live theme switching: everything else themes through CSS variables (applyTheme), but
     * the plate fill and (v2 photoreal) the per-tint thread patterns are SVG defs built from
     * theme data — rebuild them in place. The plate def keeps its id, so every .hsd-rail-plate
     * url() reference (main disc + D19 mini discs) repaints without per-element work; thread
     * strokes are re-resolved by the re-render below, mid-spin state untouched. */
    setTheme(theme: HangingStringsDiagramTheme): void;
    /** Q23: this instance's plate-fill def id — referenced only via this svg's own
     * --hsd-plate-fill variable. */
    private get plateFillId();
    /** Shows/hides this renderer's DOM without tearing it down — mirrors SvgRenderer.setVisible so
     * main.ts can toggle rail modes uniformly, and so this renderer's own D10 spring state survives
     * a round trip through straight mode. */
    setVisible(visible: boolean): void;
    /** D21.2: the scene breeze stirring the threads — tied to the backdrop's toggle. */
    setWind(on: boolean): void;
    /** D21.8: multiplies breeze intensity applied to threads (default 1). */
    setWindScale(scale: number): void;
    /** D25 (Q13 morph): every string's CURRENT animated anchor in screen px relative to the
     * svg's top-left — the hand-off space shared with the planar renderer. */
    captureAnchorScreenPositions(): Map<string, {
        x: number;
        y: number;
    }>;
    /** D25: the incoming half of the hand-off — see render.ts's twin. */
    seedAnchorScreenPositions(seed: Map<string, {
        x: number;
        y: number;
    }>): void;
    /** D25 cross-fade, outgoing side — see render.ts's twin. */
    morphOut(durationMs: number): void;
    /** D25 cross-fade, incoming side — see render.ts's twin. */
    morphIn(durationMs: number): void;
    /** Tears this renderer's DOM out of the container and stops its animation loop — the façade's
     * destroy() path (integration I4). The instance must not be used afterwards. */
    destroy(): void;
    /** Adopts a new canvas width (responsive sizing) — the caller updates the RingConfig geometry
     * and re-runs layout + render after. */
    resize(width: number): void;
    private applyCanvasSize;
    /** D4 parity with straight mode: dims strings outside the active group (multiplied into the
     * per-frame depth opacity, since ring strings animate opacity inline every frame). */
    setActiveGroup(groupId: string | null): void;
    render(layout: RingLayoutResult): void;
    /**
     * Rotate fast-path: retarget root anchors + the disc's arrow spring from a fresh layout.
     * Skips color/label/aria/tick rebuilds — those don't change while spinning. Children chase
     * parents in the tick loop. Called from onRotate (already inside RAF) so applyTransform runs
     * once via the continuing tick.
     */
    retargetForRotate(layout: RingLayoutResult): void;
    private createStringElement;
    /** D16: the +/− knob button — a press here always toggles the branch and never starts a
     * slide (it sits above the lower-end drag hit). Same slop-and-cancel behavior as straight
     * mode: up to 8px of hand jitter still counts as a press; real movement beyond that cancels
     * the toggle rather than turning into a surprise drag. */
    private attachToggleInteractions;
    private updateStringElement;
    /**
     * Positions everything from the current animation state. Depth (scale/opacity) is derived
     * fresh every frame from the anchor's *current* (animated, possibly mid-swing) Y position via
     * `depthFromAnchorY` — not the resting layout's precomputed scale/opacity — so a string
     * visibly grows/brightens as it swings toward the front and shrinks/fades as it swings toward
     * the back, instead of popping to its new size only once the swing settles.
     */
    /**
     * D16: depth for a string — children inherit their PARENT's live depth (the whole branch
     * lives at the parent's position on the ring), never derive their own: a child's anchor sits
     * far below the ellipse, where `depthFromAnchorY` would just clamp to "front". D16.1: a
     * child's own angle around its mini ring composes a static local multiplier on top (computed
     * in layout), so back-of-the-mini-ring children read slightly farther than front ones.
     */
    private depthFor;
    /**
     * D16: the parent's knob in world coordinates, from its LIVE animation state (anchor position,
     * chain sway, depth scale) — the point the whole branch hangs from, recomputed every frame so
     * the sub-rail and children ride along as the parent slides around the arc or is dragged.
     */
    private parentKnobWorld;
    /** D16: where a child's anchor should be right now, relative to its parent's live knob.
     * D16.1: the point sits ON the sub-ring ellipse — the resting slot offsets from layout, or,
     * while the child is being DRAGGED (D17-for-children), the point at its live drag angle: the
     * hanger slides around the mini rail's rim and never detaches from it. */
    private childTargetWorld;
    private applyTransform;
    private ensureTicking;
    private tick;
    private groupColor;
    private colorFor;
    /** The angle a string currently rests at on ITS ring — a root's main-rail angle, a child's
     * mini-ring angle (both include their ring's rotation offset). Drags and arrow-key nudges
     * start from here. */
    private restAngleOf;
    private attachStringInteractions;
    private localPoint;
    private showHoverCard;
    private hideHoverCard;
}
