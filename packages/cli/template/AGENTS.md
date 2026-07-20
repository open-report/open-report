# open-report — Agent Guide

You are authoring **reports** in this repo. Every report is MDX prose plus open-report components.

## Hard rules

- Put your report under `reports/<kebab-case-id>/`.
- The entry is `reports/<id>/index.mdx`. Bibliography is `reports/<id>/references.bib`. Images go under `reports/<id>/assets/`.
- Do **not** touch `package.json`, `open-report.config.ts`, or other reports.
- Do not add dependencies. Use only markdown, `@open-report/core` components, and standard web APIs.
- **Never number anything by hand.** Sections, figures, tables, citations, TOC, and page numbers are framework responsibilities. Write `<Cite id="..." />` and `<Ref to="..." />`; the framework renders the numbers.
- **Never paginate by hand.** Write flowing content; the framework breaks pages. Wrap unbreakable content in `<Figure>` / `<Table>`.

## Which skill to use

- **Drafting a new report** — use the `create-report` skill. It walks through scoping questions (report type, citation style, length, language), plans the section structure, and hands off.
- **Any other report edit** — read the `report-authoring` skill before writing. It is the technical reference for everything inside `reports/<id>/`: file contract, print type scale, citation usage, figure/table rules, CJK typography, and anti-patterns.

Keep this file short: hard rules only. All deeper guidance lives in the skills above.
