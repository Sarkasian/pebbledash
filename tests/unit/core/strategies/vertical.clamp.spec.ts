import { describe, it, expect } from 'vitest';
import { DashboardModel } from '../../../../packages/core/src/index';

describe('Vertical clamp and neighbor updates (top/bottom)', () => {
  it('bottom edge grows downward and neighbors shrink from top within clamp', async () => {
    const model = new DashboardModel({ minTile: { width: 10, height: 15 } });
    await model.initialize();
    const only = model.getState().toArray()[0];
    // Split horizontally 50/50
    await model.splitTile(only.id, { orientation: 'horizontal', ratio: 0.5 });
    const [top, bottom] = model
      .getState()
      .toArray()
      .sort((a, b) => a.y - b.y);
    const delta = 10;
    const res = await model.resizeTile(top.id, { edge: 'bottom', delta });
    expect(res.valid).toBe(true);
    const after = model.getState().toArray();
    const topA = after.find((t) => t.id === top.id)!;
    const bottomA = after.find((t) => t.id === bottom.id)!;
    expect(Math.abs(topA.height - (top.height + delta))).toBeLessThan(1e-6);
    expect(Math.abs(bottomA.y - (bottom.y + delta))).toBeLessThan(1e-6);
    expect(Math.abs(bottomA.height - (bottom.height - delta))).toBeLessThan(1e-6);
  });

  it('bottom edge shrinks upward; neighbors expand upward within clamp', async () => {
    const model = new DashboardModel({ minTile: { width: 10, height: 10 } });
    await model.initialize();
    const only = model.getState().toArray()[0];
    // Split horizontally 60/40
    await model.splitTile(only.id, { orientation: 'horizontal', ratio: 0.6 });
    const [top, bottom] = model
      .getState()
      .toArray()
      .sort((a, b) => a.y - b.y);
    const delta = -5; // move bottom seam upward
    const res = await model.resizeTile(top.id, { edge: 'bottom', delta });
    expect(res.valid).toBe(true);
    const after = model.getState().toArray();
    const topA = after.find((t) => t.id === top.id)!;
    const bottomA = after.find((t) => t.id === bottom.id)!;
    expect(Math.abs(topA.height - (top.height + delta))).toBeLessThan(1e-6);
    expect(Math.abs(bottomA.y - (bottom.y + delta))).toBeLessThan(1e-6);
    expect(Math.abs(bottomA.height - (bottom.height - delta))).toBeLessThan(1e-6);
  });
});
