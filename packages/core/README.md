# @pebbledash/core

Headless dashboard engine (no DOM) with perfect tiling.

## Install

Workspace usage in this monorepo. For external projects:

```bash
pnpm add @pebbledash/core
```

## Quick start

```ts
import { DashboardModel } from '@pebbledash/core';

const model = new DashboardModel({ minTile: { width: 5, height: 5 } });
await model.initialize();
const first = model.getState().toArray()[0];
await model.splitTile(first.id, { orientation: 'vertical', ratio: 0.5 });
```

## Extending constraints

```ts
import { GraphRegistry, ConditionNode } from '@pebbledash/core';

// Add a custom condition
const PositiveRatio = new ConditionNode(
  'PositiveRatio',
  (ctx) => (ctx as any).params.ratio > 0,
  () => ({ code: 'NonPositiveRatio', message: 'ratio must be > 0' }),
);

const constraints = new GraphRegistry();
// ... register graphs using PositiveRatio
```

## Deletion semantics

- Strategy-driven, hole-free compaction via seam collapse (vertical or horizontal).
- Pre-checks: `TileExists`, `NotLocked`, `NotOnlyTile`, group policy, full-span coverage, unlocked neighbors.
- Validation: `BoundsValid` + `CoverageTight` ensure no overlaps and no gaps.
- Group policy: fill from within the same group when group size > 1; when deleting the last member, the group is removed and cross-group fill is allowed.

Optional config:

```ts
const model = new DashboardModel({
  // epsilon used in geometry checks and CoverageTight
  epsilon: 1e-6,
  // Strategy can be extended/overridden via StrategyRegistry
});
```

## Persistence

```ts
import { PersistenceManager, MemoryAdapter } from '@pebbledash/core';
const pm = new PersistenceManager(new MemoryAdapter());
await pm.save('layout-1', model.createSnapshot());
const snapshot = await pm.load('layout-1');
```
