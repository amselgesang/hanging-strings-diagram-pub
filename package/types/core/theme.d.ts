/**
 * v2.5 T1/T2: the renderer-agnostic theme object (see wiki/design/texturing.md). Plain data
 * only — no DOM/CSS/SVG types — so the queued Canvas/React/D3 renderers can consume the same
 * themes; each renderer owns its own translation (the SVG/DOM one lives in
 * renderers/svg/theme.ts).
 *
 * One material per visual element class, following the material-slot table in the texturing
 * page: background, rail, plate, thread, knob, label/caption, shadow. Deliberately NOT theme
 * slots, because they are data encodings rather than cosmetics (D1 guard):
 *   - group/category colors and heat-map colors (D5/D8) — they reach the thread/knob materials
 *     as per-string tint inputs, so encodings survive any theme;
 *   - D4 group dimming and ring depth fades — interaction/geometry feedback, not surface look.
 *
 * Tint pipeline (T2, resolves Q18 — proposed): the data tint IS the material's base color.
 * The thread's stroke and the knob's fill are the tint-carrying channels, and the theme type
 * deliberately has NO fields for them — a theme cannot recolor an encoding even by mistake;
 * the D1 guard is structural, not a convention. Materials express themselves around the tint
 * with hue-preserving treatments only: stroke width/dash on the thread (twine, chain), edge/
 * glyph tones on the knob (bead rim), plus each slot's shadows. Rejected alternatives are
 * recorded in texturing.md's T2 status (multiply-tinting textures breaks D8's exact ramp match
 * and needs per-color pattern instances or live filters; colored-parts-only demotes D5's
 * whole-string group read to a badge).
 */
export interface ThemeGradientStop {
    /** 0..1 along the gradient line. */
    offset: number;
    color: string;
}
/**
 * A photo-derived LUMINANCE texture (Wool & brass v2.1, amending Q21 for user-supplied
 * references): two grayscale maps baked offline from a photograph
 * (scripts/bake_thread_textures.py) and composited over a surface's data tint at paint time —
 * `multiply` darkens the tint into the texture's grooves, `screen` (optional) adds the
 * highlights multiply cannot reach. Hue never ships in the maps (they are grayscale by
 * construction), so the Q18 rule holds for real photos exactly as it does for procedural
 * tiles: the tint IS the color, the texture is lightness.
 */
export interface ThemeImageLuminanceTexture {
    kind: "image";
    /** Grayscale PNG data-URI, multiplied over the tint. */
    multiply: string;
    /** Grayscale PNG data-URI, screened over the result (specular highlights). */
    screen?: string;
    /** Tile size in px (userSpace — the texture does not stretch with its element). */
    width: number;
    height: number;
}
/** A thread stroke texture: a procedural white/black-marks tile, or a photo-derived
 * luminance image pair. Both are lightness-only over the string's data tint (Q18). */
export type ThemeThreadTexture = ThemePatternTile | ThemeImageLuminanceTexture;
/**
 * One primitive mark inside a pattern tile. Q21 (adopted for v2.5): textures are procedural/
 * SVG-generated only — no image assets — so a texture is a small list of primitives any
 * renderer can rasterize once (SVG <pattern>, Canvas offscreen tile, CSS data-URI). Circles
 * (speckles/grain) and lines (fibers/hatching) cover the first themes; extend when a texture
 * genuinely needs more.
 */
export type ThemePatternMark = {
    kind: "circle";
    cx: number;
    cy: number;
    r: number;
    fill: string;
    opacity?: number;
} | {
    kind: "line";
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stroke: string;
    width: number;
    opacity?: number;
};
/**
 * A repeating texture tile, in px. Marks paint over whatever sits beneath the tile (a pattern
 * fill's `base` color, or the background slot's own color), so a tile stays transparent between
 * its marks. Baked/rasterized ONCE per surface by every renderer — the texturing page's
 * performance rule ("pattern fills are cheap, filters are expensive") is why this is a static
 * mark list and not a live procedural filter.
 */
export interface ThemePatternTile {
    width: number;
    height: number;
    marks: ThemePatternMark[];
}
/**
 * Paint for a material surface: flat color, linear gradient, or a procedural pattern (T2).
 */
export type ThemeFill = {
    kind: "flat";
    color: string;
} | {
    /** Endpoints in the unit square of the painted element's bounding box — renderers map
     * them to their own gradient primitive (SVG objectBoundingBox, Canvas createLinearGradient). */
    kind: "linear-gradient";
    from: [number, number];
    to: [number, number];
    stops: ThemeGradientStop[];
} | {
    /** Center-out gradient over the painted element's bounding box (SVG objectBoundingBox
     * radialGradient, Canvas createRadialGradient). Added for D22's frosted-glass disc:
     * translucency lives in the stops' alpha, so one type covers glassy surfaces too. */
    kind: "radial-gradient";
    stops: ThemeGradientStop[];
} | {
    /** `base` paints under the tile's marks — the material's ground color. */
    kind: "pattern";
    base: string;
    tile: ThemePatternTile;
};
/**
 * A drop/box shadow as data (offsets/blur in px + color) rather than a prebaked CSS string, so
 * non-CSS renderers can reproduce it. Slots typed `ThemeShadow | null` may switch the shadow
 * off entirely — D11 flagged per-element shadows as the first performance lever, and "softer /
 * none / baked" per theme is exactly what the shadow slot exists to control.
 */
export interface ThemeShadow {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
}
export interface HangingStringsDiagramTheme {
    /** Human-readable theme name (shown by the T3 theme picker). */
    name: string;
    /** T3 (Q20, proposed): app chrome — panels, controls, legend buttons — is NOT a material;
     * a theme only declares which of exactly two hand-tuned chrome states it needs. "light" is
     * the existing chrome untouched; "dark" is one dark chrome (style.css `[data-hsd-dark]`
     * overrides) shared by every dark theme. Per-theme chrome tokens were rejected: chrome is
     * prototype furniture, not part of the visualization, and theming it per-theme would grow
     * the API surface with fields that encode nothing about the chart's materials. */
    chromeScheme: "light" | "dark";
    /** The canvas everything hangs in front of: a flat color, optionally textured by a grain
     * tile repeated over it (T2 — paper, linen). Kept as color + optional grain rather than a
     * full ThemeFill: the background must always resolve to a plain color for surfaces that
     * can't take an image (the pre-paint bootstrap default, print/export fallbacks). */
    background: {
        color: string;
        grain?: ThemePatternTile;
    };
    /** The rod strings hang from, plus its structural hardware — all rail-toned, never
     * data-colored, because hardware is not an encoding (D13). */
    rail: {
        color: string;
        /** Rod stroke width in px (Studio: the original 2). Joined the type when Wool & brass
         * needed a thick pipe — same deferred-until-needed rule as the thread's width in T2.
         * Straight-mode sub-rails follow at a fixed 0.75 ratio (the pre-theming 1.5/2 proportion),
         * so a thicker trunk scales its branches; ring-mode mini rings share the class directly. */
        strokeWidth: number;
        /** Photoreal rod sheen (Wool & brass v2): an optional paint that REPLACES the flat rail
         * color as the rod's stroke — e.g. a vertical metal gradient (highlight crest → base →
         * shadow) that makes a thick stroke read as a lit pipe. `rail.color` stays authoritative
         * for everything else rail-toned (focus dash, fallbacks); absent = flat color stroke. */
        sheen?: ThemeFill | null;
        /** D13 curtain-hanger rings at each string's anchor. Stroke width in px (Studio: the
         * original 1.4) — thin hardware on a thick rod is a material statement (Wool & brass). */
        hanger: {
            fill: string;
            stroke: string;
            strokeWidth: number;
        };
        /** D13 compass ruler around the ring rail: minor (6°) / medium (30°) / major (90°) grades,
         * plus the single green front ("360/0") landmark tick. */
        ruler: {
            minor: string;
            medium: string;
            major: string;
            front: string;
        };
    };
    /** The ring family's vinyl disc (D13 follow-up) and the D18 spin-affordance arrows embossed
     * on its surface. */
    plate: {
        fill: ThemeFill;
        /** The light rim highlight along the plate's edge. */
        edge: string;
        /** D18 arrows: translucent dark fill + faint light edge — printed-marking look. */
        arrowFill: string;
        arrowEdge: string;
    };
    /** The string itself. Its stroke COLOR is a data tint (D5/D8 — see the tint pipeline note
     * above), so the material owns only hue-preserving stroke treatment (T2: width and dash — a
     * dashed stroke reads as twine/stitching without touching the encoding's color) and the
     * on-string hardware: the D6 scale marks, which render as KNOTS tied in the thread
     * (D6.1) — same material/paint as the thread itself, so the only themable part is the
     * knot's faint edge. */
    thread: {
        /** Stroke width in px (Studio: the original 2). */
        strokeWidth: number;
        /** Dash pattern in px (`null` = solid). The texture channel that survives tinting: dashes
         * modulate coverage, never hue, so group identity and the D8 ramp stay exact. */
        strokeDash: number[] | null;
        /** Photoreal stroke texture (Wool & brass v2, from a user-supplied yarn photo — amends
         * Q21's procedural-only rule for user-provided references): painted per string as
         * `<pattern>` stroke paint over that string's own data tint. Procedural tiles must use
         * pure white/black (opacity-carrying) marks; image textures are grayscale luminance maps
         * by construction — either way the theme modulates lightness only, so the Q18 rule
         * survives photorealism: the hue underneath is still exactly the encoding. (Guarded by a
         * theme test.) `null`/absent = plain tinted stroke. */
        texture?: ThemeThreadTexture | null;
        /** The D6.1 thread-knot's faint outline (the knot's FILL is the thread's own paint). */
        tickStroke: string;
    };
    /** The weight at the string's tip. Its fill is a data tint (D5/D8); the material owns the
     * outline treatments and the D16 branch affordances. */
    knob: {
        /** The knob's own outline (separates it from the thread and background). */
        edge: string;
        /** D16 branch cue: the dark ring around an expandable knob. */
        branchEdge: string;
        /** D16: the +/− expand glyph drawn on a branch knob. */
        glyph: string;
    };
    /** Label/caption treatments (D9): inks plus, since T3, the typeface — deferred in T1 until
     * a theme actually needed it, which Ink & paper's stamped labels are. Applies to the chart's
     * text only (labels, caption, hover card), never the panel chrome (Q20). */
    label: {
        ink: string;
        /** D11.1 readability halo: a soft outline painted UNDER the label's fill (paint-order),
         * separating chart text from whatever is behind it — the breeze sheet's weave above all.
         * Theme-toned: light themes halo in their paper/cream, dark themes in their ground. */
        halo: string;
        /** The muted second line in two-line label mode ("(value)"). */
        valueInk: string;
        /** The D6 "one bead =" caption. */
        captionInk: string;
        /** CSS font-family stack for chart text. Studio carries the page's existing stack
         * verbatim, so its computed rendering is unchanged (it previously inherited this exact
         * value from :root). */
        fontFamily: string;
        /** The D9 hover info card. */
        card: {
            background: string;
            ink: string;
        };
    };
    /** D11 elevation shadows, one per shadowed element class — the known performance lever, so
     * each is independently softenable/removable per theme. */
    shadow: {
        rail: ThemeShadow | null;
        plate: ThemeShadow | null;
        thread: ThemeShadow | null;
        label: ThemeShadow | null;
        /** The hover card's box shadow. */
        card: ThemeShadow | null;
        /** The knob's pre-D11 cast-shadow ellipse on an implied floor — a complementary depth cue,
         * kept distinct from the elevation shadows (see D11's rationale). */
        floor: {
            color: string;
            opacity: number;
        };
        /** D11.1 (user, 2026-07-15): the CAST shadow threads/knobs throw onto the backdrop sheet —
         * an offset same-geometry copy behind each thread (no filter cost on animated elements),
         * separating the hanging layer from the cloth and lifting readability. Color only; the
         * light direction is a scene constant in the renderers. */
        cast: {
            color: string;
        };
    };
}
/**
 * Studio — today's exact look, extracted verbatim (colors copied character-for-character from
 * the pre-T1 style.css / renderRing.ts literals). Proves the slot API covers the current
 * rendering with zero visual change, and serves as the reference theme every other one is a
 * variation of.
 */
export declare const STUDIO_THEME: HangingStringsDiagramTheme;
/**
 * Workshop — the first real material theme (T2): paper background, wooden rod, twine threads,
 * wooden-bead knobs, cork plate. Exists to prove the pattern plumbing and the tint pipeline on
 * an actual look, not just on Studio's flat extraction:
 *
 *   - the twine read comes ENTIRELY from stroke dash + width — the thread keeps its data-tinted
 *     stroke, so group colors and the D8 heat ramp are exactly as legible as on Studio;
 *   - the wooden-bead read comes from the knob's dark rim around its data-tinted fill (a
 *     painted bead, not a wood-colored one — same tint rule);
 *   - cork and paper are ThemePatternTiles, baked once per surface (texturing.md perf rule);
 *   - warm-toned D11 shadows: same offsets/blurs as Studio (measured together in T2's perf
 *     pass), only the shadow ink warms to match the palette.
 */
export declare const WORKSHOP_THEME: HangingStringsDiagramTheme;
/**
 * Foundry — the first dark theme (T3): dark shop-floor background, brushed-steel rail and
 * disc, chain-like threads, brass knobs. Design notes:
 *
 *   - the brushed-metal read is a fine-hairline pattern tile (Q21: procedural only) — the
 *     lines span the tile edge-to-edge so the repeat is seamless;
 *   - chain-like threads are the Q18 rule again: a tighter dash + heavier width, hue untouched,
 *     so data tints stay separable on the dark ground (all three sample group colors and the
 *     full D8 ramp clear #171a22 comfortably);
 *   - **thread elevation shadow is OFF** — the first real use of the D11 nullable-shadow
 *     lever, as a material choice rather than a perf rescue: a 2.5px stroke's soft dark shadow
 *     is invisible against a near-black canvas, so it would be pure filter cost. The rail/
 *     plate/label shadows stay, darker and slightly larger to read against the dark ground;
 *   - chromeScheme "dark" — the one field that swaps in the shared dark app chrome (Q20).
 */
export declare const FOUNDRY_THEME: HangingStringsDiagramTheme;
/**
 * Ink & paper — graph-paper background, hand-drawn-ish ink strokes, stamped labels (T3).
 * Interpreted as light graph paper rather than a dark cyanotype blueprint: v2.5 ships exactly
 * one dark chrome (Q20) and Foundry already exercises it, so the drawing-office look stays
 * light. Design notes:
 *
 *   - the grid is one vertical + one horizontal hairline per tile (background 24px, plate
 *     12px — the disc reads as finer polar-ish graph paper);
 *   - "hand-drawn" threads are a long-dash-tiny-gap stroke — reads as pen lifts, hue untouched
 *     (Q18);
 *   - stamped labels are where the T1-deferred typeface field finally earns its place: a
 *     typewriter stack for chart text only (labels, caption, hover card) — panel chrome keeps
 *     the app font per Q20;
 *   - the ruler's front landmark is stamp-red instead of Studio's green: it is rail furniture
 *     (D13), not a data encoding, so the theme may recolor it.
 */
export declare const INK_PAPER_THEME: HangingStringsDiagramTheme;
/**
 * Wool & brass (user request, 2026-07-14): thick wool-yarn strings on thin brass hanger rings,
 * hung from heavy brass pipe rails — tuned ring-mode-first (the pipe bent into a ring, hangers
 * threaded on it, a felt mat as the disc). The first theme to vary HARDWARE weights, which is
 * why `rail.strokeWidth` / `hanger.strokeWidth` joined the type here:
 *
 *   - the pipe is a 5px rail stroke — pure width, brass-toned; the hangers stay 1px, so the
 *     thin-ring-on-fat-pipe contrast IS the material read (no new geometry needed);
 *   - yarn = the Q18 rule yet again: 4px stroke (double Studio) with long soft dashes [8, 2]
 *     that read as plies, hue untouched — chunky wool in exactly the group/heat tint;
 *   - the plate is felt: a muted warm ground flecked with short fibers at mixed angles;
 *   - the ruler's front landmark goes verdigris — brass hardware patinas, and the tick is rail
 *     furniture (D13), free for the theme to recolor like Ink & paper's stamp-red;
 *   - thread shadow slightly blurrier than Studio's: a fat soft yarn casts a fat soft shadow.
 */
export declare const WOOL_BRASS_THEME: HangingStringsDiagramTheme;
/**
 * The shipped themes, keyed by their stable picker/deep-link ids (T3). Single source of truth
 * for the panel's theme control, the `?theme=` deep link, and the completeness tests — adding
 * a theme here is all it takes to publish it.
 */
export declare const THEMES: Record<string, HangingStringsDiagramTheme>;
