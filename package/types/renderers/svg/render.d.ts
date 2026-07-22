/**
 * First reference renderer (SVG) — the PLANAR rail family (straight, and since M2 any curved
 * PlanarRailForm such as the arc; wiki/design/rail-forms.md). Consumes core/layout.ts output;
 * contains all DOM/SVG-specific code so the core stays reusable by other renderers (Canvas,
 * React, D3 — see implementation plan).
 *
 * D20 (2026-07-14): dragging a string slides it POSITIONALLY along its rail — the planar
 * mirror of ring mode's D17, arc length instead of angle. It stays exactly where dropped and
 * no other string moves; slot reorder and the slide-to-compare preview are retired. The rail's
 * form supplies both directions of the mapping (anchorAt / alongAtX), so the same drag code
 * serves the straight rod and any curved planar rod.
 */
import type { HangingStringGroup, HangingStringCategory } from "../../core/types";
import type { LayoutResult } from "../../core/layout";
import { type HangingStringsDiagramTheme } from "../../core/theme";
import type { StringHoverEvent } from "./hover";
export interface SvgRendererOptions {
    width: number;
    height: number;
    groups: HangingStringGroup[];
    categories: HangingStringCategory[];
    colorMode: "group" | "heatmap";
    /** String flexibility for the D10 swing (0 = floppy, 1 = near-rigid rod). Default 0.5. */
    stiffness: number;
    /** Whether the bead-tick gridline marks (D6) are drawn along each string. Default true. */
    showTicks: boolean;
    /** Two-line labels: category name on line 1, "(value)" on line 2 — reads exact values at a
     * glance without hovering. Default false (name only). */
    labelValues: boolean;
    /** D28 (v4): render the 2nd metric as khipu knots on each cord. While active the D6
     * bead-ticks hide (Q30 — two knot vocabularies on one cord is unreadable). Default false. */
    quipuKnots?: boolean;
    /** v2 photoreal: the theme, consulted only for the thread's stroke texture (everything else
     * this renderer shows themes through CSS variables). Defaults to Studio (no texture — the
     * plain data-tinted stroke, exactly the pre-photoreal behavior). */
    theme?: HangingStringsDiagramTheme;
    /** D20: called on release after sliding a string along its rail, with the position it was
     * dropped at — for a ROOT the arc-length `along` parameter on the main rod (feed it back via
     * computeLayout's `positions`); for a CHILD its offset from the parent's anchor x on the
     * sub-rail (computeHierarchyLayout's `childPositions`). The string stays exactly where it
     * was dropped; nothing else moves. Arrow keys nudge through the same callback. */
    onSlide?: (id: string, position: number) => void;
    /** v2 (D16): called when a string with children is clicked (pointer never moved) or activated
     * via Enter/Space — caller toggles that branch's expansion and re-runs layout. Optional. */
    onToggleExpand?: (id: string) => void;
    /** Called when a group swatch is clicked (group-to-front). */
    onGroupToggle: (groupId: string) => void;
    /** Q25: fired with the hovered string's data on pointer enter and `null` on leave — for a
     * host's own tooltip. Independent of `showHoverCard`. */
    onHover?: (event: StringHoverEvent | null) => void;
    /** Q25: whether the built-in hover info card renders (default true) — hosts bringing their
     * own tooltip via `onHover` switch it off. */
    showHoverCard?: boolean;
}
export declare class SvgRenderer {
    private svg;
    /** M1 (rail forms): a path, not a line — its shape comes from the layout's PlanarRailForm
     * (a straight full-width segment for StraightRailForm, curved for M2+ forms), so this
     * renderer never assumes what the rod looks like. */
    private railEl;
    private captionEl;
    /** D13 hanger rings, drawn under the rod so the rail stroke passes over each loop. */
    private hangerLayer;
    private subRailLayer;
    /** D16: per-expanded-parent sub-rail line + its offsets relative to the parent's knob, so the
     * animation loop can keep the sub-rail attached to the parent's live (swinging) knob rather
     * than its resting layout slot. dx1/dx2 are relative to the parent's anchor X; dy is the gap
     * below the parent's knob. */
    private subRailEls;
    private stringLayer;
    /** Grows past options.height when an expanded branch (D16) needs the room; never shrinks
     * below the configured height. */
    private effectiveHeight;
    private els;
    private anim;
    private hoverCard;
    private options;
    private activeGroupId;
    private lastLayout;
    private stringById;
    private radiusMin;
    private radiusMax;
    /** Horizontal shift that centers the content when it's narrower than the canvas — applied as a
     * transform on `stringLayer`, and un-applied when converting pointer positions back to layout
     * coordinates. */
    private contentOffsetX;
    /** v2 photoreal: per-tint thread stroke paint (plain tint, or a textured yarn pattern when
     * the theme ships a thread texture) — see createThreadPaintSource. */
    private threadPaint;
    /** This svg's <defs> — thread patterns plus the flat-rod sheen workaround below. */
    private defs;
    /** D21.2: whether the scene breeze also stirs the threads (same signal as the backdrop
     * sheet). While on and visible, the physics loop never parks — the air never goes still. */
    private windEnabled;
    /** D21.8: multiplies organic breeze intensity for threadWindAccel (shake envelope). */
    private windScale;
    private windPhase;
    private visible;
    /** D20 live positional slide — mirrors ring mode's dragState (renderRing.ts), one level down
     * the abstraction: roots slide by arc length along the main rod, children by x-offset along
     * their straight sub-rail. A plain click (position unchanged) commits nothing. */
    private dragState;
    private liveDragId;
    /** Q25: the currently hovered string (null = none) — dedupes onHover enter/leave firing. */
    private hoverId;
    /** The svg's viewBox width: the layout width, grown to the full content extent when the
     * content is wider (proportional fit — see render()). All pointer/hover conversions use
     * THIS, not options.width. */
    private viewBoxWidth;
    /** D25 (Q13 morph): screen-px anchor positions handed over by the OTHER renderer at a rail
     * mode switch — consumed by the next render(), which starts each string's spring there so
     * it visibly glides to its new anchor instead of teleporting. */
    private morphSeedScreen;
    /** Same map converted to THIS renderer's layout coords, plus each string's sweep chase
     * rate (valid for one render pass). D25.2: coords are optional — a planar form morph keeps
     * every string where it is and only slows its chase, so the rod's bend visibly ripples
     * through the hanging strings. */
    private morphSeedLayout;
    /** D25.2: the next render assigns sweep chase rates without any position hand-off. */
    private formSweepPending;
    private morphTimer;
    /** The drawn rod's extent in `along` parameters, refreshed each render — slides clamp to it
     * so the hanger stays threaded on the rod (D17/D20: it never detaches past an end). */
    private railAlongMin;
    private railAlongMax;
    private rafId;
    private lastFrameTime;
    /** groupId → color / name, rebuilt when options.groups changes. */
    private groupColorById;
    private groupNameById;
    /** Q23: document-unique prefix for this instance's SVG def ids (thread patterns, the
     * flat-rod sheen) — url(#…) resolves document-wide, so ids must never repeat across
     * instances. */
    private readonly uid;
    constructor(container: HTMLElement, options: SvgRendererOptions);
    setOptions(patch: Partial<SvgRendererOptions>): void;
    private rebuildGroupMaps;
    /** T3 live theme switching, v2 photoreal: this renderer's only theme-derived DOM is the
     * per-tint thread patterns — rebuild them and repaint (same contract as
     * RingSvgRenderer.setTheme; everything else here themes through CSS variables). */
    setTheme(theme: HangingStringsDiagramTheme): void;
    /** Shows/hides this renderer's DOM without tearing it down — used when switching rail modes
     * (v1.1) so straight mode's D10 spring state survives being temporarily out of view. */
    setVisible(visible: boolean): void;
    /** D21.2: the scene breeze stirring the threads — tied to the backdrop's toggle. */
    setWind(on: boolean): void;
    /** D21.8: multiplies breeze intensity applied to threads (default 1). */
    setWindScale(scale: number): void;
    /** D25 (Q13 morph): every string's CURRENT animated anchor in screen px relative to the
     * svg's top-left — the hand-off coordinate space both renderers share (their svgs overlap
     * during the cross-fade). */
    captureAnchorScreenPositions(): Map<string, {
        x: number;
        y: number;
    }>;
    /** D25: the incoming half of the hand-off — the next render() starts each seeded string's
     * spring at the given screen position (converted into this renderer's layout space). */
    seedAnchorScreenPositions(seed: Map<string, {
        x: number;
        y: number;
    }>): void;
    /** D25.2 (planar form morph — straight↔arc↔wave): no position hand-off (same renderer,
     * strings stay put horizontally), but the next render gives every string its sweep chase
     * rate so the anchors ripple to the new rod form instead of snapping in ~50ms. */
    beginFormSweep(): void;
    /** D25 cross-fade, outgoing side: the svg ghosts in place (absolute, non-interactive) and
     * fades out, then hides. */
    morphOut(durationMs: number): void;
    /** D25 cross-fade, incoming side: becomes visible at opacity 0 and fades in. */
    morphIn(durationMs: number): void;
    /** Tears this renderer's DOM out of the container and stops its animation loop — the façade's
     * destroy() path (integration I4). The instance must not be used afterwards. */
    destroy(): void;
    /** Adopts a new canvas width (responsive sizing) — the caller re-runs layout + render after. */
    resize(width: number): void;
    private applyCanvasSize;
    setActiveGroup(groupId: string | null): void;
    render(layout: LayoutResult): void;
    private groupColor;
    private colorFor;
    private createStringElement;
    private updateStringElement;
    /**
     * Positions everything from the current animation state. The thread is a smooth curve through
     * anchor(0,0) and all of anim.nodes, ending exactly at the knob — Y is always exactly `dropPx`
     * for the knob and the tick's own y for ticks (D1-safe), only X ever sways.
     */
    private applyTransform;
    private ensureTicking;
    private tick;
    /** D20: a string's CURRENT position in slide coordinates — a root's `along` on the main rod
     * (inverted from its anchor x via the form), a child's dx from its parent's anchor. Drags
     * and arrow-key nudges start from here. */
    private restPositionOf;
    /** The slide bounds for a string (D17/D20: the hanger stays threaded on its rod): a root's
     * are the drawn rail's extent; a child's the sub-rail bar, minus a small end margin. */
    private slideBoundsOf;
    private attachInteractions;
    /** D16: the +/− knob button — a press here always toggles the branch and never starts a
     * slide (it sits above the lower-end drag hit). Up to 8px of hand jitter still counts as a
     * press; real movement beyond that cancels the toggle rather than turning into a surprise slide. */
    private attachToggleInteractions;
    private showHoverCard;
    private hideHoverCard;
}
