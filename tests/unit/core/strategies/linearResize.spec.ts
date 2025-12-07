import { describe, it, expect } from 'vitest';
import {
  DashboardModel,
  DashboardState,
  Tile,
  type TileId,
} from '../../../../packages/core/src/index';
import { LinearResizeStrategy } from '../../../../packages/core/src/strategies/resize/LinearResizeStrategy';

const id = (s: string) => s as TileId;

function createTile(tileId: string, x: number, y: number, width: number, height: number): Tile {
  return new Tile({ id: id(tileId), x, y, width, height });
}

function createState(tiles: Tile[]): DashboardState {
  return new DashboardState({ tiles });
}

describe('LinearResizeStrategy', () => {
  describe('key property', () => {
    it('has key "linear"', () => {
      const strategy = new LinearResizeStrategy();
      expect(strategy.key).toBe('linear');
    });
  });

  describe('computeSeamRange', () => {
    it('returns zero range when seamId cannot be resolved', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([createTile('t1', 0, 0, 100, 100)]);

      // Single tile has no neighbors, so edge seam doesn't exist
      const result = strategy.computeSeamRange(state, id('t1'), 'right');

      expect(result.min).toBe(0);
      expect(result.max).toBe(0);
      // Note: chainCovered can be true even with zero range
    });

    it('returns valid range for vertical seam between tiles', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      const result = strategy.computeSeamRange(state, id('t1'), 'right', {
        minTile: { width: 10, height: 10 },
      });

      // Should have a valid range
      expect(result.max).toBeGreaterThan(result.min);
      expect(result.chainCovered).toBe(true);
    });

    it('returns valid range for horizontal seam between tiles', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 100, 50),
        createTile('t2', 0, 50, 100, 50),
      ]);

      const result = strategy.computeSeamRange(state, id('t1'), 'bottom', {
        minTile: { width: 10, height: 10 },
      });

      expect(result.max).toBeGreaterThan(result.min);
      expect(result.chainCovered).toBe(true);
    });

    it('respects minTile constraints', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      const result = strategy.computeSeamRange(state, id('t1'), 'right', {
        minTile: { width: 20, height: 10 },
      });

      // Range should be limited by minTile constraints
      // t1 can shrink to 20 width (-30 from 50)
      // t2 can shrink to 20 width, so t1 can expand by 30
      expect(result.min).toBeGreaterThanOrEqual(-30);
      expect(result.max).toBeLessThanOrEqual(30);
    });

    it('uses default epsilon when not provided', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      // No opts provided - should use defaults
      const result = strategy.computeSeamRange(state, id('t1'), 'right');

      // Should still work
      expect(typeof result.min).toBe('number');
      expect(typeof result.max).toBe('number');
    });

    it('handles left edge', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      const result = strategy.computeSeamRange(state, id('t2'), 'left', {
        minTile: { width: 10, height: 10 },
      });

      expect(result.max).toBeGreaterThan(result.min);
    });

    it('handles top edge', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 100, 50),
        createTile('t2', 0, 50, 100, 50),
      ]);

      const result = strategy.computeSeamRange(state, id('t2'), 'top', {
        minTile: { width: 10, height: 10 },
      });

      expect(result.max).toBeGreaterThan(result.min);
    });
  });

  describe('clampSeamDelta', () => {
    it('returns zero clamp when seamId cannot be resolved', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([createTile('t1', 0, 0, 100, 100)]);

      const result = strategy.clampSeamDelta(state, id('t1'), 'right', 10);

      expect(result.clampedDelta).toBe(0);
      expect(result.min).toBe(0);
      expect(result.max).toBe(0);
      // Note: chainCovered is implementation-specific
    });

    it('clamps delta within valid range', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      // Request a massive delta
      const result = strategy.clampSeamDelta(state, id('t1'), 'right', 100, {
        minTile: { width: 10, height: 10 },
      });

      // Should be clamped to max allowable
      expect(result.clampedDelta).toBeLessThanOrEqual(result.max);
      expect(result.clampedDelta).toBeGreaterThanOrEqual(result.min);
    });

    it('clamps negative delta within valid range', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      // Request a massive negative delta
      const result = strategy.clampSeamDelta(state, id('t1'), 'right', -100, {
        minTile: { width: 10, height: 10 },
      });

      expect(result.clampedDelta).toBeLessThanOrEqual(result.max);
      expect(result.clampedDelta).toBeGreaterThanOrEqual(result.min);
    });

    it('returns exact delta when within range', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      // Request a small delta that should be within range
      const result = strategy.clampSeamDelta(state, id('t1'), 'right', 5, {
        minTile: { width: 10, height: 10 },
      });

      expect(result.clampedDelta).toBe(5);
    });

    it('uses custom epsilon', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      const result = strategy.clampSeamDelta(state, id('t1'), 'right', 5, {
        minTile: { width: 10, height: 10 },
        epsilon: 0.001,
      });

      expect(typeof result.clampedDelta).toBe('number');
    });
  });

  describe('compute', () => {
    it('returns same state when seamId cannot be resolved', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([createTile('t1', 0, 0, 100, 100)]);

      const result = strategy.compute(state, id('t1'), 'right', 10);

      expect(result).toBe(state);
    });

    it('returns same state when clamped delta is zero (within epsilon)', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      // Request a tiny delta that's within epsilon
      const result = strategy.compute(state, id('t1'), 'right', 1e-9, {
        minTile: { width: 10, height: 10 },
        epsilon: 1e-6,
      });

      expect(result).toBe(state);
    });

    it('applies valid resize delta to tiles', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      const result = strategy.compute(state, id('t1'), 'right', 10, {
        minTile: { width: 10, height: 10 },
      });

      const t1 = result.tiles.get(id('t1'));
      const t2 = result.tiles.get(id('t2'));

      expect(t1?.width).toBe(60);
      expect(t2?.width).toBe(40);
      expect(t2?.x).toBe(60);
    });

    it('applies negative resize delta', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      const result = strategy.compute(state, id('t1'), 'right', -10, {
        minTile: { width: 10, height: 10 },
      });

      const t1 = result.tiles.get(id('t1'));
      const t2 = result.tiles.get(id('t2'));

      expect(t1?.width).toBe(40);
      expect(t2?.width).toBe(60);
    });

    it('clamps excessive delta before applying', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      // Request a delta that would make t2 too small
      const result = strategy.compute(state, id('t1'), 'right', 45, {
        minTile: { width: 10, height: 10 },
      });

      const t2 = result.tiles.get(id('t2'));

      // t2 should not be smaller than minTile
      expect(t2?.width).toBeGreaterThanOrEqual(10);
    });

    it('handles horizontal seam resize', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 100, 50),
        createTile('t2', 0, 50, 100, 50),
      ]);

      const result = strategy.compute(state, id('t1'), 'bottom', 10, {
        minTile: { width: 10, height: 10 },
      });

      const t1 = result.tiles.get(id('t1'));
      const t2 = result.tiles.get(id('t2'));

      expect(t1?.height).toBe(60);
      expect(t2?.height).toBe(40);
    });

    it('uses default epsilon when not provided', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      // No opts - should use defaults
      const result = strategy.compute(state, id('t1'), 'right', 10);

      expect(result).not.toBe(state);
    });

    it('handles left edge resize', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      // Resize t2's left edge (same seam as t1's right)
      const result = strategy.compute(state, id('t2'), 'left', -10, {
        minTile: { width: 10, height: 10 },
      });

      const t1 = result.tiles.get(id('t1'));
      const t2 = result.tiles.get(id('t2'));

      expect(t1?.width).toBe(40);
      expect(t2?.width).toBe(60);
    });

    it('handles top edge resize', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 100, 50),
        createTile('t2', 0, 50, 100, 50),
      ]);

      // Resize t2's top edge
      const result = strategy.compute(state, id('t2'), 'top', -10, {
        minTile: { width: 10, height: 10 },
      });

      const t1 = result.tiles.get(id('t1'));
      const t2 = result.tiles.get(id('t2'));

      expect(t1?.height).toBe(40);
      expect(t2?.height).toBe(60);
    });
  });

  describe('integration with DashboardModel', () => {
    it('is registered as the default resize strategy', async () => {
      const model = new DashboardModel();
      await model.initialize();

      const strategy = model.strategies.getResize();

      expect(strategy).toBeInstanceOf(LinearResizeStrategy);
    });

    it('works through model.resizeTile', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      // Split into two tiles
      const tile = model.getState().toArray()[0];
      await model.splitTile(tile.id, { orientation: 'vertical', ratio: 0.5 });

      const [left] = model
        .getState()
        .toArray()
        .sort((a, b) => a.x - b.x);

      // Resize through model
      const result = await model.resizeTile(left.id, { edge: 'right', delta: 10 });

      expect(result.valid).toBe(true);

      const leftAfter = model.getState().tiles.get(left.id);
      expect(leftAfter?.width).toBe(60);
    });

    it('works with clampResize', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      const tile = model.getState().toArray()[0];
      await model.splitTile(tile.id, { orientation: 'vertical', ratio: 0.5 });

      const [left] = model
        .getState()
        .toArray()
        .sort((a, b) => a.x - b.x);

      const clamp = model.clampResize(left.id, { edge: 'right', delta: 100 });

      expect(clamp.clampedDelta).toBeLessThan(100);
      expect(clamp.chainCovered).toBe(true);
    });
  });

  describe('complex layouts', () => {
    it('handles 2x2 grid resize', () => {
      const strategy = new LinearResizeStrategy();
      const state = createState([
        createTile('t1', 0, 0, 50, 50),
        createTile('t2', 50, 0, 50, 50),
        createTile('t3', 0, 50, 50, 50),
        createTile('t4', 50, 50, 50, 50),
      ]);

      // Resize vertical seam
      const result = strategy.compute(state, id('t1'), 'right', 10, {
        minTile: { width: 10, height: 10 },
      });

      // Both left tiles should grow
      expect(result.tiles.get(id('t1'))?.width).toBe(60);
      expect(result.tiles.get(id('t3'))?.width).toBe(60);

      // Both right tiles should shrink
      expect(result.tiles.get(id('t2'))?.width).toBe(40);
      expect(result.tiles.get(id('t4'))?.width).toBe(40);
    });

    it('handles L-shaped layout', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      // Create L-shape: split vertically, then split right half horizontally
      const tile = model.getState().toArray()[0];
      await model.splitTile(tile.id, { orientation: 'vertical', ratio: 0.5 });

      const [, right] = model
        .getState()
        .toArray()
        .sort((a, b) => a.x - b.x);
      await model.splitTile(right.id, { orientation: 'horizontal', ratio: 0.5 });

      const state = model.getState();
      expect(state.toArray()).toHaveLength(3);

      // Test resize on the shared seam
      const [left] = state.toArray().sort((a, b) => a.x - b.x);
      const result = await model.resizeTile(left.id, { edge: 'right', delta: 10 });

      expect(result.valid).toBe(true);
    });
  });
});
