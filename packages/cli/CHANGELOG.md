# @open-report/cli

## 0.1.4

### Patch Changes

- 4703b70: Bump the scaffold's `@open-report/core` dependency to `^0.1.1` so a new project always gets the version with the render fix. `^0.1.0` could resolve to the broken (and now unpublished) 0.1.0 from a stale pnpm cache under pnpm 11's minimum-release-age gate.

## 0.1.3

### Patch Changes

- 086fdca: Fix the scaffolded project failing on pnpm 11+. pnpm 11 blocks dependency build scripts by default and exits non-zero (`ERR_PNPM_IGNORED_BUILDS`) — open-report's tree pulls transitive deps with postinstall scripts (core-js, es5-ext via pagedjs) — and it no longer reads the `pnpm` field in `package.json`. The template now ships a `pnpm-workspace.yaml` (`strictDepBuilds: false`, `verifyDepsBeforeRun: false`) and drops the ignored `pnpm` field, so `pnpm install`, `pnpm dev`, and `pnpm run export` work out of the box.

## 0.1.2

### Patch Changes

- Fix `pnpm dev` failing on pnpm v10 due to unapproved build scripts.

## 0.1.1

### Patch Changes

- Fix `init` with absolute paths and nested directories.

## 0.1.0

### Minor Changes

- Ship project scaffolder with agent skills, CLAUDE.md, and AGENTS.md.
