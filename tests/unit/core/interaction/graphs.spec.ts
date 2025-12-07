import { describe, it, expect } from 'vitest';
import { DashboardModel } from '../../../../packages/core/src/index';

describe('DecisionEngine interaction graphs', () => {
  it('vertical seam: from L2 yields left segments plus synthetic full-span; Tab toggles', async () => {
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

    await model.interactionHoverEdge({
      edgeId: 'edge|L2|right',
      pointer: { xPct: 50, yPct: 90 },
      fromTileId: 'L2' as any,
    });
    const group = model.interaction.group!;
    expect(group.boundaries.length).toBe(3);
    const ids = group.boundaries.map((b) => String(b.refTileId));
    expect(ids).toContain('L1');
    expect(ids).toContain('L2');
    expect(ids).toContain('__fullspan__');

    const initialFocused = group.focusedIndex;
    let updates = 0;
    model.lifecycle.on('interaction:group-update', () => {
      updates++;
    });
    await model.interactionKeyTab();
    expect(model.interaction.group!.focusedIndex).toBe(
      (initialFocused + 1) % group.boundaries.length,
    );
    expect(updates).toBeGreaterThanOrEqual(1);

    // Commit should insert relative to focused boundary
    const before = model.getState().toArray().length;
    await model.interactionCommit();
    const after = model.getState().toArray().length;
    expect(after).toBe(before + 1);
  });

  it('horizontal seam deep layout: from top tile cycles across many segments and synthetic full-span', async () => {
    const model = new DashboardModel();
    // Build a layout with multiple horizontal bands on both sides of a horizontal seam at y=50
    await model.initialize({
      layout: {
        tiles: [
          { id: 'A1' as any, x: 0, y: 0, width: 33.3333, height: 50 },
          { id: 'A2' as any, x: 33.3333, y: 0, width: 33.3333, height: 50 },
          { id: 'A3' as any, x: 66.6666, y: 0, width: 33.3334, height: 50 },
          { id: 'B1' as any, x: 0, y: 50, width: 50, height: 25 },
          { id: 'B2' as any, x: 50, y: 50, width: 50, height: 25 },
          { id: 'B3' as any, x: 0, y: 75, width: 100, height: 25 },
        ],
      },
    });
    // Hover bottom edge of A2 (horizontal seam at y=50)
    await model.interactionHoverEdge({
      edgeId: 'edge|A2|bottom',
      pointer: { xPct: 40, yPct: 50 },
      fromTileId: 'A2' as any,
    });
    const group = model.interaction.group!;
    expect(group.orientation).toBe('horizontal');
    // From-side is top: expect all top segments along seam (A1,A2,A3) and opposite side spans full width; add synthetic full-span
    expect(group.boundaries.length).toBeGreaterThanOrEqual(4);
    const ids = group.boundaries.map((b) => String(b.refTileId));
    expect(ids).toContain('A1');
    expect(ids).toContain('A2');
    expect(ids).toContain('A3');
    // Synthetic full-span tagged by '__fullspan__'
    expect(ids.includes('__fullspan__')).toBe(true);
    const start = group.focusedIndex;
    await model.interactionKeyTab();
    expect(model.interaction.group!.focusedIndex).toBe((start + 1) % group.boundaries.length);
  });

  it('horizontal seam tolerant full-span detection across micro gap', async () => {
    const model = new DashboardModel();
    // Two bottom tiles with a tiny gap at x=50 ± 0.0000003 should still count as full-span
    await model.initialize({
      layout: {
        tiles: [
          { id: 'T' as any, x: 0, y: 0, width: 100, height: 50 },
          { id: 'B1' as any, x: 0, y: 50, width: 49.9999997, height: 50 },
          { id: 'B2' as any, x: 50.0000003, y: 50, width: 49.9999997, height: 50 },
        ],
      },
    });
    await model.interactionHoverEdge({
      edgeId: 'edge|T|bottom',
      pointer: { xPct: 25, yPct: 50 },
      fromTileId: 'T' as any,
    });
    const group = model.interaction.group!;
    expect(group.orientation).toBe('horizontal');
    const ids = group.boundaries.map((b) => String(b.refTileId));
    // Should include synthetic full-span in addition to the top segment
    expect(ids.includes('__fullspan__')).toBe(true);
  });

  it('outer vertical seam (x=0): from L2 yields left segments plus container full-span; Tab cycles', async () => {
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
    // Hover far left boundary of L2 (edge|L2|left) with from L2
    await model.interactionHoverEdge({
      edgeId: 'edge|L2|left',
      pointer: { xPct: 0, yPct: 90 },
      fromTileId: 'L2' as any,
    });
    const group = model.interaction.group!;
    expect(group.orientation).toBe('vertical');
    expect(group.boundaries.length).toBe(3);
    const ids = group.boundaries.map((b) => String(b.refTileId));
    expect(ids).toContain('L1');
    expect(ids).toContain('L2');
    expect(ids).toContain('__container__');
    // Initial focus should be L2 (origin)
    expect(String(group.boundaries[group.focusedIndex].refTileId)).toBe('L2');
    const initial = group.focusedIndex;
    await model.interactionKeyTab();
    expect(model.interaction.group!.focusedIndex).toBe((initial + 1) % group.boundaries.length);
    // Cycle to container and commit
    while (
      String(
        model.interaction.group!.boundaries[model.interaction.group!.focusedIndex].refTileId,
      ) !== '__container__'
    ) {
      await model.interactionKeyTab();
    }
    const before = model.getState().toArray().length;
    await model.interactionCommit();
    const after = model.getState().toArray().length;
    expect(after).toBe(before + 1);
  });
  it('vertical seam: from R yields R segment plus left full-span', async () => {
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
    await model.interactionHoverEdge({
      edgeId: 'edge|R|left',
      pointer: { xPct: 50, yPct: 10 },
      fromTileId: 'R' as any,
    });
    const group = model.interaction.group!;
    expect(group.boundaries.length).toBe(2);
    const ids = group.boundaries.map((b) => String(b.refTileId));
    expect(ids).toContain('R');
    // Synthetic full-span instead of specific left tile id
    expect(ids).toContain('__fullspan__');
  });
});
