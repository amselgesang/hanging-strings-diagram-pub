/**
 * v2.5 T1/T2: the SVG/DOM half of theming — translates the renderer-agnostic theme object
 * (core/theme.ts) into the mechanisms this renderer actually paints with:
 *
 *   1. CSS custom properties (`--hsd-*`) set on a root element; every cosmetic rule in
 *      style.css reads them via var(), so a theme swap is one setProperty pass with no
 *      per-element DOM writes.
 *   2. SVG fill defs — <linearGradient> or <pattern> (T2) — for ThemeFill surfaces that CSS
 *      classes reference via url(#…); today only the ring plate (D13).
 *   3. A data-URI tile for the background slot's grain (T2) — the browser rasterizes it once
 *      and repeats the bitmap, which is exactly the "bake, never live-filter" perf rule from
 *      the texturing page.
 *
 * Data colors (group/heat tints, D5/D8) never pass through here — they are applied inline
 * per-string by the renderers, exactly as before T1 (the Q18 tint contract: theme materials
 * have no tint-carrying fields at all, see core/theme.ts).
 */
import type { HangingStringsDiagramTheme, ThemeFill, ThemePatternTile, ThemeThreadTexture } from "../../core/theme";
/**
 * A pattern tile as standalone SVG markup (pure string — testable without a DOM). `base`
 * paints a ground rect under the marks; omit it for the background grain, whose ground is the
 * CSS background-color beneath the image.
 */
export declare function patternTileSvgMarkup(tile: ThemePatternTile, base?: string): string;
/** CSS `url()` value carrying the tile as a data-URI — rasterized once by the browser, then
 * tiled as a plain bitmap (no per-frame cost; the tile itself never animates). */
export declare function patternTileCssUrl(tile: ThemePatternTile): string;
/**
 * The full theme → CSS custom property map. Pure (no DOM), so tests can assert the Studio
 * theme produces exactly the pre-T1 literals and that style.css's var() references and this
 * map never drift apart.
 *
 * `railSheenDefId` is the def id `--hsd-rail-paint` points at when the theme ships a rod sheen
 * — applyTheme passes each scope element's own id (Q23: two instances with different sheen
 * themes must not fight over one `#hsd-rail-sheen`).
 */
export declare function themeCssVars(theme: HangingStringsDiagramTheme, railSheenDefId?: string): Record<string, string>;
/**
 * Applies the theme's CSS variables to `el`'s inline style. main.ts targets the document root
 * (not the chart container) because the background slot styles the page body, which sits
 * outside any chart element; inline properties also override the stylesheet's pre-JS
 * `--hsd-background` bootstrap default by specificity, with no rule-ordering concerns.
 *
 * Also stamps the theme's chrome scheme (Q20, T3) as a `data-hsd-dark` attribute — style.css's
 * dark-chrome override block keys on it, so the app chrome flips with the theme in the same
 * single pass — and (v2 photoreal) maintains the shared rail-sheen def that
 * `--hsd-rail-paint` references. Safe to re-run for live theme switching (the T3 picker):
 * everything it touches is idempotently overwritten.
 */
export declare function applyTheme(el: Element & ElementCSSInlineStyle, theme: HangingStringsDiagramTheme): void;
/**
 * Per-renderer paint source for thread strokes (v2 photoreal). Without a texture the paint IS
 * the data tint, exactly as before. With one (Wool & brass's yarn), each distinct tint gets a
 * lazily-built `<pattern>` in the OWNING renderer's defs, so the stroke renders as textured
 * yarn whose hue is still precisely the encoding — Q18 survives photorealism structurally:
 * the tint paints the pattern's ground, and the theme contributes only lightness, either as
 * a procedural tile's white/black marks or as a photo's grayscale luminance maps blended
 * multiply (grooves) + screen (crest highlights) over the tinted ground. Patterns are cached
 * per tint and rebuilt from scratch on setTexture (theme switches). `prefix` keeps ids unique
 * per renderer, since both svgs host their own copies.
 *
 * Image textures use SVG `feBlend` filters (not CSS `mix-blend-mode` on `<image>` children of
 * `<pattern>`). Pattern contents are never-rendered paint servers — Firefox does not apply
 * mix-blend-mode there, so grayscale maps would paint opaque over the tint (B&W cords).
 * `feBlend` is the portable luminance pipeline and matches Chromium's previous look.
 */
export declare function createThreadPaintSource(defs: SVGDefsElement, prefix: string): {
    setTexture(tex: ThemeThreadTexture | null | undefined): void;
    paintFor(tint: string): string;
};
export type ThreadPaintSource = ReturnType<typeof createThreadPaintSource>;
/**
 * Builds the <defs> element for a ThemeFill that CSS references via url(#id): a
 * <linearGradient> for gradient fills (a flat fill becomes a single-stop gradient — solid
 * paint) or a <pattern> for T2 pattern fills — the url() indirection keeps working for any
 * theme without touching the referencing style.css rule. patternUnits stays userSpaceOnUse so
 * the tile's px sizing is absolute: the texture's grain does NOT stretch with the element it
 * paints (a bigger cork board has more flecks, not bigger flecks).
 */
/** D11.1: the scene light's cast-shadow offset — one constant for the whole picture, so
 * every thread/knob throws its shadow onto the backdrop sheet in the same direction (light
 * from the upper left). Color/width come from the theme (--hsd-cast-color / --hsd-cast-width);
 * geometry is an offset copy, so nothing here re-evaluates a filter per frame. */
export declare const CAST_SHADOW_TRANSFORM = "translate(7 5)";
export declare function createFillDef(id: string, fill: ThemeFill): SVGElement;
