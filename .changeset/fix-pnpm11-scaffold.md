---
"@open-report/cli": patch
---

Fix the scaffolded project failing on pnpm 11+. pnpm 11 blocks dependency build scripts by default and exits non-zero (`ERR_PNPM_IGNORED_BUILDS`) — open-report's tree pulls transitive deps with postinstall scripts (core-js, es5-ext via pagedjs) — and it no longer reads the `pnpm` field in `package.json`. The template now ships a `pnpm-workspace.yaml` (`strictDepBuilds: false`, `verifyDepsBeforeRun: false`) and drops the ignored `pnpm` field, so `pnpm install`, `pnpm dev`, and `pnpm run export` work out of the box.
