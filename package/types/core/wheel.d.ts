/**
 * Normalize WheelEvent vertical delta to approximate CSS pixels.
 *
 * Chromium typically uses DOM_DELTA_PIXEL (0) with ~100px mouse notches.
 * Firefox often uses DOM_DELTA_LINE (1) with ±1…±3 — feeding those raw into an
 * exp(delta * k) zoom factor makes scroll-to-zoom feel broken (≈no movement).
 *
 * Prefer deltaY; fall back to deltaX when it dominates (shift-style horizontal wheel).
 */
export declare function wheelDeltaYPixels(ev: Pick<WheelEvent, "deltaY" | "deltaX" | "deltaMode">, pageHeight?: number): number;
