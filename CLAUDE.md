# open-report — Claude Code Guide

Read `AGENTS.md` in this directory first — it is the source of truth for working on this repo (layout, workflow commands, hard rules, design invariants). Everything there applies to you.

Quick reference:

```bash
pnpm dev          # run demo against local core
pnpm build        # build all packages
pnpm typecheck    # tsc across the graph
pnpm check        # biome — must pass before commit
pnpm check:fix    # auto-fix
pnpm test         # vitest
```

- Changes to `packages/core` or `packages/cli` require a changeset (`pnpm changeset`, one-line description).
- Report-authoring rules (for files under `apps/demo/reports/`) live in `packages/core/skills/report-authoring/SKILL.md`; the drafting workflow is `packages/core/skills/create-report/SKILL.md`. Copies for Claude Code are in `.claude/skills/` of the demo app.
- The framework generates zero content: never add LLM API calls to this codebase.
