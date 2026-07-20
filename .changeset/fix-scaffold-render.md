---
"@open-report/core": patch
---

Fix reports not rendering in scaffolded (non-monorepo) projects. The preview app is served from core's `node_modules` via `/@fs`, so Vite's dependency scanner never saw it and left pagedjs's CJS transitive dependency (`event-emitter`) un-bundled, failing with "does not provide an export named 'default'" — nothing rendered and `export` timed out. The dev server now points `optimizeDeps.entries` at the app entry so those deps are pre-bundled with correct CJS→ESM interop.
