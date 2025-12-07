import { describe, bench, beforeEach } from 'vitest';
import { DashboardModel, Tile, DashboardState, type TileId } from '@pebbledash/core';

/**
 * Performance benchmarks for large dashboard states (100+ tiles)
 *
 * Run with: pnpm vitest bench tests/performance/
 */

function generateGridTiles(rows: number, cols: number): Tile[] {
  const tiles: Tile[] = [];
  const tileWidth = 100 / cols;
  const tileHeight = 100 / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      tiles.push(
        new Tile({
          id: `tile-${r}-${c}` as TileId,
          x: c * tileWidth,
          y: r * tileHeight,
          width: tileWidth,
          height: tileHeight,
        }),
      );
    }
  }
  return tiles;
}

describe('Large Dashboard Performance', () => {
  describe('State Creation', () => {
    bench('create 100 tile state (10x10 grid)', async () => {
      const tiles = generateGridTiles(10, 10);
      new DashboardState({ tiles });
    });

    bench('create 225 tile state (15x15 grid)', async () => {
      const tiles = generateGridTiles(15, 15);
      new DashboardState({ tiles });
    });

    bench('create 400 tile state (20x20 grid)', async () => {
      const tiles = generateGridTiles(20, 20);
      new DashboardState({ tiles });
    });
  });

  describe('Model Initialization', () => {
    bench('initialize model with 100 tiles', async () => {
      const model = new DashboardModel({ minTile: { width: 1, height: 1 } });
      const tiles = generateGridTiles(10, 10);
      await model.initialize({
        layout: {
          tiles: tiles.map((t) => ({ id: t.id, x: t.x, y: t.y, width: t.width, height: t.height })),
        },
      });
    });

    bench('initialize model with 225 tiles', async () => {
      const model = new DashboardModel({ minTile: { width: 1, height: 1 } });
      const tiles = generateGridTiles(15, 15);
      await model.initialize({
        layout: {
          tiles: tiles.map((t) => ({ id: t.id, x: t.x, y: t.y, width: t.width, height: t.height })),
        },
      });
    });
  });

  describe('Operations on Large State', () => {
    let model100: DashboardModel;
    let model225: DashboardModel;

    beforeEach(async () => {
      // Setup 100 tile model
      model100 = new DashboardModel({ minTile: { width: 1, height: 1 } });
      const tiles100 = generateGridTiles(10, 10);
      await model100.initialize({
        layout: {
          tiles: tiles100.map((t) => ({
            id: t.id,
            x: t.x,
            y: t.y,
            width: t.width,
            height: t.height,
          })),
        },
      });

      // Setup 225 tile model
      model225 = new DashboardModel({ minTile: { width: 1, height: 1 } });
      const tiles225 = generateGridTiles(15, 15);
      await model225.initialize({
        layout: {
          tiles: tiles225.map((t) => ({
            id: t.id,
            x: t.x,
            y: t.y,
            width: t.width,
            height: t.height,
          })),
        },
      });
    });

    bench('clampResize on 100 tile grid', () => {
      model100.clampResize('tile-5-5' as TileId, { edge: 'right', delta: 1 });
    });

    bench('clampResize on 225 tile grid', () => {
      model225.clampResize('tile-7-7' as TileId, { edge: 'right', delta: 1 });
    });

    bench('getState().toArray() on 100 tiles', () => {
      model100.getState().toArray();
    });

    bench('getState().toArray() on 225 tiles', () => {
      model225.getState().toArray();
    });

    bench('createSnapshot on 100 tiles', () => {
      model100.createSnapshot();
    });

    bench('createSnapshot on 225 tiles', () => {
      model225.createSnapshot();
    });
  });

  describe('Resize Operations', () => {
    let model: DashboardModel;

    beforeEach(async () => {
      model = new DashboardModel({ minTile: { width: 1, height: 1 } });
      const tiles = generateGridTiles(10, 10);
      await model.initialize({
        layout: {
          tiles: tiles.map((t) => ({ id: t.id, x: t.x, y: t.y, width: t.width, height: t.height })),
        },
      });
    });

    bench('resizeTile on 100 tile grid', async () => {
      // Reset state before each resize to avoid accumulation
      const tiles = generateGridTiles(10, 10);
      await model.initialize({
        layout: {
          tiles: tiles.map((t) => ({ id: t.id, x: t.x, y: t.y, width: t.width, height: t.height })),
        },
      });
      await model.resizeTile('tile-5-5' as TileId, { edge: 'right', delta: 0.5 });
    });
  });

  describe('Delete Operations', () => {
    bench('deleteTile on fresh 100 tile grid', async () => {
      const model = new DashboardModel({ minTile: { width: 1, height: 1 } });
      const tiles = generateGridTiles(10, 10);
      await model.initialize({
        layout: {
          tiles: tiles.map((t) => ({ id: t.id, x: t.x, y: t.y, width: t.width, height: t.height })),
        },
      });
      await model.deleteTile('tile-5-5' as TileId);
    });
  });

  describe('Memory and Seams', () => {
    bench('seam computation for 100 tiles', async () => {
      const tiles = generateGridTiles(10, 10);
      const state = new DashboardState({ tiles });
      // Access seams to trigger computation
      void state.seams.size;
    });

    bench('seam computation for 225 tiles', async () => {
      const tiles = generateGridTiles(15, 15);
      const state = new DashboardState({ tiles });
      void state.seams.size;
    });
  });
});

describe('Stress Tests', () => {
  bench('rapid resize operations (50 iterations)', async () => {
    const model = new DashboardModel({ minTile: { width: 5, height: 5 } });
    await model.initialize();
    await model.splitTile('tile-0' as TileId, { orientation: 'vertical' });

    const tiles = model.getState().toArray();
    const tileId = tiles[0].id;

    for (let i = 0; i < 50; i++) {
      const delta = i % 2 === 0 ? 1 : -1;
      model.clampResize(tileId, { edge: 'right', delta });
    }
  });

  bench('rapid split operations (20 iterations)', async () => {
    const model = new DashboardModel({ minTile: { width: 2, height: 2 } });
    await model.initialize();

    for (let i = 0; i < 20; i++) {
      const tiles = model.getState().toArray();
      if (tiles.length > 0) {
        const tile = tiles[Math.floor(Math.random() * tiles.length)];
        const orientation = i % 2 === 0 ? 'vertical' : 'horizontal';
        try {
          await model.splitTile(tile.id, { orientation });
        } catch {
          // May fail if tile too small, that's ok
        }
      }
    }
  });
});
