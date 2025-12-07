# Dashboarding Monorepo (TypeScript)

Headless dashboard engine with perfect tiling, pluggable constraints, and optional UI wrappers.

- Core: `@pebbledash/core` (no DOM)
- Optional UI: `@pebbledash/renderer-dom`, `@pebbledash/web-component`, `@pebbledash/react`
- Optional devtools: `@pebbledash/devtools`

## Quick start

- Install deps: `pnpm -w install`
- Build packages: `pnpm -w -r build`
- Run tests: `pnpm -w test`
- Start web demo (after build): `pnpm --filter @pebbledash/app-demo run dev`
- Fast demo with live source (skips prebuild): `pnpm demo:fast`
- Generate docs: `pnpm docs:decision-tree`

## Core usage

```ts
import { DashboardModel } from '@pebbledash/core';

const model = new DashboardModel({ minTile: { width: 5, height: 5 } });
await model.initialize();
const first = model.getState().toArray()[0];
await model.splitTile(first.id, { orientation: 'vertical', ratio: 0.5 });
```

See `packages/*/README.md` and `docs/architecture.md` for deeper details.
