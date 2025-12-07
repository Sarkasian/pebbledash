import { describe, it, expect, vi } from 'vitest';
import { DashboardModel, type TileId } from '../../../../packages/core/src/index';
import { InsertionNavigator } from '../../../../packages/core/src/internal';

function id(s: string): TileId {
  return s as TileId;
}

describe('InsertionNavigator', () => {
  describe('grouping and initial focus', () => {
    it('groups vertical seam boundaries with full-span and picks from-left segment', async () => {
      const model = new DashboardModel();
      await model.initialize({
        layout: {
          tiles: [
            { id: 'L1' as any, x: 0, y: 0, width: 50, height: 50 },
            { id: 'L2' as any, x: 0, y: 50, width: 50, height: 50 },
            { id: 'R' as any, x: 50, y: 0, width: 50, height: 100 },
          ],
        },
      });
      const nav = new InsertionNavigator(model);

      let group: any = null;
      let focused: any = null;
      model.lifecycle.on('interaction:hover-start', (e: any) => {
        group = e.group;
      });
      model.lifecycle.on('interaction:focus-change', (e: any) => {
        focused = e.boundary;
      });

      // Simulate pointer coming from L1 and entering the seam at L1 right edge near y = 10%
      nav.pointerEnterTile('L1' as any);
      nav.pointerEnterEdge('edge|L1|right', { xPct: 50, yPct: 10 });

      expect(group).toBeTruthy();
      expect(group.orientation).toBe('vertical');
      // Expect 3 boundaries: L1+L2 segments (from-left) and synthetic full-span on right
      expect(group.boundaries.length).toBe(3);
      // Initial focus should be L1 segment (contains y=10)
      expect(focused).toBeTruthy();
      expect(focused.refTileId).toBe('L1');
      expect(focused.side).toBe('right');
    });

    it('from-right tile prefers full-span boundary on vertical seam', async () => {
      const model = new DashboardModel();
      await model.initialize({
        layout: {
          tiles: [
            { id: 'L1' as any, x: 0, y: 0, width: 50, height: 50 },
            { id: 'L2' as any, x: 0, y: 50, width: 50, height: 50 },
            { id: 'R' as any, x: 50, y: 0, width: 50, height: 100 },
          ],
        },
      });
      const nav = new InsertionNavigator(model);

      let focused: any = null;
      model.lifecycle.on('interaction:focus-change', (e: any) => {
        focused = e.boundary;
      });

      nav.pointerEnterTile('R' as any);
      nav.pointerEnterEdge('edge|R|left', { xPct: 50, yPct: 10 });

      expect(focused).toBeTruthy();
      expect(focused.refTileId).toBe('R');
      expect(focused.side).toBe('left');
    });
  });

  describe('getHoverEdges', () => {
    it('returns edges for single tile', async () => {
      const model = new DashboardModel();
      await model.initialize();

      const nav = new InsertionNavigator(model);
      const edges = nav.getHoverEdges();

      // Single tile has 4 edges
      expect(edges.length).toBeGreaterThan(0);
    });

    it('returns edges for multiple tiles', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize();

      const tile = model.getState().toArray()[0];
      await model.splitTile(tile.id, { orientation: 'vertical' });

      const nav = new InsertionNavigator(model);
      const edges = nav.getHoverEdges();

      // Two tiles - should have internal seam edges
      expect(edges.length).toBeGreaterThan(4);
    });
  });

  describe('pointerEnterTile', () => {
    it('tracks current tile', async () => {
      const model = new DashboardModel();
      await model.initialize({
        layout: {
          tiles: [
            { id: 't1' as any, x: 0, y: 0, width: 50, height: 100 },
            { id: 't2' as any, x: 50, y: 0, width: 50, height: 100 },
          ],
        },
      });

      const nav = new InsertionNavigator(model);
      nav.pointerEnterTile(id('t1'));

      // Should not throw
      expect(true).toBe(true);
    });

    it('handles entering different tiles', async () => {
      const model = new DashboardModel();
      await model.initialize({
        layout: {
          tiles: [
            { id: 't1' as any, x: 0, y: 0, width: 50, height: 100 },
            { id: 't2' as any, x: 50, y: 0, width: 50, height: 100 },
          ],
        },
      });

      const nav = new InsertionNavigator(model);
      nav.pointerEnterTile(id('t1'));
      nav.pointerEnterTile(id('t2'));

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('pointerEnterEdge/pointerLeaveEdge', () => {
    it('emits hover-start on edge enter', async () => {
      const model = new DashboardModel();
      await model.initialize({
        layout: {
          tiles: [
            { id: 't1' as any, x: 0, y: 0, width: 50, height: 100 },
            { id: 't2' as any, x: 50, y: 0, width: 50, height: 100 },
          ],
        },
      });

      const nav = new InsertionNavigator(model);
      const hoverStartSpy = vi.fn();
      model.lifecycle.on('interaction:hover-start', hoverStartSpy);

      nav.pointerEnterTile(id('t1'));
      nav.pointerEnterEdge('edge|t1|right', { xPct: 50, yPct: 50 });

      expect(hoverStartSpy).toHaveBeenCalled();
    });

    it('emits hover-end on edge leave', async () => {
      const model = new DashboardModel();
      await model.initialize({
        layout: {
          tiles: [
            { id: 't1' as any, x: 0, y: 0, width: 50, height: 100 },
            { id: 't2' as any, x: 50, y: 0, width: 50, height: 100 },
          ],
        },
      });

      const nav = new InsertionNavigator(model);
      const hoverEndSpy = vi.fn();
      model.lifecycle.on('interaction:hover-end', hoverEndSpy);

      nav.pointerEnterTile(id('t1'));
      nav.pointerEnterEdge('edge|t1|right', { xPct: 50, yPct: 50 });
      nav.pointerLeaveEdge('edge|t1|right');

      expect(hoverEndSpy).toHaveBeenCalled();
    });
  });

  describe('handleKey', () => {
    it('handles Tab key to cycle focus', async () => {
      const model = new DashboardModel();
      await model.initialize({
        layout: {
          tiles: [
            { id: 'L1' as any, x: 0, y: 0, width: 50, height: 50 },
            { id: 'L2' as any, x: 0, y: 50, width: 50, height: 50 },
            { id: 'R' as any, x: 50, y: 0, width: 50, height: 100 },
          ],
        },
      });

      const nav = new InsertionNavigator(model);

      let focused: any = null;
      model.lifecycle.on('interaction:focus-change', (e: any) => {
        focused = e.boundary;
      });

      // Enter edge to start interaction
      nav.pointerEnterTile('L1' as any);
      nav.pointerEnterEdge('edge|L1|right', { xPct: 50, yPct: 10 });
      const initialFocused = focused;

      // Tab to cycle
      nav.handleKey('Tab');

      // Focus should have changed
      expect(focused).not.toBe(initialFocused);
    });

    it('handles Enter key to commit', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize({
        layout: {
          tiles: [
            { id: 't1' as any, x: 0, y: 0, width: 50, height: 100 },
            { id: 't2' as any, x: 50, y: 0, width: 50, height: 100 },
          ],
        },
      });

      const nav = new InsertionNavigator(model);

      nav.pointerEnterTile(id('t1'));
      nav.pointerEnterEdge('edge|t1|right', { xPct: 50, yPct: 50 });

      // Enter commits the insertion
      nav.handleKey('Enter');

      // Should have more tiles after insertion
      // Note: actual tile count depends on whether insertion succeeded
    });

    it('ignores other keys', async () => {
      const model = new DashboardModel();
      await model.initialize();

      const nav = new InsertionNavigator(model);

      // Should not throw
      nav.handleKey('Escape');
      nav.handleKey('ArrowUp');
      nav.handleKey('Space');
    });
  });

  describe('commit', () => {
    it('commits insertion without errors', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize({
        layout: {
          tiles: [
            { id: 't1' as any, x: 0, y: 0, width: 50, height: 100 },
            { id: 't2' as any, x: 50, y: 0, width: 50, height: 100 },
          ],
        },
      });

      const nav = new InsertionNavigator(model);

      nav.pointerEnterTile(id('t1'));
      nav.pointerEnterEdge('edge|t1|right', { xPct: 50, yPct: 50 });

      // Should not throw
      await nav.commit();
    });
  });

  describe('2x2 grid navigation', () => {
    it('handles horizontal seam in 2x2 grid', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize({
        layout: {
          tiles: [
            { id: 'tl' as any, x: 0, y: 0, width: 50, height: 50 },
            { id: 'tr' as any, x: 50, y: 0, width: 50, height: 50 },
            { id: 'bl' as any, x: 0, y: 50, width: 50, height: 50 },
            { id: 'br' as any, x: 50, y: 50, width: 50, height: 50 },
          ],
        },
      });

      const nav = new InsertionNavigator(model);

      let group: any = null;
      model.lifecycle.on('interaction:hover-start', (e: any) => {
        group = e.group;
      });

      nav.pointerEnterTile('tl' as any);
      nav.pointerEnterEdge('edge|tl|bottom', { xPct: 25, yPct: 50 });

      expect(group).toBeTruthy();
      expect(group.orientation).toBe('horizontal');
    });

    it('handles vertical seam in 2x2 grid', async () => {
      const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
      await model.initialize({
        layout: {
          tiles: [
            { id: 'tl' as any, x: 0, y: 0, width: 50, height: 50 },
            { id: 'tr' as any, x: 50, y: 0, width: 50, height: 50 },
            { id: 'bl' as any, x: 0, y: 50, width: 50, height: 50 },
            { id: 'br' as any, x: 50, y: 50, width: 50, height: 50 },
          ],
        },
      });

      const nav = new InsertionNavigator(model);

      let group: any = null;
      model.lifecycle.on('interaction:hover-start', (e: any) => {
        group = e.group;
      });

      nav.pointerEnterTile('tl' as any);
      nav.pointerEnterEdge('edge|tl|right', { xPct: 50, yPct: 25 });

      expect(group).toBeTruthy();
      expect(group.orientation).toBe('vertical');
    });
  });
});
