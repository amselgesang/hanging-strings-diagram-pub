/**
 * ECharts adapter (integration.md I2 item 3). Per the design, this is NOT a custom series
 * (ECharts' `renderItem` is canvas/zrender-oriented — reimplementing the renderer there would
 * abandon the SVG/physics stack) but an EXTENSION that CLAIMS the chart's container div: the
 * embeddable façade (I1/I4) mounts as a DOM overlay inside `chart.getDom()`, painting above
 * the ECharts canvas. ECharts keeps ownership of the container and its option; the adapter
 * re-reads `chart.getOption()` on demand.
 *
 * The adapter never imports echarts — it consumes any object that structurally provides
 * `getDom()`/`getOption()` (every real ECharts instance does), so there is no echarts
 * dependency, peer or otherwise; the artifact's only external is the core library.
 *
 * Data mapping (I3):
 *   - `xAxis.data[i]` (object or array form)     → category id + name
 *   - `series[0].data[i]`                        → value (numbers or `{value}` datum objects;
 *                                                  null/"-"/NaN skipped — ECharts' own
 *                                                  missing-data conventions)
 *   - `series[1].data[i]`                        → optional secondaryValue (D7/D8)
 *   - `series[0].hsdGroupIds[i]`                  → optional per-category group id; group
 *                                                  names/colors from the adapter config's
 *                                                  `groups`, else derived from itemStyle/name.
 * Hierarchy (D16) has no ECharts analog — pass canonical `categories` (with children) in the
 * adapter config to bypass the mapping.
 *
 * Lifecycle contract (v1, deliberately explicit): call `refresh()` after `chart.setOption()`
 * and `dispose()` when tearing the chart down. Live look/behavior changes go through the
 * returned façade instance (`hsd.instance.setTheme(...)` etc.) — the adapter adds no second
 * option surface over the façade's public one.
 */
import { type HangingStringsDiagram, type HangingStringsDiagramOptions, type HangingStringCategory, type HangingStringGroup } from "hanging-strings-diagram";
/** Adapter config: everything the façade accepts, with data optional — `categories`/`groups`
 * given here override the ECharts option mapping (the hierarchy path). */
export type HangingStringsDiagramEChartsConfig = Partial<HangingStringsDiagramOptions>;
/** One ECharts datum: a plain number, a `{value}` object, or ECharts' "-" missing marker. */
type EChartsDatum = number | string | null | undefined | {
    value?: number | string | null;
};
interface EChartsSeriesLike {
    name?: string;
    data?: EChartsDatum[];
    itemStyle?: {
        color?: unknown;
    };
    /** Adapter extension: per-index group id, aligned with the category axis. */
    hsdGroupIds?: string[];
}
interface EChartsAxisLike {
    data?: unknown[];
}
/** The minimal slice of an ECharts option the mapper reads — `getOption()` returns the axis
 * normalized to an array; hand-written options often use the object form. Both work. */
export interface EChartsLikeOption {
    xAxis?: EChartsAxisLike | EChartsAxisLike[];
    series?: EChartsSeriesLike | EChartsSeriesLike[];
}
/** The minimal slice of an ECharts instance the adapter uses — structural, so any real
 * instance (or a test stub) qualifies without importing echarts. */
export interface EChartsInstanceLike {
    getDom(): HTMLElement;
    getOption(): EChartsLikeOption;
    getHeight?(): number;
}
/**
 * Pure mapper: an ECharts option's category axis + series → the canonical Hanging Strings Diagram
 * shape. `declaredGroups` (from the adapter config) wins for group names/colors.
 */
export declare function echartsOptionToHangingStringsDiagram(option: EChartsLikeOption, declaredGroups?: HangingStringGroup[]): {
    categories: HangingStringCategory[];
    groups: HangingStringGroup[];
};
export interface HangingStringsDiagramECharts {
    /** The underlying façade instance — the public surface for live look/behavior changes. */
    readonly instance: HangingStringsDiagram;
    /** Re-reads `chart.getOption()` and updates the data (call after `chart.setOption()`). */
    refresh(): void;
    /** Removes the overlay and everything the façade added. Safe to call more than once. */
    dispose(): void;
}
/**
 * Claims the ECharts instance's container: mounts the façade as an absolutely-positioned
 * overlay above the ECharts canvas, seeded from `chart.getOption()` + `config`.
 */
export declare function attachHangingStringsDiagram(chart: EChartsInstanceLike, config?: HangingStringsDiagramEChartsConfig): HangingStringsDiagramECharts;
export {};
