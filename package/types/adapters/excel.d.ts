/**
 * Excel adapter (wiki/design/excel-integration.md, E1–E5). The fourth adapter after Chart.js /
 * ECharts / React, and — like the ECharts one — it never imports its host: every Office.js
 * object it touches is typed STRUCTURALLY (`ExcelHostLike`, `WorksheetLike`, `RangeLike`), so
 * there is no `@types/office-js` dependency, the artifact's only external is the core, and the
 * live-sync logic is unit-testable against a fake host in Node.
 *
 * Two layers, deliberately split (E2):
 *
 *   1. `excelRangeToHangingStringsDiagram(values, options)` — a PURE mapper from a 2-D cell
 *      array (exactly what `Range.values` gives you) to the canonical shape (integration I3).
 *      Column roles are found by header name, else by position; a `parent` column nests rows
 *      into the D16 hierarchy. No Office.js, no DOM.
 *
 *   2. `attachHangingStringsDiagramToExcel(container, config)` — the host-side glue: resolves the
 *      source range (an explicit address, a table, or the worksheet's used range), reads it
 *      through `Excel.run`, mounts the façade, and keeps the chart in sync with the grid via
 *      `Worksheet.onChanged` (E4), with an optional value-diffing poll (`pollMs`) as the
 *      safety net for edits the event does not report. Refreshes never overlap (a change
 *      arriving mid-read queues one follow-up read), and `dispose()` removes the handler,
 *      stops the poll and destroys the chart.
 *
 * The content add-in page (addins/excel/) is a CONSUMER of this module, never part of it —
 * same litmus test the demo panel passes for the façade (I4).
 */
import { createHangingStringsDiagram, type HangingStringsDiagram, type HangingStringsDiagramOptions, type HangingStringCategory, type HangingStringGroup } from "hanging-strings-diagram";
/** What `Excel.Range.values` holds per cell: numbers, text, booleans, or "" for empty cells
 * (Office.js reports blanks as empty strings; `null` is accepted too for callers building
 * arrays by hand). */
export type ExcelCellValue = string | number | boolean | null;
/** A column may be named by zero-based index or by its header text (case-insensitive). */
export type ExcelColumnRef = number | string;
export interface ExcelRangeMappingOptions {
    /** Whether row 0 is a header row. `"auto"` (default): it is, when the value column's first
     * cell is not numeric. */
    header?: boolean | "auto";
    /** Explicit column roles. Anything not given is resolved from header names, then position
     * (A = name, B = value, then C/D = secondary / group by cell type). */
    columns?: {
        name?: ExcelColumnRef;
        value?: ExcelColumnRef;
        secondary?: ExcelColumnRef;
        group?: ExcelColumnRef;
        parent?: ExcelColumnRef;
    };
    /** Declared groups win for names/colors; groups the sheet references but the caller did not
     * declare get palette colors, in first-seen order. Declared-but-unreferenced groups are kept
     * (stable legend contract, as in the other adapters). */
    groups?: HangingStringGroup[];
    /** Colors for undeclared groups, cycled. */
    palette?: string[];
}
export interface ExcelMappedData {
    categories: HangingStringCategory[];
    groups: HangingStringGroup[];
    /** Which zero-based columns were used for which role (for a host's status line). */
    columns: {
        name: number;
        value: number;
        secondary: number | null;
        group: number | null;
        parent: number | null;
    };
    /** Whether row 0 was consumed as a header. */
    header: boolean;
}
/** The palette for undeclared groups: distinct, print-safe hues that read on the Studio and
 * Wool & brass grounds alike. Group color is a data encoding (deliberately not themable). */
export declare const DEFAULT_EXCEL_PALETTE: string[];
/**
 * Pure mapper: a 2-D cell array (`Range.values`) → the canonical Hanging Strings Diagram shape.
 *
 * Rules (E2): rows with a blank name or a non-numeric value are skipped (the sheet's own
 * "missing data" convention — a blank or a text note in the value cell); duplicate names get
 * a numeric suffix so ids stay unique; a `parent` column nests rows under the row whose name
 * matches (unknown parents fall back to top level); groups come from the group column (id =
 * slug of the text), else the single implicit group.
 */
export declare function excelRangeToHangingStringsDiagram(values: ExcelCellValue[][], options?: ExcelRangeMappingOptions): ExcelMappedData;
/** The slice of `Excel.Range` the adapter reads. Real proxies expose far more; a test fake
 * needs only this. */
export interface RangeLike {
    address: string;
    values: ExcelCellValue[][];
    load(properties: string): unknown;
}
export interface WorksheetChangedArgsLike {
    address: string;
    changeType?: string;
    worksheetId?: string;
}
export interface EventHandlerResultLike {
    remove(): unknown;
}
export interface WorksheetLike {
    name: string;
    load(properties: string): unknown;
    getRange(address: string): RangeLike;
    getUsedRange(valuesOnly?: boolean): RangeLike;
    /** Absent on hosts below ExcelApi 1.7 — the adapter then degrades to manual `refresh()`. */
    onChanged?: {
        add(handler: (args: WorksheetChangedArgsLike) => Promise<unknown> | unknown): EventHandlerResultLike;
    };
}
export interface TableLike {
    getRange(): RangeLike;
    getWorksheet(): WorksheetLike;
}
export interface WorkbookLike {
    worksheets: {
        getActiveWorksheet(): WorksheetLike;
        getItem(name: string): WorksheetLike;
    };
    tables?: {
        getItem(name: string): TableLike;
    };
}
export interface ExcelContextLike {
    workbook: WorkbookLike;
    sync(): Promise<unknown>;
}
/** `Excel` (the Office.js namespace object) satisfies this: `Excel.run(batch)`. */
export interface ExcelHostLike {
    run<T>(batch: (context: ExcelContextLike) => Promise<T>): Promise<T>;
}
/** Where the chart's data lives. Precedence: `table` > `address` > the used range of
 * `worksheet` (or the active worksheet). */
export interface ExcelDataSource {
    /** Worksheet name; default: the active worksheet at attach time. */
    worksheet?: string;
    /** A1-style address (with or without a sheet prefix); default: the worksheet's used range,
     * re-measured on every refresh so appended rows appear. */
    address?: string;
    /** A table name (structured reference). Its worksheet wins over `worksheet`. */
    table?: string;
}
export interface ExcelSyncMeta {
    worksheet: string;
    address: string;
    mapped: ExcelMappedData;
    /** What triggered the read: initial mount, an explicit refresh(), a `Worksheet.onChanged`
     * event, or the polling fallback noticing different cell values. */
    reason: "mount" | "refresh" | "change" | "poll";
}
export interface HangingStringsDiagramExcelConfig extends Omit<Partial<HangingStringsDiagramOptions>, "categories" | "groups"> {
    /** The Office.js `Excel` namespace (or any structural stand-in). */
    excel: ExcelHostLike;
    source?: ExcelDataSource;
    mapping?: ExcelRangeMappingOptions;
    /** Follow `Worksheet.onChanged` (default true). Off = manual `refresh()` only. */
    live?: boolean;
    /** Safety net for edits `onChanged` does not report (automation/AppleScript/VBA writes,
     * hosts below ExcelApi 1.7): re-read every `pollMs` ms and update only when the cell
     * values differ. 0 (default) = off. Coalesces with the event path — a poll never runs
     * while a read is in flight. */
    pollMs?: number;
    /** Declared groups (colors/names) — sugar for `mapping.groups`. */
    groups?: HangingStringGroup[];
    /** Fires after every successful read (mount, refresh, change) with what was read. */
    onSync?: (meta: ExcelSyncMeta) => void;
    /** Fires when a read fails (e.g. the source range was deleted). The chart keeps its last
     * good data. */
    onError?: (error: unknown) => void;
    /** Test seam / custom façade: how the chart instance is created. Default: the real façade. */
    createDiagram?: typeof createHangingStringsDiagram;
}
export interface HangingStringsDiagramExcel {
    /** The underlying façade instance — the public surface for look/behavior changes. */
    readonly instance: HangingStringsDiagram;
    /** Where the last successful read came from. */
    readonly source: {
        worksheet: string;
        address: string;
    };
    /** True while a `Worksheet.onChanged` handler is bound (false on hosts without the event,
     * or with `live: false`). */
    readonly live: boolean;
    /** Re-read the source range and update the chart. Concurrent calls coalesce. */
    refresh(): Promise<void>;
    /** Point the chart at a different range/table (re-reads immediately, re-binds live sync). */
    setSource(source: ExcelDataSource): Promise<void>;
    /** Removes the change handler and destroys the chart. Safe to call more than once. */
    dispose(): Promise<void>;
}
/** Reads the source range inside one `Excel.run` batch. Exported for tests and for hosts that
 * only want the data. */
export declare function readExcelSource(excel: ExcelHostLike, source?: ExcelDataSource): Promise<{
    worksheet: string;
    address: string;
    values: ExcelCellValue[][];
}>;
/**
 * Mounts the façade in `container`, seeded from the Excel source, and keeps it in sync with
 * the grid. Resolves once the first read has rendered (rejects if that read fails — a host
 * bug like a wrong address should fail loudly, per the façade's own convention).
 */
export declare function attachHangingStringsDiagramToExcel(container: HTMLElement, config: HangingStringsDiagramExcelConfig): Promise<HangingStringsDiagramExcel>;
