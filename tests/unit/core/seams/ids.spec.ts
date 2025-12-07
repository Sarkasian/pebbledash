import { describe, it, expect } from 'vitest';
import { DashboardState, Tile, type TileId } from '../../../../packages/core/src/index';
import { seamIdForEdge, resolveEdgeToSeamId } from '../../../../packages/core/src/seams/ids';
import { makeSeamId } from '../../../../packages/core/src/entities/Seam';

function id(s: string): TileId {
  return s as TileId;
}

function createTile(tileId: string, x: number, y: number, width: number, height: number): Tile {
  return new Tile({ id: id(tileId), x, y, width, height });
}

function createState(tiles: Tile[]): DashboardState {
  return new DashboardState({ tiles });
}

describe('seamIdForEdge', () => {
  describe('fast path - exact ID match', () => {
    it('returns seam ID when exact match exists', () => {
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      // The seam at x=50 should exist
      const seamId = seamIdForEdge(state, 'vertical', 50);

      expect(seamId).toBe(makeSeamId('vertical', 50));
    });

    it('returns seam ID for horizontal seam', () => {
      const state = createState([
        createTile('t1', 0, 0, 100, 50),
        createTile('t2', 0, 50, 100, 50),
      ]);

      const seamId = seamIdForEdge(state, 'horizontal', 50);

      expect(seamId).toBe(makeSeamId('horizontal', 50));
    });
  });

  describe('fallback - epsilon search', () => {
    it('finds seam within epsilon tolerance', () => {
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      // Search with a slightly different coord
      const seamId = seamIdForEdge(state, 'vertical', 50.0000001, 1e-6);

      expect(seamId).toBe(makeSeamId('vertical', 50));
    });

    it('returns generated ID when no seam exists', () => {
      const state = createState([createTile('t1', 0, 0, 100, 100)]);

      // Search for a seam that doesn't exist
      const seamId = seamIdForEdge(state, 'vertical', 25);

      // Should return generated ID
      expect(seamId).toBe(makeSeamId('vertical', 25));
    });
  });

  describe('edge cases', () => {
    it('handles coord at 0', () => {
      const state = createState([createTile('t1', 0, 0, 100, 100)]);

      const seamId = seamIdForEdge(state, 'vertical', 0);

      expect(seamId).toBe(makeSeamId('vertical', 0));
    });

    it('handles coord at 100', () => {
      const state = createState([createTile('t1', 0, 0, 100, 100)]);

      const seamId = seamIdForEdge(state, 'vertical', 100);

      expect(seamId).toBe(makeSeamId('vertical', 100));
    });

    it('uses custom epsilon', () => {
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      // With large epsilon, should find the seam
      const seamId = seamIdForEdge(state, 'vertical', 50.1, 0.2);

      expect(seamId).toBe(makeSeamId('vertical', 50));
    });

    it('does not find seam outside epsilon', () => {
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      // With small epsilon, should not find the seam
      const seamId = seamIdForEdge(state, 'vertical', 50.1, 0.01);

      expect(seamId).toBe(makeSeamId('vertical', 50.1));
    });
  });
});

describe('resolveEdgeToSeamId', () => {
  describe('tile not found', () => {
    it('returns undefined when tile does not exist', () => {
      const state = createState([createTile('t1', 0, 0, 100, 100)]);

      const seamId = resolveEdgeToSeamId(state, id('nonexistent'), 'right');

      expect(seamId).toBeUndefined();
    });
  });

  describe('vertical edges (left/right)', () => {
    it('resolves left edge to seam', () => {
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      const seamId = resolveEdgeToSeamId(state, id('t2'), 'left');

      expect(seamId).toBe(makeSeamId('vertical', 50));
    });

    it('resolves right edge to seam', () => {
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      const seamId = resolveEdgeToSeamId(state, id('t1'), 'right');

      expect(seamId).toBe(makeSeamId('vertical', 50));
    });
  });

  describe('horizontal edges (top/bottom)', () => {
    it('resolves top edge to seam', () => {
      const state = createState([
        createTile('t1', 0, 0, 100, 50),
        createTile('t2', 0, 50, 100, 50),
      ]);

      const seamId = resolveEdgeToSeamId(state, id('t2'), 'top');

      expect(seamId).toBe(makeSeamId('horizontal', 50));
    });

    it('resolves bottom edge to seam', () => {
      const state = createState([
        createTile('t1', 0, 0, 100, 50),
        createTile('t2', 0, 50, 100, 50),
      ]);

      const seamId = resolveEdgeToSeamId(state, id('t1'), 'bottom');

      expect(seamId).toBe(makeSeamId('horizontal', 50));
    });
  });

  describe('epsilon tolerance', () => {
    it('finds seam within epsilon', () => {
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      // Even with epsilon tolerance, should find the seam
      const seamId = resolveEdgeToSeamId(state, id('t1'), 'right', 1e-6);

      expect(seamId).toBe(makeSeamId('vertical', 50));
    });

    it('uses custom epsilon value', () => {
      const state = createState([
        createTile('t1', 0, 0, 50, 100),
        createTile('t2', 50, 0, 50, 100),
      ]);

      const seamId = resolveEdgeToSeamId(state, id('t1'), 'right', 0.001);

      expect(seamId).toBe(makeSeamId('vertical', 50));
    });
  });

  describe('boundary edges', () => {
    it('resolves left boundary (x=0)', () => {
      const state = createState([createTile('t1', 0, 0, 100, 100)]);

      const seamId = resolveEdgeToSeamId(state, id('t1'), 'left');

      // Should return the generated ID even if no seam
      expect(seamId).toBe(makeSeamId('vertical', 0));
    });

    it('resolves right boundary (x=100)', () => {
      const state = createState([createTile('t1', 0, 0, 100, 100)]);

      const seamId = resolveEdgeToSeamId(state, id('t1'), 'right');

      expect(seamId).toBe(makeSeamId('vertical', 100));
    });

    it('resolves top boundary (y=0)', () => {
      const state = createState([createTile('t1', 0, 0, 100, 100)]);

      const seamId = resolveEdgeToSeamId(state, id('t1'), 'top');

      expect(seamId).toBe(makeSeamId('horizontal', 0));
    });

    it('resolves bottom boundary (y=100)', () => {
      const state = createState([createTile('t1', 0, 0, 100, 100)]);

      const seamId = resolveEdgeToSeamId(state, id('t1'), 'bottom');

      expect(seamId).toBe(makeSeamId('horizontal', 100));
    });
  });

  describe('2x2 grid layout', () => {
    it('resolves all edges correctly in grid', () => {
      const state = createState([
        createTile('tl', 0, 0, 50, 50),
        createTile('tr', 50, 0, 50, 50),
        createTile('bl', 0, 50, 50, 50),
        createTile('br', 50, 50, 50, 50),
      ]);

      const vSeam50 = makeSeamId('vertical', 50);
      const hSeam50 = makeSeamId('horizontal', 50);

      // Vertical seam at x=50
      expect(resolveEdgeToSeamId(state, id('tl'), 'right')).toBe(vSeam50);
      expect(resolveEdgeToSeamId(state, id('tr'), 'left')).toBe(vSeam50);
      expect(resolveEdgeToSeamId(state, id('bl'), 'right')).toBe(vSeam50);
      expect(resolveEdgeToSeamId(state, id('br'), 'left')).toBe(vSeam50);

      // Horizontal seam at y=50
      expect(resolveEdgeToSeamId(state, id('tl'), 'bottom')).toBe(hSeam50);
      expect(resolveEdgeToSeamId(state, id('tr'), 'bottom')).toBe(hSeam50);
      expect(resolveEdgeToSeamId(state, id('bl'), 'top')).toBe(hSeam50);
      expect(resolveEdgeToSeamId(state, id('br'), 'top')).toBe(hSeam50);
    });
  });
});
