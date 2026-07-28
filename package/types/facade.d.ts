/**
 * The embeddable façade (integration.md I1/I4): `createHangingStringsDiagram(container, options)` is
 * THE public API every host — vanilla embed, Chart.js controller, ECharts extension, React
 * wrapper — integrates through. It owns the wiring the prototype's main.ts proved is subtle:
 * two renderers kept warm and swapped by visibility (spring state survives mode switches),
 * the ring's rotate fast-path and spin-time LOD, the breeze backdrop synced to the rail's
 * rendered form, theming/texture application, and D17/D20 slid-position state. Doing that once
 * here means every adapter inherits it correctly (I1); the demo panel is just another consumer.
 *
 * Style isolation (I5): the theme's CSS variables and the busy-sheet/dark-chrome attributes are
 * applied to THE CONTAINER, never to document.documentElement — a host page's own styling can't
 * collide unless it deliberately uses the `hsd-` prefix. The container gets the `hsd-container`
 * class (position: relative + the theme's background slot painted on the chart's own box).
 *
 * Events (I4): callbacks fire on committed state changes (a slide's release, a branch toggle,
 * a group selection) — never per animation frame.
 */
import { type ColorMode, type HangingStringCategory, type HangingStringGroup } from "./core/types";
import { type HangingStringsDiagramTheme } from "./core/theme";
import type { StringHoverEvent } from "./renderers/svg/hover";
import { type PitchDirection, type SonifyScale } from "./core/sonify";
export type RailMode = "straight" | "arc" | "wave" | "ring";
/** D29 (v4): the 2nd-metric encoding modes — none, knob size (D7), heat-map (D8), or quipu
 * knots (D28). */
export type SecondaryEncoding = "none" | "knob" | "heat" | "quipu";
/** Q24 (DECIDED 2026-07-20, user: "no" to opt-in): the breeze backdrop is part of the
 * product's default look — "plain" (the white sheet) is the default everywhere; hosts that
 * don't want the weight/motion pass `backdrop: "off"` explicitly. */
export type BackdropMode = "off" | "plain" | "tablecloth" | "bavarian" | "eu" | "usa"
/** D21.10: any image draped as the cloth — supply the URL via `backdropImageUrl` /
 * `setBackdropImage(url)` (which switches to this mode itself). */
 | "image";
/** A committed slide (D17/D20) — `position` is the arc-length `along` the planar rod for a
 * planar root, an x-offset from the parent's anchor for a planar child, or the base angle in
 * degrees for anything slid in ring mode. */
export interface ReorderEvent {
    id: string;
    parentId: string | null;
    railMode: RailMode;
    position: number;
}
export interface ExpandEvent {
    id: string;
    expanded: boolean;
}
/** Q25: the hovered string's data plus which rail family it was hovered in. */
export interface HoverEvent extends StringHoverEvent {
    railMode: RailMode;
}
export interface HangingStringsDiagramOptions {
    /** The canonical data shape (I3) — adapters convert their host's format to exactly this. */
    categories: HangingStringCategory[];
    groups: HangingStringGroup[];
    railMode?: RailMode;
    /** A THEMES registry key or a full theme object. Unknown keys throw — a host integration
     * bug should fail loudly, not silently render Studio. */
    theme?: string | HangingStringsDiagramTheme;
    /** A THREAD_TEXTURES key overriding the theme's thread texture. Absent = the product
     * default (kernmantle); an explicit null = the theme's own texture. */
    threadTexture?: string | null;
    backdrop?: BackdropMode;
    /** D21.10: the image the `"image"` backdrop drapes (any URL — flag, logo, photo). Only
     * meaningful with `backdrop: "image"`. */
    backdropImageUrl?: string;
    colorMode?: ColorMode;
    knobEncodesSecondMetric?: boolean;
    /** D29 (v4): ONE switch for how the 2nd metric is encoded — knob size (D7), heat-map color
     * (D8), or khipu knots on the cord (D28, which hides the D6 bead-ticks while active, Q30).
     * When given it WINS over the legacy `colorMode`/`knobEncodesSecondMetric` pair; when
     * absent it derives from them, so v3 configs keep working unchanged. */
    secondaryEncoding?: SecondaryEncoding;
    showTicks?: boolean;
    tickTarget?: number;
    labelValues?: boolean;
    stiffness?: number;
    /** Canvas height in px (the canvas grows below this while branches are expanded). */
    height?: number;
    /** A group was brought to front (or deselected — null). */
    onSelect?: (groupId: string | null) => void;
    /** A string was slid to a new position and released (commit, not per-frame preview). */
    onReorder?: (event: ReorderEvent) => void;
    /** A branch was expanded or collapsed (D16). */
    onExpand?: (event: ExpandEvent) => void;
    /** Q25: a string was hovered (its data + the built-in card's container-px anchor) or
     * un-hovered (`null`) — for a host's own tooltip. Fires on enter/leave, never per frame. */
    onHover?: (event: HoverEvent | null) => void;
    /** Q25: whether the built-in hover info card renders (default true). Hosts replacing it
     * with their own tooltip via `onHover` pass false. */
    showHoverCard?: boolean;
    /** D31 (v4, Track F): sonification — the strings sing. STRICTLY opt-in (default false):
     * `true` enables with the signed defaults (physical direction, pentatonic, Karplus-Strong
     * plucks, pan follows x, 150 ms sweep); an object overrides. While disabled, `play()` is
     * a no-op. Audio starts only from user gestures (autoplay-safe by construction). */
    sonification?: boolean | SonificationOptions;
}
/** D31 tuning knobs — every field optional, defaults are the user-signed parameters. */
export interface SonificationOptions {
    /** Master volume 0..1 (default 0.8). */
    volume?: number;
    /** "physical" (longer cord = LOWER note — the default and the metaphor's truth) or
     * "convention" (bigger value = higher pitch, the auditory-graph standard). */
    pitchDirection?: PitchDirection;
    scale?: SonifyScale;
    /** Sweep tempo, ms per string (default 150). */
    sweepStepMs?: number;
}
/** The per-call option subset `setOptions` patches live. */
export type HangingStringsDiagramDisplayOptions = Partial<Pick<HangingStringsDiagramOptions, "colorMode" | "knobEncodesSecondMetric" | "showTicks" | "tickTarget" | "labelValues" | "stiffness">>;
export interface HangingStringsDiagram {
    readonly container: HTMLElement;
    /** Replace the data (diffed against current state: surviving strings keep their order and
     * slid positions; state for removed ids is pruned). */
    update(patch: {
        categories?: HangingStringCategory[];
        groups?: HangingStringGroup[];
    }): void;
    setRailMode(mode: RailMode): void;
    setTheme(theme: string | HangingStringsDiagramTheme): void;
    setThreadTexture(key: string | null): void;
    setBackdrop(mode: BackdropMode): void;
    /** D21.10: drape any image as the cloth — sets the URL AND switches the backdrop to
     * `"image"` in one call (the country-flag path: the demo feeds countryflags.com URLs). */
    setBackdropImage(url: string): void;
    /** D21.8: multiplies organic breeze intensity on the cords (1 = normal; 0 = calm). */
    setWindScale(scale: number): void;
    /** D29: switch how the 2nd metric is encoded — knob size, heat-map color, or quipu knots
     * (which hide the D6 bead-ticks while active). */
    setSecondaryEncoding(mode: SecondaryEncoding): void;
    /** D31: play the chart as a left→right pluck sweep (pitch = cord length, pan = x).
     * Resolves when the last pluck has sounded; no-op (immediately resolved) while
     * sonification is disabled. Call from a user gesture the first time (autoplay policy). */
    play(): Promise<void>;
    /** D31: silence every scheduled/sounding pluck immediately. */
    stop(): void;
    /** D31: enable/disable/re-tune sonification (object patches are merged). */
    setSonification(on: boolean | SonificationOptions): void;
    setOptions(patch: HangingStringsDiagramDisplayOptions): void;
    /** Group-to-front toggle (D4): fronts the group, dims the rest; toggling the active group
     * deselects it. Ring mode centers the group at the arc's front (angle 0). */
    toggleGroup(groupId: string): void;
    /** D16: expand/collapse a branch by category id (no-op if the id has no children). */
    toggleExpand(id: string): void;
    getActiveGroup(): string | null;
    getRailMode(): RailMode;
    /** Restores base order, collapses branches, clears slid positions/rotations/selection. */
    reset(): void;
    /** Removes everything this instance added to the container and stops all animation. */
    destroy(): void;
}
export declare function createHangingStringsDiagram(container: HTMLElement, options: HangingStringsDiagramOptions): HangingStringsDiagram;
