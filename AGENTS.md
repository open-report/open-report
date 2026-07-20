# open-report — Framework Repo Guide

You are working on the **open-report framework** — the runtime, CLI, and tooling that ship to npm.

(Report-authoring guidance lives in the `report-authoring` / `create-report` skills under `packages/core/skills/`. Use those only when editing files inside `apps/demo/reports/`.)

## Layout

pnpm + Turbo monorepo.

| Path | Package | Role |
| --- | --- | --- |
| `packages/core` | `@open-report/core` | Runtime (paged preview, reading mode), Vite plugin, `open-report` dev/export CLI. |
| `packages/cli` | `@open-report/cli` | `npx @open-report/cli init` scaffolder + project template. |
| `apps/demo` | private | Local consumer of `@open-report/core` via `workspace:*`. Dogfood target. |

Shared config: `biome.json`, `turbo.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`.

## Workflow

```bash
pnpm dev          # turbo: runs demo against local core
pnpm build        # build all packages
pnpm typecheck    # tsc across the graph
pnpm check        # biome (format + lint + organize imports)
pnpm check:fix    # auto-fix what biome can
pnpm test         # vitest
```

Filter to one package: `pnpm core <script>` / `pnpm cli <script>`.

## Hard rules

- **Biome must pass before commit.** Run `pnpm check` (or `pnpm check:fix`).
- **If `packages/core` or `packages/cli` changes, add a changeset.** `patch` for fixes, `minor` for new public API, `major` for breaking. Apps and root tooling do not need one.
- **Changeset descriptions: one line, present-tense, user-perspective.** No paragraphs, no rationale.
- Don't bump versions or edit `CHANGELOG.md` by hand — `changeset version` owns that.
- **Don't add dependencies casually.** The `core` runtime ships to users; every dep inflates install size.
- **Default to writing no comments.** Only add one when the WHY is non-obvious. Don't explain WHAT the code does, don't write section-divider banners, don't leave commented-out code.
- **The agent never paginates or numbers anything by hand** — pagination, section/figure numbering, TOC, and citation formatting are framework responsibilities. If you find yourself writing manual numbers in a report, stop and fix the framework instead.

## Core design invariants

- Report entry is `reports/<kebab-case-id>/index.mdx` — a single MDX file plus `assets/` and `references.bib`. No sibling modules.
- Front-matter is parsed statically (never evaluated).
- Agent writes flow; Paged.js turns flow into pages. Unbreakable blocks (`<Figure>`, `<Table>`) must fit one page.
- The framework generates zero content. No LLM API calls anywhere in this codebase.

## Releasing (reference)

`pnpm release` builds `core` + `cli` and runs `changeset publish`. Triggered by the maintainer, not by agents.
