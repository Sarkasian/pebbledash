import { describe, it, expect } from 'vitest';
import { DashboardModel } from '../../../packages/core/src/index';

describe('Live commit equivalence to single commit', () => {
  it('applying incremental clamped deltas equals single clamped delta', async () => {
    const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
    await model.initialize();
    const only = model.getState().toArray()[0];
    // Layout: split 30/70 (vertical), then split right 70 into two stacks
    await model.splitTile(only.id, { orientation: 'vertical', ratio: 0.3 });
    const t1 = model.getState().toArray();
    const left = t1.find((t) => t.x === 0)!;
    const right = t1.find((t) => t.x > 0)!;
    await model.splitTile(right.id, { orientation: 'horizontal', ratio: 0.5 });
    // Compute clamped target for a large intended seam move
    const intended = 25;
    const clamp = model.clampResize(left.id, { edge: 'right', delta: intended });
    const target = clamp.clampedDelta;
    // Snapshot baseline
    const snap = model.createSnapshot();
    // Apply as 5 equal steps
    const steps = 5;
    const step = target / steps;
    for (let i = 0; i < steps; i++) {
      const res = await model.resizeTile(left.id, { edge: 'right', delta: step });
      expect(res.valid).toBe(true);
    }
    const afterSteps = model.createSnapshot();
    // Compare to single apply
    model.restoreSnapshot(snap);
    const res2 = await model.resizeTile(left.id, { edge: 'right', delta: target });
    expect(res2.valid).toBe(true);
    const afterSingle = model.createSnapshot();
    expect(afterSteps.tiles.length).toBe(afterSingle.tiles.length);
    for (const t of afterSingle.tiles) {
      const u = afterSteps.tiles.find((tt) => tt.id === t.id)!;
      expect(Math.abs(t.x - u.x)).toBeLessThan(1e-6);
      expect(Math.abs(t.y - u.y)).toBeLessThan(1e-6);
      expect(Math.abs(t.width - u.width)).toBeLessThan(1e-6);
      expect(Math.abs(t.height - u.height)).toBeLessThan(1e-6);
    }
  });
});
