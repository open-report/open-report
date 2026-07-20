# @open-report/core

## 0.1.1

### Patch Changes

- 086fdca: Fix reports not rendering in scaffolded (non-monorepo) projects. The preview app is served from core's `node_modules` via `/@fs`, so Vite's dependency scanner never saw it and left pagedjs's CJS transitive dependency (`event-emitter`) un-bundled, failing with "does not provide an export named 'default'" — nothing rendered and `export` timed out. The dev server now points `optimizeDeps.entries` at the app entry so those deps are pre-bundled with correct CJS→ESM interop.

## 0.1.0

### Minor Changes

- e41080b: Add citeproc citation engine (APA, GB/T 7714), real bibliography, cross-reference resolution, and generated table of contents.
- f880a05: Add `open-report export <report-id> [--format pdf|html] [--out <path>]`. Renders the paged report with headless system Chrome (via a new `puppeteer-core` dependency — no bundled browser; falls back to `CHROME_PATH`/`PUPPETEER_EXECUTABLE_PATH` and prints install guidance when none is found) and writes a print-accurate PDF or a single self-contained offline HTML file (inlined CSS and images). Adds a chrome-free `#/export/<id>` view and a `body[data-or-ready]` signal emitted once pagination and post-processing finish.
