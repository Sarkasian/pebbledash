import { describe, it, expect } from 'vitest';
import { DashboardModel, type TileId } from '../../../../packages/core/src/index';

const _asId = (s: string) => s as TileId;

describe('LinearResizeStrategy.clampSeamDelta', () => {
  it('returns clamp equal to effective clamp used by compute (horizontal seam)', async () => {
    const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
    await model.initialize();
    const only = model.getState().toArray()[0];
    // Split 50/50
    await model.splitTile(only.id, { orientation: 'vertical', ratio: 0.5 });
    let [left, right] = model
      .getState()
      .toArray()
      .sort((a, b) => a.x - b.x);
    // Split right into two stacked 25/25
    await model.splitTile(right.id, { orientation: 'horizontal', ratio: 0.5 });
    const before = model.getState().toArray();
    left = before.find((t) => t.x === 0)!;
    const strat: any = model.strategies.getResize();
    // Ask for a large delta that would undersize neighbors if not clamped
    const cursorDelta = 40;
    const clamp = strat.clampSeamDelta(model.getState(), left.id, 'right', cursorDelta, {
      minTile: { width: 10, height: 10 },
      epsilon: 1e-6,
    });
    // Apply oversized delta via API (compute will clamp internally)
    const res = await model.resizeTile(left.id, { edge: 'right', delta: cursorDelta });
    expect(res.valid).toBe(true);
    const after = model.getState().toArray();
    const leftAfter = after.find((t) => t.id === left.id)!;
    expect(Math.abs(leftAfter.width - (left.width + clamp.clampedDelta))).toBeLessThan(1e-6);
    expect(clamp.min).toBeLessThanOrEqual(clamp.clampedDelta);
    expect(clamp.max).toBeGreaterThanOrEqual(clamp.clampedDelta);
  });

  it('returns clamp equal to effective clamp used by compute (vertical seam)', async () => {
    const model = new DashboardModel({ minTile: { width: 10, height: 15 } });
    await model.initialize();
    const only = model.getState().toArray()[0];
    // Split horizontally 60/40
    await model.splitTile(only.id, { orientation: 'horizontal', ratio: 0.6 });
    let [top, bottom] = model
      .getState()
      .toArray()
      .sort((a, b) => a.y - b.y);
    // Split bottom into two side-by-side 20/20
    await model.splitTile(bottom.id, { orientation: 'vertical', ratio: 0.5 });
    const before = model.getState().toArray();
    top = before.find((t) => t.y === 0)!;
    const strat: any = model.strategies.getResize();
    const cursorDelta = -50; // shrink top aggressively upward
    const clamp = strat.clampSeamDelta(model.getState(), top.id, 'bottom', cursorDelta, {
      minTile: { width: 10, height: 15 },
      epsilon: 1e-6,
    });
    const res = await model.resizeTile(top.id, { edge: 'bottom', delta: cursorDelta });
    expect(res.valid).toBe(true);
    const after = model.getState().toArray();
    const topAfter = after.find((t) => t.id === top.id)!;
    expect(Math.abs(topAfter.height - (top.height + clamp.clampedDelta))).toBeLessThan(1e-6);
    expect(clamp.chainCovered).toBe(true);
  });
});
