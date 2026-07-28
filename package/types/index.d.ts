/**
 * Hanging Strings Diagram — the library's single public entry (R2, wiki/design/release-delivery.md).
 *
 * Everything exported here is the supported surface for embedding Hanging Strings Diagram in a host
 * page or framework adapter (wiki/design/integration.md); anything this file does not export
 * is internal and may change without notice. The demo application (main.ts) is a CONSUMER of
 * this surface, never part of it.
 *
 * Layering (typescript-plan.md): `core/*` is pure and DOM-free; `renderers/svg/*` are the DOM
 * renderers; the theme system spans both (plain-data themes in core, CSS-var/defs translation
 * in the svg renderer package).
 */
import "./style.css";
export { createHangingStringsDiagram, type HangingStringsDiagram, type HangingStringsDiagramOptions, type HangingStringsDiagramDisplayOptions, type RailMode, type BackdropMode, type ReorderEvent, type ExpandEvent, type HoverEvent, type SecondaryEncoding, type SonificationOptions, } from "./facade";
export type { StringHoverEvent } from "./renderers/svg/hover";
export type { HangingStringCategory, HangingStringGroup, HangingStringsDiagramConfig, ColorMode, } from "./core/types";
export { DEFAULT_CONFIG } from "./core/types";
export { computeLayout, bringGroupToFront, knobRadiusScaleForCategories, type LayoutResult, type StringLayout, type SubRailLayout, } from "./core/layout";
export { computeRingLayout, computeRailTicks, centerGroupInRing, depthFromAnchorY, pointOnRailEllipse, DEFAULT_RING_CONFIG, } from "./core/ringLayout";
export { computeHierarchyLayout, findParentOf, type HierarchyConfig, } from "./core/hierarchy";
export { computeRingHierarchyLayout, type RingHierarchyConfig } from "./core/ringHierarchy";
export { StraightRailForm, ArcRailForm, WaveRailForm, FreeformRailForm, EllipseRailForm, loopDepthFromY, type PlanarRailForm, } from "./core/railForm";
export { linearScale, sqrtScale, tickStep, ticksBelow, niceStep, heatmapColor } from "./core/scale";
export { computeQuipuLayout, quipuNeededDropPx, isBigFifth, DEFAULT_QUIPU_CONFIG, type QuipuConfig, type QuipuLayout, type QuipuGlyph, } from "./core/quipu";
export { frequencyFor, sweepSchedule, DEFAULT_SONIFY_CONFIG, type SonifyConfig, type SonifyScale, type PitchDirection, type SweepNote, } from "./core/sonify";
export { createPluckPlayer, type PluckPlayer, type PluckOptions } from "./renderers/audio/pluck";
export { THEMES, STUDIO_THEME, WORKSHOP_THEME, FOUNDRY_THEME, INK_PAPER_THEME, WOOL_BRASS_THEME, type HangingStringsDiagramTheme, type ThemeFill, type ThemeShadow, type ThemeGradientStop, type ThemePatternTile, type ThemePatternMark, type ThemeThreadTexture, type ThemeImageLuminanceTexture, } from "./core/theme";
export { THREAD_TEXTURES } from "./core/assets/threadTextures";
export { applyTheme, themeCssVars, createFillDef } from "./renderers/svg/theme";
export { syncLabelContrast, syncAllChartLabelContrast, isDarkCssColor, resolveLabelInks, LABEL_INKS_DARK_GROUND, LABEL_INKS_LIGHT_GROUND, } from "./core/labelContrast";
export { SvgRenderer, type SvgRendererOptions } from "./renderers/svg/render";
export { RingSvgRenderer, type RingSvgRendererOptions } from "./renderers/svg/renderRing";
export { createSheetBackdrop, breezeSignal, type SheetBackdrop, type SheetTexture, type SheetTopProfile, } from "./renderers/svg/backdrop";
