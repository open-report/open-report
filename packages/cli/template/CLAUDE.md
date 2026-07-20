# open-report project — Claude Code Guide

Read `AGENTS.md` in this directory first — it contains the hard rules for authoring reports in this project.

Skills for this project live in `.claude/skills/`:

- **create-report** — drafting a new report end-to-end (scoping questions → outline → write).
- **report-authoring** — technical reference: file contract, components, citations, typography. Read before editing anything under `reports/<id>/`.

Preview with `pnpm dev`. Never number or paginate anything by hand — the framework owns pagination, numbering, TOC, and citation formatting.
