# open-report

**The report framework built for agents.** Describe your report in natural language — your coding agent writes the MDX. open-report handles pagination, citations, numbering, table of contents, and export to PDF so the agent can focus on content.

Reports flow. You write content; the framework turns it into properly paginated A4/Letter pages with headers, footers, page numbers, auto-numbered sections and figures, and correctly formatted citations (APA, MLA, Chicago, GB/T 7714).

```bash
npx @open-report/cli init my-report
```

## Why open-report

Reports are structured prose. Agents are great at writing prose — and terrible at fighting Word margins, LaTeX preambles, and broken citation numbering. open-report is the missing runtime that turns "write my ML course report" into a submission-ready PDF, without you ever leaving the chat.

## Highlights

- 🤖 **Agent-native authoring** — ships with skills (`create-report`, `report-authoring`) so any coding agent (Claude Code, Codex, Cursor, …) writes correct reports on the first try.
- 📄 **Real pagination** — live A4/Letter preview with margins, running headers, and page numbers. The agent writes flow; the framework manages pages.
- 🔢 **Everything auto-numbered** — sections, figures, tables, equations, cross-references, and the table of contents never go out of sync.
- 📚 **Citations that just work** — drop a `references.bib`, cite with `<Cite id="..." />`, pick APA / MLA / Chicago / GB/T 7714.
- 🈶 **CJK typography done right** — first-line indent, punctuation rules, mixed CJK/Latin spacing, out of the box.
- 📦 **Export** — print-ready PDF and self-contained static HTML. (docx export on the roadmap.)

## Monorepo

| Path | Package | Role |
| --- | --- | --- |
| `packages/core` | `@open-report/core` | Runtime (paged preview, reading mode), Vite plugin, `open-report` dev/export CLI. |
| `packages/cli` | `@open-report/cli` | `npx @open-report/cli init` scaffolder + project template. |
| `apps/demo` | private | Dogfood target — example reports exercising the framework. |

## Status

Early development — pre-0.1. Design doc: [`docs/design.md`](./docs/design.md).

## License

MIT
