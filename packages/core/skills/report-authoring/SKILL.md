---
name: report-authoring
description: Technical reference for writing or editing open-report documents — file contract, front-matter, components (Cover, Toc, Figure, Table, Cite, Ref, References), print typography, CJK rules, and anti-patterns. Consult this whenever you are about to write or modify any file under `reports/<id>/`, including from inside the `create-report` workflow, or for any ad-hoc report edit. Triggers on phrases like "edit the report", "fix the layout", "add a figure", "add a citation", "change the section", "how do reports work here".
---

# Authoring open-report documents

This skill is the **technical reference** for everything inside `reports/<id>/`. `create-report` owns the "draft a new report" workflow and delegates the *how* to this file.

## File contract

```
reports/<kebab-case-id>/
├── index.mdx        # the whole report — front-matter + MDX prose + components
├── references.bib   # BibTeX entries for everything you cite
└── assets/          # images referenced with relative paths (./assets/x.svg)
```

- One report = one `index.mdx`. No sibling `.tsx`/`.md` files, no extra folders.
- Do not touch `package.json`, `open-report.config.ts`, or other reports.
- Do not add dependencies. Markdown, open-report components, and standard web APIs only.

## Front-matter

```yaml
---
title: 機器學習期末報告        # required
author: 王小明                # optional
course: CS5087 機器學習       # optional — shown on the cover
citationStyle: apa            # apa | mla | chicago | gb7714
lang: zh-TW                   # controls typography and label language (圖/表 vs Figure/Table)
createdAt: 2026-07-20T00:00:00Z   # ISO string, set once at scaffold time
---
```

Flat `key: value` pairs only — the framework parses this statically, never evaluates it.

## The one rule that matters

**Never paginate or number anything by hand.** No "第 3 頁", no "圖 1", no manual page breaks, no hand-written TOC. Write flowing prose; the framework breaks pages, numbers sections/figures/tables via counters, and resolves references. If output looks wrong, fix structure — don't hardcode numbers.

## Components

| Component | Usage | Notes |
| --- | --- | --- |
| `<Cover />` | first line of the document | rendered from front-matter; occupies its own page |
| `<Toc />` | after cover | placeholder for now; auto-generated later |
| `# / ## / ###` | sections | auto-numbered 1 / 1.1 / 1.1.1 |
| `<Figure src="./assets/x.svg" caption="…" id="fig-x" />` | images | auto-numbered, never splits across pages; `id` enables `<Ref>` |
| `<Table caption="…" id="tab-x">…</Table>` | tables | put plain `<thead>/<tbody>` inside; auto-numbered |
| `<Cite id="lecun2015" />` | inline citation | `id` must exist in `references.bib` |
| `<Ref to="fig-x" />` | cross-reference | renders the target's number |
| `<References />` | last line | formatted bibliography of everything cited |

## Print typography (the framework enforces these — don't fight them)

Body 12pt / 1.7 line-height, justified. H1 16pt, H2 13pt. A4 with 25mm/20mm margins. Figures and tables are centered with 10pt captions.

For `lang: zh-*`: paragraphs get 2em first-line indent automatically; figure/table labels render as 圖/表; use full-width punctuation in prose(,。「」)and half-width inside code/numbers.

## Anti-patterns

- Manual numbering of anything (see the one rule).
- Tables wider than the text column — split or rotate the data instead.
- Images without `<Figure>` (raw `![]()` markdown images bypass numbering and break-inside protection).
- Citing sources not present in `references.bib`, or padding the bibliography with uncited entries.
- Inline HTML styling for layout (`<div style=…>`) — if a layout need recurs, it belongs in the framework, not the report.

## Self-review checklist

1. Front-matter complete, `citationStyle` and `lang` correct?
2. Every figure/table has `caption` + `id`; every `<Ref>` target exists?
3. Every `<Cite>` id exists in `references.bib`?
4. No manual numbers, no manual page breaks anywhere?
5. Prose reads as a coherent report (intro → body → conclusion), not bullet soup?
