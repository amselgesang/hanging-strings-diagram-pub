/**
 * Chart.js adapter (integration.md I2 — Q22: the FIRST framework adapter). Registers a custom
 * controller `type: "hangingStringsDiagram"` that mounts the embeddable façade (I1/I4) as a DOM
 * overlay inside the chart's container: Chart.js keeps its lifecycle (config, `update()`,
 * `destroy()`, responsive container), Hanging Strings Diagram keeps its own SVG rendering and
 * interactions. Per I1 the adapter NEVER reaches into renderers — every call goes through
 * `createHangingStringsDiagram`.
 *
 * Data mapping (I3: the adapter owns it, the façade sees only the canonical shape):
 *   - `data.labels[i]`               → category id + name
 *   - `data.datasets[0].data[i]`     → value (null/NaN entries are skipped, Chart.js's own
 *                                      missing-data convention)
 *   - `data.datasets[1].data[i]`     → optional secondaryValue (knob size / heat-map, D7/D8)
 *   - `data.datasets[0].hsdGroupIds[i]` → optional per-category group id; group colors/names
 *                                      come from `options.hangingStringsDiagram.groups`, else are
 *                                      derived from the dataset's backgroundColor/label.
 * Hierarchy (D16) has no Chart.js analog — pass full canonical `categories` (with children)
 * via `options.hangingStringsDiagram.categories` to bypass the mapping entirely.
 *
 * Everything else the façade accepts (railMode, theme, backdrop, callbacks, …) rides in
 * `options.hangingStringsDiagram` and is re-diffed on every `chart.update()`.
 */
import { DatasetController } from "chart.js";
import type { Chart, UpdateMode } from "chart.js";
import { type HangingStringsDiagramOptions, type HangingStringCategory, type HangingStringGroup } from "hanging-strings-diagram";
/** `options.hangingStringsDiagram`: everything the façade accepts, with data optional — categories/
 * groups given here OVERRIDE the Chart.js data mapping (the hierarchy path). */
export type HangingStringsDiagramChartConfig = Partial<HangingStringsDiagramOptions>;
declare module "chart.js" {
    interface ChartTypeRegistry {
        hangingStringsDiagram: {
            chartOptions: {
                hangingStringsDiagram?: HangingStringsDiagramChartConfig;
            };
            datasetOptions: {
                hsdGroupIds?: string[];
            };
            defaultDataPoint: number | null;
            metaExtensions: object;
            parsedDataType: number;
            scales: never;
        };
    }
}
/** The minimal slice of Chart.js `data` the mapper reads — structurally typed so the mapper
 * stays pure and unit-testable without a Chart instance. */
export interface ChartJsLikeData {
    labels?: unknown[];
    datasets?: {
        label?: string;
        data?: unknown[];
        backgroundColor?: unknown;
        /** Adapter extension: per-index group id, aligned with `labels`. */
        hsdGroupIds?: string[];
    }[];
}
/**
 * Pure mapper: Chart.js `labels` + `datasets` → the canonical Hanging Strings Diagram data shape.
 * `declaredGroups` (from `options.hangingStringsDiagram.groups`) wins for group names/colors; groups
 * only referenced by the data are derived with the dataset's backgroundColor as their color.
 */
export declare function chartDataToHangingStringsDiagram(data: ChartJsLikeData, declaredGroups?: HangingStringGroup[]): {
    categories: HangingStringCategory[];
    groups: HangingStringGroup[];
};
export declare class HangingStringsDiagramController extends DatasetController {
    static readonly id = "hangingStringsDiagram";
    /** No canvas elements are ever CREATED (buildOrUpdateElements is a no-op) — but Chart.js
     * resolves `dataElementType` through its element registry unconditionally (only
     * `datasetElementType` may be false), so a real registered element name must stand in.
     * registerHangingStringsDiagram registers PointElement to guarantee it resolves. */
    static readonly defaults: {
        dataElementType: string;
        datasetElementType: boolean;
    };
    /** Chart.js chrome that presumes canvas-drawn data is switched off; the overlay owns
     * pointer interactions, its own legend semantics (group swatches), and its own hover card
     * (or the host's, via onHover/showHoverCard). */
    static readonly overrides: {
        plugins: {
            legend: {
                display: boolean;
            };
            tooltip: {
                enabled: boolean;
            };
        };
        scales: {};
    };
    linkScales(): void;
    parse(): void;
    buildOrUpdateElements(): void;
    draw(): void;
    update(_mode: UpdateMode): void;
}
/** Teardown rides a plugin (afterDestroy is a stable, documented hook — controller-internal
 * destroy paths are not): the façade instance and its overlay leave with the chart. */
export declare const hangingStringsDiagramCleanupPlugin: {
    id: string;
    afterDestroy(chart: Chart): void;
};
/** One-call registration: `registerHangingStringsDiagram(Chart)` — then `new Chart(ctx, { type:
 * "hangingStringsDiagram", … })`. */
export declare function registerHangingStringsDiagram(chartjs: {
    register: (...items: unknown[]) => void;
}): void;
