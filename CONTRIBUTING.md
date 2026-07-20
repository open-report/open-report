# Contributing to open-report

Thanks for your interest in improving open-report! This guide covers the workflow for contributing to the framework itself — the `@open-report/core` runtime, the `@open-report/cli` scaffolder, and the supporting demo.

If you're authoring a report inside a scaffolded project, you don't need this file — drive your report through your coding agent or edit `reports/<id>/index.mdx` directly. See the project's `CLAUDE.md`/`AGENTS.md` for the authoring rules.

## Ways to contribute

- **Report a bug** with a minimal reproduction — ideally the smallest `reports/<id>/index.mdx` (and `references.bib`) that shows the problem.
- **Propose a feature.** Describe the problem before the solution; check [`docs/product.md`](docs/product.md) first so we don't duplicate the roadmap.
- **Ask a question or share what you built** in [GitHub Discussions](https://github.com/open-report/open-report/discussions).
- **Send a pull request** — see below.

For non-trivial changes, please open an issue or discussion first so we can align on direction before you invest the time.

## Repo layout

pnpm + Turbo monorepo.

| Path | Package | Role |
| --- | --- | --- |
| [`packages/core`](packages/core) | `@open-report/core` | Runtime (paged A4 preview + export view), Vite plugin, `open-report` dev/export CLI. |
| [`packages/cli`](packages/cli) | `@open-report/cli` | `npx @open-report/cli init` scaffolder + project template. |
| [`apps/demo`](apps/demo) | private | Local consumer of `@open-report/core` via `workspace:*` — the dogfood target. |

## Prerequisites

- **Node.js 22+** (matches CI).
- **pnpm** — `corepack enable` picks up the version pinned in `package.json`.
- **Google Chrome / Chromium** installed locally — `open-report export` drives it (no bundled browser). Set `CHROME_PATH` if it's in a non-standard location.
- A Unix-y shell. Windows works via WSL.

## Getting set up

```bash
git clone https://github.com/open-report/open-report.git
cd open-report
pnpm install
pnpm dev          # runs apps/demo against the local @open-report/core
```

`apps/demo` is the fastest way to exercise framework changes — edit `packages/core`, the demo hot-reloads.

## Useful scripts

```bash
pnpm dev          # turbo: runs the demo against local core
pnpm build        # build all packages
pnpm typecheck    # tsc across the graph
pnpm check        # biome (format + lint + organize imports)
pnpm check:fix    # auto-fix what biome can
pnpm test         # vitest
```

Filter to one package:

```bash
pnpm core <script>   # e.g. pnpm core build
pnpm cli <script>
```

## Pull request workflow

1. **Fork & branch.** Branch off `main`. Keep branches focused — one logical change per PR.
2. **Make your change.** Match the surrounding style. Don't reformat unrelated code.
3. **Run the checks before pushing:**
   ```bash
   pnpm check       # must pass — CI enforces it
   pnpm typecheck
   pnpm test
   ```
   `pnpm check:fix` auto-fixes most formatting and lint issues.
4. **Add a changeset if you touched `packages/core` or `packages/cli`:**
   ```bash
   pnpm changeset
   ```
   Pick the affected package(s) and the right bump:
   - `patch` — bug fixes, internal refactors, polish.
   - `minor` — new public API, additive features.
   - `major` — breaking changes.

   `apps/demo` and root tooling do **not** need a changeset.

   Keep the description **short and direct** — one line, present-tense, what changed from a user's perspective. Match the tone of existing `.changeset/*.md` files. Don't bump versions or edit `CHANGELOG.md` by hand — `changeset version` owns that.
5. **Open the PR.** Describe the problem, the change, and how you tested it. For rendering or layout changes, verify in `apps/demo` and — where it helps — attach a page screenshot or the exported PDF.
6. **Address review feedback** with follow-up commits. We squash on merge.

## Style & conventions

- **Biome must pass.** Formatting, lint, and import organisation are all enforced by `pnpm check`.
- **`core` ships to users — guard the dependency list.** Every runtime dep inflates install size for every report project. Prefer a small piece of inline code over a new package, and justify any addition in the PR.
- **Numbering, pagination, and citation formatting belong to the framework, never the author.** Reports must not be able to hand-number anything; keep that invariant when changing the render pipeline.
- **Vendored CSL styles/locales in `packages/core/styles` are verbatim upstream copies.** Don't hand-edit them — re-vendor per `styles/README.md`.
- **Default to writing no comments.** Add one only when the *why* is non-obvious — a hidden constraint or a workaround for a specific bug. Don't explain *what* the code does.

## Testing

- Unit tests run via `pnpm test` (Vitest). The BibTeX parser, the citeproc engine, and the front-matter parser are the primary test targets — add tests next to the code (`*.test.ts`) when fixing a bug or adding logic there.
- For render/layout/export changes, verify in `apps/demo` (both `apa` and `gb7714`) and describe what you exercised in the PR.

## Releases

Releases are cut by the maintainer — merging changesets to `main` opens a "release packages" PR (via the Release workflow); merging that publishes `@open-report/core` + `@open-report/cli`. Contributors don't publish anything — just land the changeset alongside your code.

## Questions

Open a [discussion](https://github.com/open-report/open-report/discussions) — happy to help.
