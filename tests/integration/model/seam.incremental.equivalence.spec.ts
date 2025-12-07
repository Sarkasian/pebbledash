import { describe, it, expect } from 'vitest';
import { DashboardModel } from '../../../packages/core/src/index';

describe('Model: resizeSeam incremental vs single-commit equivalence', () => {
  it('vertical interior seam: sum of increments equals single clamped move', async () => {
    const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
    await model.initialize();
    const only = model.getState().toArray()[0];
    await model.splitTile(only.id, { orientation: 'vertical', ratio: 0.5 });
    const [left] = model
      .getState()
      .toArray()
      .sort((a, b) => a.x - b.x);
    // Compute target from clamp
    const clamp = model.clampResize(left.id, { edge: 'right', delta: 30 });
    const target = clamp.clampedDelta;
    const snap = model.createSnapshot();
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      const res = await model.resizeTile(left.id, { edge: 'right', delta: target / steps });
      expect(res.valid).toBe(true);
    }
    const afterSteps = model.createSnapshot();
    model.restoreSnapshot(snap);
    const res2 = await model.resizeTile(left.id, { edge: 'right', delta: target });
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
