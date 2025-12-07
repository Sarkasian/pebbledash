import { describe, it, expect } from 'vitest';
import { SeamChainCovered } from '../../../../packages/core/src/decision-engine/conditions/SeamChainCovered';
import { DashboardState } from '../../../../packages/core/src/entities/DashboardState';
import { Tile } from '../../../../packages/core/src/entities/Tile';
import type { TileId } from '../../../../packages/core/src/index';

const id = (s: string) => s as TileId;

function createContext(state: DashboardState, seamId: string, config: any = {}) {
  return {
    state,
    params: { seamId },
    config,
    op: 'seam:resize',
  };
}

describe('SeamChainCovered condition', () => {
  const condition = SeamChainCovered();

  describe('vertical seams', () => {
    it('returns valid when tiles on both sides cover the full span', async () => {
      // Two tiles side by side covering full height
      const left = new Tile({ id: id('left'), x: 0, y: 0, width: 50, height: 100 });
      const right = new Tile({ id: id('right'), x: 50, y: 0, width: 50, height: 100 });
      const state = new DashboardState({ tiles: [left, right] });

      // Seam at x=50
      const ctx = createContext(state, 'seam|v|50.000000');
      const result = await condition.evaluate(ctx);
      expect(result.valid).toBe(true);
    });

    it('returns valid when stacked tiles cover the full span', async () => {
      // Left tile full height, right side split into two stacked tiles
      const left = new Tile({ id: id('left'), x: 0, y: 0, width: 50, height: 100 });
      const topRight = new Tile({ id: id('topRight'), x: 50, y: 0, width: 50, height: 50 });
      const bottomRight = new Tile({ id: id('bottomRight'), x: 50, y: 50, width: 50, height: 50 });
      const state = new DashboardState({ tiles: [left, topRight, bottomRight] });

      const ctx = createContext(state, 'seam|v|50.000000');
      const result = await condition.evaluate(ctx);
      expect(result.valid).toBe(true);
    });

    it('returns invalid when seam at edge has no neighbors on one side', async () => {
      // Full screen tile - seam at x=0 has no left neighbors
      const single = new Tile({ id: id('single'), x: 0, y: 0, width: 100, height: 100 });
      const state = new DashboardState({ tiles: [single] });

      const ctx = createContext(state, 'seam|v|0.000000');
      const result = await condition.evaluate(ctx);
      expect(result.valid).toBe(false);
    });
  });

  describe('horizontal seams', () => {
    it('returns valid when tiles on both sides cover the full span', async () => {
      // Two tiles stacked covering full width
      const top = new Tile({ id: id('top'), x: 0, y: 0, width: 100, height: 50 });
      const bottom = new Tile({ id: id('bottom'), x: 0, y: 50, width: 100, height: 50 });
      const state = new DashboardState({ tiles: [top, bottom] });

      // Seam at y=50
      const ctx = createContext(state, 'seam|h|50.000000');
      const result = await condition.evaluate(ctx);
      expect(result.valid).toBe(true);
    });

    it('returns valid when side-by-side tiles cover the full span', async () => {
      // Top tile full width, bottom side split into two side-by-side tiles
      const top = new Tile({ id: id('top'), x: 0, y: 0, width: 100, height: 50 });
      const leftBottom = new Tile({ id: id('leftBottom'), x: 0, y: 50, width: 50, height: 50 });
      const rightBottom = new Tile({ id: id('rightBottom'), x: 50, y: 50, width: 50, height: 50 });
      const state = new DashboardState({ tiles: [top, leftBottom, rightBottom] });

      const ctx = createContext(state, 'seam|h|50.000000');
      const result = await condition.evaluate(ctx);
      expect(result.valid).toBe(true);
    });

    it('returns invalid when seam at edge has no neighbors on one side', async () => {
      // Full screen tile - seam at y=0 has no top neighbors
      const single = new Tile({ id: id('single'), x: 0, y: 0, width: 100, height: 100 });
      const state = new DashboardState({ tiles: [single] });

      const ctx = createContext(state, 'seam|h|0.000000');
      const result = await condition.evaluate(ctx);
      expect(result.valid).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('returns invalid when seam does not exist', async () => {
      const tile = new Tile({ id: id('single'), x: 0, y: 0, width: 100, height: 100 });
      const state = new DashboardState({ tiles: [tile] });

      const ctx = createContext(state, 'seam|v|999.000000');
      const result = await condition.evaluate(ctx);
      expect(result.valid).toBe(false);
    });

    it('returns a violation with the correct code and message', async () => {
      const tile = new Tile({ id: id('single'), x: 0, y: 0, width: 100, height: 100 });
      const state = new DashboardState({ tiles: [tile] });

      const ctx = createContext(state, 'seam|v|0.000000');
      const result = await condition.evaluate(ctx);

      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].code).toBe('SeamNotCovered');
      expect(result.violations[0].message).toBe('Seam chain does not cover full span');
    });
  });

  describe('ConditionNode properties', () => {
    it('has a label', () => {
      expect(condition.label).toBe('SeamChainCovered');
    });

    it('has a predicate function', () => {
      expect(typeof condition.predicate).toBe('function');
    });

    it('has a violationFactory function', () => {
      expect(typeof condition.violationFactory).toBe('function');
    });
  });
});
