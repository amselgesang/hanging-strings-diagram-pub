/**
 * React wrapper (integration.md I2 item 4 — the last planned adapter): a thin
 * `<HangingStringsDiagramChart {...props}/>` that renders one container div and drives the
 * embeddable façade (I1/I4) through effects — mount → `createHangingStringsDiagram`, prop changes →
 * the façade's own setters (diffed per prop group, never a teardown/remount), unmount →
 * `destroy()`. Per I1 the wrapper never touches renderers; per I3 it maps nothing — the
 * canonical `categories`/`groups` are the props.
 *
 * Callbacks are wired once through stable refs (the façade takes them at creation), so
 * passing a new inline `onHover` every render neither re-creates the chart nor misses events.
 * `showHoverCard` and `height` are creation-time options; change them by remounting (`key`).
 *
 * No JSX and no react-dom: plain `createElement`, so the artifact stays dependency-thin —
 * its externals are `react` and the core.
 */
import type { CSSProperties, ReactElement } from "react";
import { type HangingStringsDiagramOptions } from "hanging-strings-diagram";
export interface HangingStringsDiagramChartProps extends HangingStringsDiagramOptions {
    /** Forwarded to the container div the chart mounts into. */
    className?: string;
    style?: CSSProperties;
}
export declare function HangingStringsDiagramChart(props: HangingStringsDiagramChartProps): ReactElement;
