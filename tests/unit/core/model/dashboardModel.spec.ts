import { describe, it, expect, vi } from 'vitest';
import { DashboardModel, type TileId } from '../../../../packages/core/src/index';

function id(s: string): TileId {
  return s as TileId;
}

describe('DashboardModel', () => {
  describe('initialization', () => {
    it('creates with default config', async () => {
      const model = new DashboardModel();
      await model.initialize();

      expect(model.getState().tiles.size).toBe(1);
    });

    it('creates with custom config', async () => {
      const model = new DashboardModel({
        minTile: { width: 20, height: 20 },
      });
      await model.initialize();

      const config = model.getConfig();
      expect(config.minTile.width).toBe(20);
      expect(config.minTile.height).toBe(20);
    });

    it('creates with maxTiles config', async () => {
      const model = new DashboardModel({
        maxTiles: 5,
      });
      await model.initialize();

      const config = model.getConfig();
      expect(config.maxTiles).toBe(5);
    });

    it('creates with epsilon config', async () => {
      const model = new DashboardModel({
        epsilon: 0.001,
      });
      await model.initialize();

      const config = model.getConfig();
      expect(config.epsilon).toBe(0.001);
    });
  });

  describe('getState', () => {
    it('returns current dashboard state', async () => {
      const model = new DashboardModel();
      await model.initialize();

      const state = model.getState();

      expect(state).toBeDefined();
      expect(state.tiles).toBeDefined();
    });
  });

  describe('getConfig', () => {
    it('returns current config', async () => {
      const model = new DashboardModel({ minTile: { width: 15, height: 15 } });
      await model.initialize();

      const config = model.getConfig();

      expect(config.minTile.width).toBe(15);
    });
  });

  describe('splitTile', () => {
    it('splits a tile vertically', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      const tile = model.getState().toArray()[0];
      const result = await model.splitTile(tile.id, { orientation: 'vertical', ratio: 0.5 });

      expect(result.valid).toBe(true);
      expect(model.getState().tiles.size).toBe(2);
    });

    it('splits a tile horizontally', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      const tile = model.getState().toArray()[0];
      const result = await model.splitTile(tile.id, { orientation: 'horizontal', ratio: 0.5 });

      expect(result.valid).toBe(true);
      expect(model.getState().tiles.size).toBe(2);
    });

    it('splits with custom ratio', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      const tile = model.getState().toArray()[0];
      await model.splitTile(tile.id, { orientation: 'vertical', ratio: 0.3 });

      const tiles = model
        .getState()
        .toArray()
        .sort((a, b) => a.x - b.x);
      expect(tiles[0].width).toBeCloseTo(30, 1);
      expect(tiles[1].width).toBeCloseTo(70, 1);
    });

    it('returns invalid for nonexistent tile', async () => {
      const model = new DashboardModel();
      await model.initialize();

      const result = await model.splitTile(id('nonexistent'), { orientation: 'vertical' });

      expect(result.valid).toBe(false);
    });
  });

  describe('deleteTile', () => {
    it('deletes a tile and redistributes space', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      const tile = model.getState().toArray()[0];
      await model.splitTile(tile.id, { orientation: 'vertical' });

      const tiles = model.getState().toArray();
      const tileToDelete = tiles[0];
      const result = await model.deleteTile(tileToDelete.id);

      expect(result.valid).toBe(true);
      expect(model.getState().tiles.size).toBe(1);
    });

    it('cannot delete the last tile', async () => {
      const model = new DashboardModel();
      await model.initialize();

      const tile = model.getState().toArray()[0];
      const result = await model.deleteTile(tile.id);

      expect(result.valid).toBe(false);
    });
  });

  describe('resizeTile', () => {
    it('resizes a tile edge', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      const tile = model.getState().toArray()[0];
      await model.splitTile(tile.id, { orientation: 'vertical', ratio: 0.5 });

      const [left] = model
        .getState()
        .toArray()
        .sort((a, b) => a.x - b.x);

      const result = await model.resizeTile(left.id, { edge: 'right', delta: 10 });

      expect(result.valid).toBe(true);
      const leftAfter = model.getState().tiles.get(left.id);
      expect(leftAfter?.width).toBe(60);
    });

    it('clamps resize to valid range', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      const tile = model.getState().toArray()[0];
      await model.splitTile(tile.id, { orientation: 'vertical', ratio: 0.5 });

      const [left] = model
        .getState()
        .toArray()
        .sort((a, b) => a.x - b.x);

      // Try to resize beyond valid range
      const result = await model.resizeTile(left.id, { edge: 'right', delta: 100 });

      expect(result.valid).toBe(true);
      // Should be clamped to not make neighbor smaller than minTile
      const leftAfter = model.getState().tiles.get(left.id);
      expect(leftAfter?.width).toBeLessThanOrEqual(90);
    });
  });

  describe('clampResize', () => {
    it('returns clamp range for resize', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      const tile = model.getState().toArray()[0];
      await model.splitTile(tile.id, { orientation: 'vertical', ratio: 0.5 });

      const [left] = model
        .getState()
        .toArray()
        .sort((a, b) => a.x - b.x);

      const clamp = model.clampResize(left.id, { edge: 'right', delta: 0 });

      expect(clamp.min).toBeDefined();
      expect(clamp.max).toBeDefined();
      expect(clamp.clampedDelta).toBeDefined();
    });
  });

  describe('subscribe', () => {
    it('notifies on state changes', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      const callback = vi.fn();
      model.subscribe(callback);

      const tile = model.getState().toArray()[0];
      await model.splitTile(tile.id, { orientation: 'vertical' });

      expect(callback).toHaveBeenCalled();
    });

    it('returns unsubscribe function', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      const callback = vi.fn();
      const unsubscribe = model.subscribe(callback);
      unsubscribe();

      const tile = model.getState().toArray()[0];
      await model.splitTile(tile.id, { orientation: 'vertical' });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('undo/redo', () => {
    it('supports undo after split', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      const tile = model.getState().toArray()[0];
      await model.splitTile(tile.id, { orientation: 'vertical' });

      expect(model.getState().tiles.size).toBe(2);

      model.undo();

      expect(model.getState().tiles.size).toBe(1);
    });

    it('supports redo after undo', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      const tile = model.getState().toArray()[0];
      await model.splitTile(tile.id, { orientation: 'vertical' });
      model.undo();

      model.redo();

      expect(model.getState().tiles.size).toBe(2);
    });

    it('canUndo returns true after operation', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      const tile = model.getState().toArray()[0];
      await model.splitTile(tile.id, { orientation: 'vertical' });

      expect(model.canUndo()).toBe(true);
    });

    it('canRedo returns true after undo', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      const tile = model.getState().toArray()[0];
      await model.splitTile(tile.id, { orientation: 'vertical' });
      model.undo();

      expect(model.canRedo()).toBe(true);
    });
  });

  describe('lifecycle', () => {
    it('exposes lifecycle manager', async () => {
      const model = new DashboardModel();
      await model.initialize();

      expect(model.lifecycle).toBeDefined();
    });
  });

  describe('strategies', () => {
    it('exposes strategy registry', async () => {
      const model = new DashboardModel();
      await model.initialize();

      expect(model.strategies).toBeDefined();
      expect(model.strategies.getResize).toBeDefined();
      expect(model.strategies.getSplit).toBeDefined();
    });
  });
});
