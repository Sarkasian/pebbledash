import { describe, it, expect } from 'vitest';
import {
  edgeId,
  boundaryId,
  orientationOf,
  parseEdgeId,
  seamEpsFromCtx,
  computeSeam,
} from '../../../../packages/core/src/interaction/navigator-helpers';
import { DashboardState } from '../../../../packages/core/src/entities/DashboardState';
import { Tile } from '../../../../packages/core/src/entities/Tile';
import { EPSILON } from '../../../../packages/core/src/utils/geometry';
import type { TileId } from '../../../../packages/core/src/index';

const id = (s: string) => s as TileId;

describe('navigator-helpers', () => {
  describe('edgeId', () => {
    it('creates an edge id for left side', () => {
      expect(edgeId(id('tile-1'), 'left')).toBe('edge|tile-1|left');
    });

    it('creates an edge id for right side', () => {
      expect(edgeId(id('tile-2'), 'right')).toBe('edge|tile-2|right');
    });

    it('creates an edge id for top side', () => {
      expect(edgeId(id('tile-3'), 'top')).toBe('edge|tile-3|top');
    });

    it('creates an edge id for bottom side', () => {
      expect(edgeId(id('tile-4'), 'bottom')).toBe('edge|tile-4|bottom');
    });
  });

  describe('boundaryId', () => {
    it('creates a boundary id with index', () => {
      expect(boundaryId(id('tile-1'), 'left', 0)).toBe('boundary|tile-1|left|0');
      expect(boundaryId(id('tile-2'), 'right', 5)).toBe('boundary|tile-2|right|5');
    });
  });

  describe('orientationOf', () => {
    it('returns vertical for left side', () => {
      expect(orientationOf('left')).toBe('vertical');
    });

    it('returns vertical for right side', () => {
      expect(orientationOf('right')).toBe('vertical');
    });

    it('returns horizontal for top side', () => {
      expect(orientationOf('top')).toBe('horizontal');
    });

    it('returns horizontal for bottom side', () => {
      expect(orientationOf('bottom')).toBe('horizontal');
    });
  });

  describe('parseEdgeId', () => {
    it('parses a valid edge id', () => {
      const result = parseEdgeId('edge|tile-123|left');
      expect(result).toEqual({ tileId: 'tile-123', side: 'left' });
    });

    it('parses edge id with right side', () => {
      const result = parseEdgeId('edge|my-tile|right');
      expect(result).toEqual({ tileId: 'my-tile', side: 'right' });
    });

    it('parses edge id with top side', () => {
      const result = parseEdgeId('edge|tile-x|top');
      expect(result).toEqual({ tileId: 'tile-x', side: 'top' });
    });

    it('parses edge id with bottom side', () => {
      const result = parseEdgeId('edge|tile-y|bottom');
      expect(result).toEqual({ tileId: 'tile-y', side: 'bottom' });
    });

    it('returns null for non-edge id', () => {
      expect(parseEdgeId('boundary|tile-1|left|0')).toBeNull();
      expect(parseEdgeId('seam|v|50')).toBeNull();
      expect(parseEdgeId('invalid')).toBeNull();
    });
  });

  describe('seamEpsFromCtx', () => {
    it('uses epsilon from config when available', () => {
      const ctx = {
        config: { minTile: { width: 5, height: 5 }, epsilon: 0.5 },
        state: {} as DashboardState,
        params: {},
        op: 'test',
      };
      expect(seamEpsFromCtx(ctx as any)).toBe(0.5);
    });

    it('uses EPSILON as fallback', () => {
      const ctx = {
        config: { minTile: { width: 5, height: 5 } },
        state: {} as DashboardState,
        params: {},
        op: 'test',
      };
      // Should return at least 1e-2 (the minimum threshold)
      expect(seamEpsFromCtx(ctx as any)).toBe(Math.max(EPSILON, 1e-2));
    });

    it('ensures minimum of 1e-2', () => {
      const ctx = {
        config: { model: { config: { epsilon: 1e-6 } } },
        state: {} as DashboardState,
        params: {},
        op: 'test',
      };
      expect(seamEpsFromCtx(ctx as any)).toBe(1e-2);
    });
  });

  describe('computeSeam', () => {
    const tile = new Tile({ id: id('test'), x: 0, y: 0, width: 100, height: 100 });
    const state = new DashboardState({ tiles: [tile] });

    const createCtx = (edgeIdStr: string) => ({
      config: {},
      state,
      params: { edgeId: edgeIdStr },
      op: 'interaction:hover',
    });

    it('computes vertical seam for left edge', () => {
      const ctx = createCtx('edge|test|left');
      const result = computeSeam(ctx as any);
      expect(result).toEqual({ orientation: 'vertical', coord: 0 });
    });

    it('computes vertical seam for right edge', () => {
      const ctx = createCtx('edge|test|right');
      const result = computeSeam(ctx as any);
      expect(result).toEqual({ orientation: 'vertical', coord: 100 }); // 0 + 100
    });

    it('computes horizontal seam for top edge', () => {
      const ctx = createCtx('edge|test|top');
      const result = computeSeam(ctx as any);
      expect(result).toEqual({ orientation: 'horizontal', coord: 0 });
    });

    it('computes horizontal seam for bottom edge', () => {
      const ctx = createCtx('edge|test|bottom');
      const result = computeSeam(ctx as any);
      expect(result).toEqual({ orientation: 'horizontal', coord: 100 }); // 0 + 100
    });

    it('returns null for non-existent tile', () => {
      const ctx = createCtx('edge|non-existent|left');
      const result = computeSeam(ctx as any);
      expect(result).toBeNull();
    });

    it('returns null when edge id is invalid', () => {
      const ctx = createCtx('invalid|test|left');
      // parseEdgeId returns null for invalid format
      const result = computeSeam(ctx as any);
      expect(result).toBeNull();
    });
  });
});
