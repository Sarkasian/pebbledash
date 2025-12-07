import { describe, it, expect } from 'vitest';
import { DashboardModel } from '../../../packages/core/src/index';

describe('Vertical live commit equals single clamped commit', () => {
  it('bottom seam: incremental clamped deltas equal single clamped delta', async () => {
    const model = new DashboardModel({ minTile: { width: 10, height: 20 } });
    await model.initialize();
    const only = model.getState().toArray()[0];
    // Split horizontally 40/60 (top smaller)
    await model.splitTile(only.id, { orientation: 'horizontal', ratio: 0.4 });
    const tiles = model
      .getState()
      .toArray()
      .sort((a, b) => a.y - b.y);
    const top = tiles[0];
    // Intended large downward move on bottom seam (positive delta)
    const intended = 50;
    const clamp = model.clampResize(top.id, { edge: 'bottom', delta: intended });
    const target = clamp.clampedDelta;
    const snap = model.createSnapshot();
    // Apply in 10 increments
    const steps = 10;
    const step = target / steps;
    for (let i = 0; i < steps; i++) {
      const res = await model.resizeTile(top.id, { edge: 'bottom', delta: step });
      expect(res.valid).toBe(true);
    }
    const afterSteps = model.createSnapshot();
    // Compare to single clamped commit
    model.restoreSnapshot(snap);
    const res2 = await model.resizeTile(top.id, { edge: 'bottom', delta: target });
    expect(res2.valid).toBe(true);
    const afterSingle = model.createSnapshot();
    for (const t of afterSingle.tiles) {
      const u = afterSteps.tiles.find((tt) => tt.id === t.id)!;
      expect(Math.abs(t.x - u.x)).toBeLessThan(1e-6);
      expect(Math.abs(t.y - u.y)).toBeLessThan(1e-6);
      expect(Math.abs(t.width - u.width)).toBeLessThan(1e-6);
      expect(Math.abs(t.height - u.height)).toBeLessThan(1e-6);
    }
  });
});
