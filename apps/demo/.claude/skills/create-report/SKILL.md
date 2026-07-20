---
name: create-report
description: End-to-end workflow for drafting a new open-report document from a topic or source material. Asks scoping questions, plans the section structure, then writes index.mdx and references.bib. Triggers on "write a report", "幫我寫報告", "course report", "lab report", "proposal", or any request to produce a new document under reports/.
---

# Creating a report

You own the workflow; `report-authoring` owns the technical rules. Read it before writing any file.

## 1. Scope (ask, then stop asking)

Ask the user these four questions in one message, then proceed without further check-ins:

1. **Type** — course report / lab or experiment report / literature review / business proposal?
2. **Citation style** — apa / mla / chicago / gb7714? (Default: apa; gb7714 for Chinese academic contexts.)
3. **Length** — rough page count or word budget?
4. **Language** — zh-TW / zh-CN / en / …? Any formatting requirements from the school or company?

If the user already supplied source material (notes, data, papers), read it before planning.

## 2. Plan

- Pick a short kebab-case id (`ml-final-report`, `q3-proposal`).
- Draft a section outline appropriate to the type (e.g. lab report: 緒論 → 方法 → 結果 → 討論 → 結論). Show it in one short message, then write.

## 3. Write

- Scaffold `reports/<id>/index.mdx` with complete front-matter (`createdAt`: run `node -e "console.log(new Date().toISOString())"` and paste the output — don't type a timestamp from memory).
- `<Cover />` and `<Toc />` first, `<References />` last.
- Write real prose — full paragraphs, not bullet lists. Cite as you write; add every cited entry to `references.bib` immediately.
- Figures the user hasn't provided: reference `./assets/<name>.svg` and create a simple placeholder SVG in `assets/`.

## 4. Hand off

Run the `report-authoring` self-review checklist, then tell the user: report id, section list, citation count, and that `pnpm dev` previews the paginated result.
