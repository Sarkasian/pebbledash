import { describe, it, expect } from 'vitest';
import { DashboardModel } from '../../../packages/core/src/index';

describe('Integration: clamp preview equals final commit', () => {
  it('final state with oversized cursor delta equals state with clamped delta', async () => {
    const model = new DashboardModel({ minTile: { width: 20, height: 20 } });
    await model.initialize();
    const only = model.getState().toArray()[0];
    // Build layout: split vertical 30/70, then split right 70 into two stacks
    await model.splitTile(only.id, { orientation: 'vertical', ratio: 0.3 });
    const tiles1 = model.getState().toArray();
    const left = tiles1.find((t) => t.x === 0)!;
    const right = tiles1.find((t) => t.x > 0)!;
    await model.splitTile(right.id, { orientation: 'horizontal', ratio: 0.5 });
    const before = model.getState().toArray();
    const leftNow = before.find((t) => t.id === left.id)!;
    const strat: any = model.strategies.getResize();
    const cursorDelta = 50; // purposely beyond allowed
    const clamp = strat.clampSeamDelta(model.getState(), leftNow.id, 'right', cursorDelta, {
      minTile: { width: 20, height: 20 },
      epsilon: 1e-6,
    });
    // Apply oversized
    const snapA = model.createSnapshot();
    const resA = await model.resizeTile(leftNow.id, { edge: 'right', delta: cursorDelta });
    expect(resA.valid).toBe(true);
    const afterA = model.createSnapshot();
    // Restore and apply clamped
    model.restoreSnapshot(snapA);
    const resB = await model.resizeTile(leftNow.id, { edge: 'right', delta: clamp.clampedDelta });
    expect(resB.valid).toBe(true);
    const afterB = model.createSnapshot();
    expect(afterA.tiles.length).toBe(afterB.tiles.length);
    for (let i = 0; i < afterA.tiles.length; i++) {
      const tA = afterA.tiles[i];
      const tB = afterB.tiles.find((t) => t.id === tA.id)!;
      expect(Math.abs(tA.x - tB.x)).toBeLessThan(1e-6);
      expect(Math.abs(tA.y - tB.y)).toBeLessThan(1e-6);
      expect(Math.abs(tA.width - tB.width)).toBeLessThan(1e-6);
      expect(Math.abs(tA.height - tB.height)).toBeLessThan(1e-6);
    }
  });
});
