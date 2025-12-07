import { describe, it, expect } from 'vitest';
import { DashboardModel } from '../../../../packages/core/src/index';

describe('Direction semantics for interior seams', () => {
  it('right edge: positive delta moves seam right (width increases)', async () => {
    const model = new DashboardModel();
    await model.initialize();
    const only = model.getState().toArray()[0];
    // Split 60/40 so the right seam is interior
    await model.splitTile(only.id, { orientation: 'vertical', ratio: 0.6 });
    const tiles = model
      .getState()
      .toArray()
      .sort((a, b) => a.x - b.x);
    const left = tiles[0];
    const beforeX = left.x;
    const beforeW = left.width;
    const d = Math.min(5, beforeW / 2);
    const res = await model.resizeTile(left.id, { edge: 'right', delta: d });
    expect(res.valid).toBe(true);
    const after = model
      .getState()
      .toArray()
      .find((t) => t.id === left.id)!;
    expect(after.x).toBe(beforeX);
    expect(after.width).toBeGreaterThan(beforeW);
    expect(Math.abs(after.width - (beforeW + d))).toBeLessThan(1e-6);
  });

  it('bottom edge: positive delta moves seam down (height increases)', async () => {
    const model = new DashboardModel();
    await model.initialize();
    const only = model.getState().toArray()[0];
    // Split horizontally 60/40 so the bottom seam is interior
    await model.splitTile(only.id, { orientation: 'horizontal', ratio: 0.6 });
    const tiles = model
      .getState()
      .toArray()
      .sort((a, b) => a.y - b.y);
    const top = tiles[0];
    const beforeY = top.y;
    const beforeH = top.height;
    const d = Math.min(5, beforeH / 2);
    const res = await model.resizeTile(top.id, { edge: 'bottom', delta: d });
    expect(res.valid).toBe(true);
    const after = model
      .getState()
      .toArray()
      .find((t) => t.id === top.id)!;
    expect(after.y).toBe(beforeY);
    expect(after.height).toBeGreaterThan(beforeH);
    expect(Math.abs(after.height - (beforeH + d))).toBeLessThan(1e-6);
  });
});
