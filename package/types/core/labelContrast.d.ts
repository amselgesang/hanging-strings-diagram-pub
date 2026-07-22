/**
 * Label contrast sync — keep chart text readable against the *painted* chart ground.
 *
 * Themes author label inks for their own `background.color`. Hosts (and the Night gallery
 * skin) can override the visible `background-color` afterward; this module re-reads the
 * computed ground and flips label CSS vars when ink polarity disagrees with the ground.
 */
export type LabelInkSet = {
    ink: string;
    halo: string;
    valueInk: string;
    captionInk: string;
};
/** Studio-class dark-on-light (matches STUDIO_THEME.label). */
export declare const LABEL_INKS_LIGHT_GROUND: LabelInkSet;
/** Foundry-class light-on-dark (matches FOUNDRY_THEME.label family). */
export declare const LABEL_INKS_DARK_GROUND: LabelInkSet;
/** Relative luminance threshold: at/below → dark ground (Night #12100e, Foundry #171a22). */
export declare const DARK_GROUND_LUMINANCE = 0.18;
type Rgb = {
    r: number;
    g: number;
    b: number;
};
export declare function relativeLuminance(r: number, g: number, b: number): number;
/** Parse `#rgb` / `#rrggbb` / `rgb()` / `rgba()` — returns null for `transparent` / unknown. */
export declare function parseCssColor(css: string): Rgb | null;
export declare function isDarkCssColor(css: string, threshold?: number): boolean;
/**
 * If painted ground and current label ink disagree in polarity, return the preset to apply;
 * otherwise null (keep authored inks — e.g. Foundry on its own dark ground).
 */
export declare function resolveLabelInks(paintedBackground: string, currentInk: string): LabelInkSet | null;
export type SyncLabelContrastOptions = {
    /** Override computed background (tests / hosts that already know the painted ground). */
    backgroundColor?: string;
    /** Override current `--hsd-label-ink`. */
    labelInk?: string;
};
/**
 * Stamp light/dark label CSS vars when the painted ground disagrees with current ink polarity.
 * @returns true when vars were changed.
 */
export declare function syncLabelContrast(el: Element & {
    style: CSSStyleDeclaration;
}, opts?: SyncLabelContrastOptions): boolean;
/** Re-sync every live chart container (e.g. after gallery skin flips the painted ground). */
export declare function syncAllChartLabelContrast(root?: ParentNode): void;
export {};
