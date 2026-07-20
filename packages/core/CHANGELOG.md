# @open-report/core

## 0.1.0

### Minor Changes

- e41080b: Add citeproc citation engine (APA, GB/T 7714), real bibliography, cross-reference resolution, and generated table of contents.
- f880a05: Add `open-report export <report-id> [--format pdf|html] [--out <path>]`. Renders the paged report with headless system Chrome (via a new `puppeteer-core` dependency — no bundled browser; falls back to `CHROME_PATH`/`PUPPETEER_EXECUTABLE_PATH` and prints install guidance when none is found) and writes a print-accurate PDF or a single self-contained offline HTML file (inlined CSS and images). Adds a chrome-free `#/export/<id>` view and a `body[data-or-ready]` signal emitted once pagination and post-processing finish.
