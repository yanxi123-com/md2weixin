# Monorepo Migration Plan (Archived)

> Status: Completed  
> Completed on: 2026-02-12  
> This document is kept as a historical migration record and is no longer an active task list.

## Goal

Host API service and browser editor in one monorepo with a shared core renderer.

## Target layout

```txt
apps/
  api/
  web/
packages/
  core/
  cli/
```

## Stages

1. Add workspace skeleton and shared base configs.
   - Status: done.
2. Extract common option/types contracts to `packages/core`.
   - Status: done (`normalizeRenderOptions` and shared option types are in core).
3. Move rendering pipeline (`renderer`, `highlight`, `furigana`) into `packages/core`.
   - Status: done (renderer/highlight/furigana are in core; browser and node run core-owned runtime helpers).
4. Make API and CLI depend on `md2weixin-core`.
   - Status: done (API and `packages/cli` now call `getHtml` from core).
5. Migrate browser app to call the same core logic.
   - Status: done (`apps/web` now consumes core-built `wx-renderer.js` and uses core-exposed render/prettify helpers).
6. Remove duplicated assets/styles after output parity is verified.
   - Status: done (web-side duplicated `FuriganaMD` and duplicated core renderer/css/prettify/juice source files are removed; these assets are now synced from core).

## Parity check rule

Use the same markdown input and compare generated HTML from:

- API
- CLI
- Browser app export

Differences must be intentional and documented.
