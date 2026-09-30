# Integration

Best practices and worked examples for embedding Hanging Strings Diagram in a host page or
charting stack.

## Architecture

```
host page / framework
        │
  adapter (Chart.js / ECharts / React)  — optional; maps host lifecycle → façade
        │
  createHangingStringsDiagram(container, options)   ← THE public API
        │
  core/* (pure layout) + renderers/svg/* (DOM) + theme system
```

Everything integrates through **one façade**. Adapters never reach into renderers directly.
The façade owns mount/update/destroy, mode switching, theming, backdrop, and events.

## Best practices

1. **Façade-only from adapters and apps** — translate host data into
   `HangingStringCategory[]` / `HangingStringGroup[]`, then call façade methods.
2. **Destroy on unmount** — `hsd.destroy()`, Chart.js `chart.destroy()`, ECharts handle
   `dispose()`, React unmount. Prevents orphaned rAF loops.
3. **Commit-time callbacks** — `onReorder` / `onExpand` / `onSelect` / `onHover` fire on
   settled or enter/leave events, never per animation frame. Do not drive layout from spin
   frame callbacks unless you are writing a custom renderer.
4. **Sized container** — give the host element a non-zero width (and height for Chart.js /
   ECharts shells). The façade measures width responsively.
5. **Import CSS once** — `hanging-strings-diagram/style.css` (or `<link>` the built CSS).
6. **Multi-instance theming** — rely on container-scoped variables; mount many charts with
   different themes on one page.
7. **One secondary encoding** — use `secondaryEncoding`; do not stack knob + heat + quipu.
8. **Do not theme group colors** — data colors stay on `groups[].color`.

## Do / don’t

| Do | Don’t |
| --- | --- |
| Call `destroy()` / adapter dispose on teardown | Leave instances alive after navigation |
| Pass plain-text names | Expect HTML in `name` to render as markup |
| Prefer `secondaryEncoding` | Encode three metrics at once |
| Use façade `setRailMode` | Reach into `SvgRenderer` from an adapter |
| Persist `onReorder` positions if you need stable custom order | Ignore that ring foreshortens readings |

---

## Example 1 — Vanilla façade

```html
<link rel="stylesheet" href="hanging-strings-diagram.css">
<script src="hanging-strings-diagram.umd.min.js"></script>
<div id="chart" style="width: 700px"></div>
<script>
  const groups = [
    { id: "sales", name: "Sales", color: "#4169c8" },
    { id: "product", name: "Product", color: "#2f9e63" },
  ];
  const categories = [
    { id: "revenue", name: "Revenue", value: 92, groupId: "sales" },
    { id: "pipeline", name: "Pipeline", value: 78, groupId: "sales" },
    { id: "retention", name: "Retention", value: 88, groupId: "product" },
    { id: "nps", name: "NPS", value: 40, groupId: "product" },
  ];

  const hsd = HangingStringsDiagram.createHangingStringsDiagram(
    document.getElementById("chart"),
    {
      categories,
      groups,
      theme: "workshop",
      backdrop: "plain", // default; use "off" to disable the breeze sheet
      onReorder: (e) => console.log("committed slide", e),
    }
  );

  hsd.setRailMode("ring");
  hsd.setSecondaryEncoding("quipu");
  // …
  hsd.destroy();
</script>
```

```ts
import { createHangingStringsDiagram } from "hanging-strings-diagram";
import "hanging-strings-diagram/style.css";

const hsd = createHangingStringsDiagram(document.getElementById("chart")!, {
  categories,
  groups,
  theme: "wool-brass",
});
```

---

## Example 2 — Chart.js

Custom controller `type: "hangingStringsDiagram"`. Artifact:
`hanging-strings-diagram-chartjs.*.min.js` (~3.5 KB); peers: `chart.js` v4+ and the core.

```html
<link rel="stylesheet" href="hanging-strings-diagram.css">
<script src="chart.umd.js"></script>
<script src="hanging-strings-diagram.umd.min.js"></script>
<script src="hanging-strings-diagram-chartjs.umd.min.js"></script>
<div style="width: 720px; height: 480px"><canvas id="c"></canvas></div>
<script>
  HangingStringsDiagramChartJs.registerHangingStringsDiagram(Chart);
  new Chart(document.getElementById("c"), {
    type: "hangingStringsDiagram",
    data: {
      labels: ["Revenue", "Retention", "NPS", "Churn"],
      datasets: [
        {
          label: "KPIs",
          data: [92, 88, 61, 24],
          hsdGroupIds: ["fin", "fin", "cx", "cx"],
        },
        { data: [8.2, 4.1, null, 1.4] }, // optional 2nd metric
      ],
    },
    options: {
      hangingStringsDiagram: {
        groups: [
          { id: "fin", name: "Financial", color: "#3b82f6" },
          { id: "cx", name: "Experience", color: "#ec4899" },
        ],
        theme: "workshop",
      },
    },
  });
</script>
```

```ts
import { Chart } from "chart.js";
import { registerHangingStringsDiagram } from "hanging-strings-diagram/chartjs";
registerHangingStringsDiagram(Chart);
```

**Mapping:** `labels[i]` → category id/name; `datasets[0].data[i]` → value (`null`/`NaN`
skipped); `datasets[1].data[i]` → optional secondary; `datasets[0].hsdGroupIds[i]` +
`options.hangingStringsDiagram.groups` → grouping. Hierarchy has no Chart.js analog — pass
canonical `categories` (with `children`) in `options.hangingStringsDiagram` to bypass mapping.
Call `chart.update()` after mutating data; `chart.destroy()` tears down the overlay.

---

## Example 3 — ECharts

Claims the ECharts container; façade mounts as a DOM overlay. No `echarts` package dependency
in the adapter — only the core is external. Artifact:
`hanging-strings-diagram-echarts.*.min.js` (~2 KB).

```html
<link rel="stylesheet" href="hanging-strings-diagram.css">
<script src="echarts.min.js"></script>
<script src="hanging-strings-diagram.umd.min.js"></script>
<script src="hanging-strings-diagram-echarts.umd.min.js"></script>
<div id="c" style="width: 720px; height: 480px"></div>
<script>
  const chart = echarts.init(document.getElementById("c"));
  chart.setOption({
    xAxis: { data: ["Revenue", "Retention", "NPS", "Churn"] },
    series: [
      {
        type: "bar",
        name: "KPIs",
        data: [92, 88, 61, 24],
        hsdGroupIds: ["fin", "fin", "cx", "cx"],
      },
      { type: "bar", data: [8.2, 4.1, "-", 1.4] },
    ],
    yAxis: {},
  });
  const handle = HangingStringsDiagramECharts.attachHangingStringsDiagram(chart, {
    groups: [
      { id: "fin", name: "Financial", color: "#3b82f6" },
      { id: "cx", name: "Experience", color: "#ec4899" },
    ],
    theme: "ink-paper",
  });
  // after chart.setOption(...): handle.refresh();
  // live look: handle.instance.setRailMode("ring"), …
  // teardown: handle.dispose();
</script>
```

```ts
import { attachHangingStringsDiagram } from "hanging-strings-diagram/echarts";
```

**Lifecycle:** `refresh()` after `setOption`, `dispose()` at teardown, everything else through
`handle.instance` (the façade).

---

## Example 4 — React

Thin wrapper: mount creates the chart, prop changes diff into setters (no remount), unmount
destroys. Peers: `react` ≥ 17 and the core (~2 KB adapter).

```tsx
import { HangingStringsDiagramChart } from "hanging-strings-diagram/react";
import "hanging-strings-diagram/style.css";

export function KpiCurtain({ categories, groups }) {
  return (
    <HangingStringsDiagramChart
      categories={categories}
      groups={groups}
      railMode="ring"
      theme="workshop"
      onHover={(e) => {
        /* host tooltip */
      }}
      style={{ width: "100%" }}
    />
  );
}
```

All `createHangingStringsDiagram` options are props. `showHoverCard` and `height` are
creation-time — change them by remounting (`key`). Callbacks may be inline; they are wired
through stable refs and do not recreate the chart.
---

## Example 5 — Excel (content add-in)

The chart sits **inside the worksheet**, reads a table on the sheet, and follows edits. Two
pieces: the `hanging-strings-diagram/excel` adapter (works in any Office.js page — task pane
or content object) and a ready-made content add-in (`addins/excel/`) you can sideload as is.

### Sheet layout the adapter understands

| Name | Value | Secondary | Group | Parent |
| --- | --- | --- | --- | --- |
| Revenue | 92 | 8.2 | Sales | |
| EMEA | 60 | | Sales | Revenue |

- `Name` + a numeric `Value` are enough; the other columns are optional.
- Roles are found by header text (`Name/Label/Category…`, `Value/Amount/Score…`,
  `Secondary/Knob/Heat/Share…`, `Group/Series/Team…`, `Parent`), or by position without a
  header: A = name, B = value, next numeric column = secondary, next text column = group.
- Rows with a blank name or a non-numeric value are skipped. `Parent` nests rows under the
  row with that name (two-level hierarchy).
- Default source: the active sheet's **used range**, re-measured on every read, so appended
  rows appear. Pass an `address` or a `table` name to pin the source.

### Adapter in your own add-in page

```html
<script src="https://appsforoffice.microsoft.com/lib/1/hosted/office.js"></script>
<link rel="stylesheet" href="hanging-strings-diagram.css">
<script src="hanging-strings-diagram.umd.min.js"></script>
<script src="hanging-strings-diagram-excel.umd.min.js"></script>
<div id="chart" style="height: 480px"></div>
<script>
  Office.onReady().then(async () => {
    const handle = await HangingStringsDiagramExcel.attachHangingStringsDiagramToExcel(
      document.getElementById("chart"),
      {
        excel: Excel,                    // the Office.js namespace
        source: { address: "A1:D20" },   // or { table: "KPIs" }, or omit = used range
        theme: "workshop",
        onSync: (m) => console.log(m.reason, m.address, m.mapped.categories.length),
        onError: (e) => console.warn("sheet read failed, keeping last data", e),
      }
    );
    handle.instance.setRailMode("ring"); // everything else through the façade
    // handle.refresh(); handle.setSource({ table: "Q3" }); handle.dispose();
  });
</script>
```

```ts
import { attachHangingStringsDiagramToExcel, excelRangeToHangingStringsDiagram } from "hanging-strings-diagram/excel";
```

**Live sync:** the adapter binds `Worksheet.onChanged` and re-reads the source on every
edit (reads never overlap; bursts coalesce into one trailing read). `handle.live` tells you
whether the event is bound (false on hosts below ExcelApi 1.7 — use `refresh()`). Edits made
by automation (VBA, AppleScript) may not raise the event; pass `pollMs` (e.g. `1500`) to add
a value-diffing poll as a safety net. `excelRangeToHangingStringsDiagram(values)` is the pure
mapper if you only want the data shape.

### The ready-made content add-in

`addins/excel/manifest.xml` points at the published page. To use it as an end user, sideload
the manifest (Mac: copy it to `~/Library/Containers/com.microsoft.Excel/Data/Documents/wef`
and restart Excel) — or open a workbook that already embeds the add-in, which activates it
without any ribbon interaction. For local development:

```bash
npm run excel:sideload
```

starts the dev server, registers a `localhost` manifest, restarts Excel when needed, and
opens a sample workbook with the chart embedded next to its data. Plain `http://localhost`
works in Excel for Mac without a certificate. The page also runs in a normal browser in a
preview mode with sample data.

---

## Related

- [API reference](api.md)
- [Security](security.md)
- [UI testing](ui-testing.md)
- [Concept](concept.md)
- [Visual design](visual-design.md)
