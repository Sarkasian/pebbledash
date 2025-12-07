# Strategy Extension Guide

This guide explains how to create custom strategies for resize, split, and delete operations in the dashboarding library.

## Overview

The dashboarding library uses a strategy pattern for core operations. This allows you to customize how tiles are resized, split, and deleted without modifying the core library code.

## Strategy Types

### 1. Resize Strategy

Controls how tiles are resized when dragging seam edges.

```typescript
interface ResizeStrategy {
  key: string;
  compute(
    state: DashboardState,
    tileId: TileId,
    edge: 'left' | 'right' | 'top' | 'bottom',
    delta: number,
    opts?: { minTile?: { width: number; height: number }; epsilon?: number },
  ): DashboardState;
}
```

### 2. Split Strategy

Controls how tiles are divided when splitting.

```typescript
interface SplitStrategy {
  key: string;
  compute(
    state: DashboardState,
    tileId: TileId,
    orientation: 'horizontal' | 'vertical',
    ratio?: number,
  ): DashboardState;
}
```

### 3. Delete Strategy

Controls how space is reclaimed when a tile is deleted.

```typescript
interface DeleteStrategy {
  key: string;
  choose(options: SeamOption[]): SeamOption | undefined;
}
```

## Creating Custom Strategies

### Custom Resize Strategy Example

Here's an example of a proportional resize strategy that distributes resize delta proportionally across affected tiles:

```typescript
import type { ResizeStrategy, DashboardState, TileId, Tile } from '@pebbledash/core';

const proportionalResize: ResizeStrategy = {
  key: 'proportional',
  compute(state, tileId, edge, delta, opts) {
    const tiles = state.toArray();
    const target = tiles.find((t) => t.id === tileId);
    if (!target) return state;

    const minW = opts?.minTile?.width ?? 5;
    const minH = opts?.minTile?.height ?? 5;
    const isVertical = edge === 'left' || edge === 'right';

    // Find affected neighbors
    const neighbors = findAffectedNeighbors(tiles, target, edge);
    if (neighbors.length === 0) return state;

    // Calculate proportional distribution
    const totalSize = neighbors.reduce((sum, n) => sum + (isVertical ? n.width : n.height), 0);

    // Apply proportional delta to each neighbor
    const updated = tiles.map((t) => {
      if (t.id === tileId) {
        return adjustTile(t, edge, delta, minW, minH);
      }
      const neighbor = neighbors.find((n) => n.id === t.id);
      if (neighbor) {
        const proportion = (isVertical ? neighbor.width : neighbor.height) / totalSize;
        const neighborDelta = -delta * proportion;
        return adjustNeighbor(t, edge, neighborDelta, minW, minH);
      }
      return t;
    });

    return new DashboardState({ tiles: updated });
  },
};

function findAffectedNeighbors(tiles: Tile[], target: Tile, edge: string): Tile[] {
  // Implementation to find tiles affected by the resize
  // ...
}

function adjustTile(tile: Tile, edge: string, delta: number, minW: number, minH: number): Tile {
  // Implementation to adjust the target tile
  // ...
}

function adjustNeighbor(tile: Tile, edge: string, delta: number, minW: number, minH: number): Tile {
  // Implementation to adjust neighbor tiles
  // ...
}
```

### Custom Split Strategy Example

A golden ratio split strategy:

```typescript
import type { SplitStrategy, DashboardState, TileId, Tile } from '@pebbledash/core';

const GOLDEN_RATIO = 0.618;

const goldenSplit: SplitStrategy = {
  key: 'golden',
  compute(state, tileId, orientation, _ratio) {
    const tiles = state.toArray();
    const target = tiles.find((t) => t.id === tileId);
    if (!target) return state;

    // Always use golden ratio
    const ratio = GOLDEN_RATIO;

    let tile1: Tile, tile2: Tile;

    if (orientation === 'vertical') {
      const splitWidth = target.width * ratio;
      tile1 = new Tile({
        id: target.id,
        x: target.x,
        y: target.y,
        width: splitWidth,
        height: target.height,
      });
      tile2 = new Tile({
        id: generateNewId(),
        x: target.x + splitWidth,
        y: target.y,
        width: target.width - splitWidth,
        height: target.height,
      });
    } else {
      const splitHeight = target.height * ratio;
      tile1 = new Tile({
        id: target.id,
        x: target.x,
        y: target.y,
        width: target.width,
        height: splitHeight,
      });
      tile2 = new Tile({
        id: generateNewId(),
        x: target.x,
        y: target.y + splitHeight,
        width: target.width,
        height: target.height - splitHeight,
      });
    }

    const updated = tiles.filter((t) => t.id !== tileId).concat([tile1, tile2]);
    return new DashboardState({ tiles: updated });
  },
};
```

### Custom Delete Strategy Example

A "prefer larger neighbor" delete strategy:

```typescript
import type { DeleteStrategy, SeamOption } from '@pebbledash/core';

const preferLarger: DeleteStrategy = {
  key: 'prefer-larger',
  choose(options) {
    if (options.length === 0) return undefined;

    // Find the option where neighbors have the largest combined area
    return options.reduce((best, current) => {
      const currentArea = current.neighbors.reduce((sum, n) => sum + n.width * n.height, 0);
      const bestArea = best.neighbors.reduce((sum, n) => sum + n.width * n.height, 0);
      return currentArea > bestArea ? current : best;
    }, options[0]);
  },
};
```

## Registering Custom Strategies

Register your strategies with the `StrategyRegistry`:

```typescript
import { DashboardModel, StrategyRegistry } from '@pebbledash/core';

const model = new DashboardModel();
await model.initialize();

// Access the strategy registry
const registry = model.strategies;

// Register custom strategies
registry.registerResize(proportionalResize);
registry.registerSplit(goldenSplit);
registry.registerDelete(preferLarger);

// Set as active
registry.setActiveResize('proportional');
registry.setActiveSplit('golden');
registry.setActiveDelete('prefer-larger');
```

## Default Strategies

The library includes these default strategies:

| Type   | Key         | Description                         |
| ------ | ----------- | ----------------------------------- |
| Resize | `linear`    | Linear distribution of resize delta |
| Split  | `equal`     | Equal 50/50 split                   |
| Delete | `heuristic` | Heuristic-based neighbor selection  |

## Best Practices

1. **Maintain perfect tiling**: Ensure your strategy preserves the total area (100x100)
2. **Respect minimum sizes**: Honor the `minTile` constraints
3. **Handle edge cases**: Account for tiles at container edges
4. **Immutability**: Always return new `DashboardState` and `Tile` instances
5. **Test thoroughly**: Cover various tile configurations and edge cases

## TypeScript Types

Import the necessary types for type safety:

```typescript
import type {
  ResizeStrategy,
  SplitStrategy,
  DeleteStrategy,
  DashboardState,
  TileId,
  Tile,
} from '@pebbledash/core';

import type { SeamOption } from '@pebbledash/core/internal';
```
