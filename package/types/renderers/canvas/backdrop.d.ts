/**
 * The full-canvas breeze backdrop (queries/breeze-webkit-gpu-idle-2026-08-16, the "scale
 * path"): the same hanging cloth as the SVG backdrop — same wind, same geometry, same
 * adaptive ladder, same public API — but painted with canvas 2d instead of mutated SVG.
 *
 * WHY: WebKit repaints an SVG dirty region for ANY attribute write and re-rasterizes every
 * pattern-filled mesh cell under its fresh per-frame affine — with breeze on, that pegged
 * com.apple.webkit.gpu even when the motion was sub-pixel. A canvas frame is one
 * texture upload: the cloth's cost no longer scales with cell count × viewport × DPR-cubed
 * SVG rasterization, and nothing outside the canvas is invalidated.
 *
 * HOW IT PAINTS: the cloth GEOMETRY comes verbatim from ../svg/backdrop (clothOffset,
 * meshCorner, pleatShade, sheetPath — one model, two painters). Tiling weaves become
 * offscreen tile canvases wrapped in ctx patterns that ride each mesh cell's affine exactly
 * like SVG userSpaceOnUse patterns ride the element transform; the one-emblem cloths
 * (EU/USA/image) draw per-cell drawImage slices of a baked bitmap. The backing store is
 * capped at 2× DPR — beyond that a soft cloth gains nothing but fill-rate.
 */
import { type SheetBackdrop } from "../svg/backdrop";
/**
 * Canvas twin of createSheetBackdrop — identical SheetBackdrop contract. Returns null when
 * no 2d context is available (jsdom, exotic embeds): the caller falls back to the SVG
 * implementation, which degrades further on its own.
 */
export declare function createCanvasSheetBackdrop(container: HTMLElement): SheetBackdrop | null;
