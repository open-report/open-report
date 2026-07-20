---
"@open-report/cli": patch
---

Bump the scaffold's `@open-report/core` dependency to `^0.1.1` so a new project always gets the version with the render fix. `^0.1.0` could resolve to the broken (and now unpublished) 0.1.0 from a stale pnpm cache under pnpm 11's minimum-release-age gate.
