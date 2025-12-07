import { describe, it, expect } from 'vitest';
import { DashboardModel, type TileId } from '../../../packages/core/src/index';

const _id = (s: string) => s as TileId;

describe('Chain-based resize across segmented neighbors', () => {
  it('resizes right edge of left tile against stacked right tiles', async () => {
    const model = new DashboardModel();
    await model.initialize();
    // Split vertically into left/right
    const only = model.getState().toArray()[0];
    await model.splitTile(only.id, { orientation: 'vertical', ratio: 0.5 });
    let [left, right] = model
      .getState()
      .toArray()
      .sort((a, b) => a.x - b.x);
    // Split the right tile horizontally into two stacks
    await model.splitTile(right.id, { orientation: 'horizontal', ratio: 0.5 });
    const tilesBefore = model.getState().toArray();
    left = tilesBefore.find((t) => t.x === 0)!;
    const rightTop = tilesBefore.find((t) => t.x > 0 && t.y === 0)!;
    const rightBottom = tilesBefore.find((t) => t.x > 0 && t.y > 0)!;
    expect(left).toBeTruthy();
    expect(rightTop).toBeTruthy();
    expect(rightBottom).toBeTruthy();
    const seamX = left.x + left.width;
    expect(Math.abs(rightTop.x - seamX)).toBeLessThan(1e-6);
    expect(Math.abs(rightBottom.x - seamX)).toBeLessThan(1e-6);

    // Move seam to the right by +5
    const res = await model.resizeTile(left.id, { edge: 'right', delta: 5 });
    expect(res.valid).toBe(true);
    const after = model.getState().toArray();
    const leftAfter = after.find((t) => t.id === left.id)!;
    const rtAfter = after.find((t) => t.id === rightTop.id)!;
    const rbAfter = after.find((t) => t.id === rightBottom.id)!;
    expect(Math.abs(leftAfter.width - (left.width + 5))).toBeLessThan(1e-6);
    expect(Math.abs(rtAfter.width - (rightTop.width - 5))).toBeLessThan(1e-6);
    expect(Math.abs(rbAfter.width - (rightBottom.width - 5))).toBeLessThan(1e-6);
    // Seam remains aligned
    const seamAfter = leftAfter.x + leftAfter.width;
    expect(Math.abs(rtAfter.x - seamAfter)).toBeLessThan(1e-6);
    expect(Math.abs(rbAfter.x - seamAfter)).toBeLessThan(1e-6);
    // Total area remains 100x100
    const area = after.map((t) => t.width * t.height).reduce((a, b) => a + b, 0);
    expect(Math.abs(area - 10000)).toBeLessThan(1e-6);
  });

  it('clamps delta by minTile to avoid undersizing neighbors', async () => {
    const model = new DashboardModel({ minTile: { width: 40, height: 40 } });
    await model.initialize();
    // Split 60/40
    const only = model.getState().toArray()[0];
    await model.splitTile(only.id, { orientation: 'vertical', ratio: 0.6 });
    let [left, right] = model
      .getState()
      .toArray()
      .sort((a, b) => a.x - b.x);
    // Split the right 40% vertically into two 20% stacks
    await model.splitTile(right.id, { orientation: 'horizontal', ratio: 0.5 });
    const before = model.getState().toArray();
    left = before.find((t) => t.x === 0)!;
    const rt = before.find((t) => t.x > 0 && t.y === 0)!;
    const rb = before.find((t) => t.x > 0 && t.y > 0)!;
    // Attempt to grow left by +30 (would push neighbors below min if not clamped)
    const res = await model.resizeTile(left.id, { edge: 'right', delta: 30 });
    expect(res.valid).toBe(true);
    const after = model.getState().toArray();
    const leftAfter = after.find((t) => t.id === left.id)!;
    const rtAfter = after.find((t) => t.id === rt.id)!;
    const rbAfter = after.find((t) => t.id === rb.id)!;
    // Neighbors must be >= 40 each → right side total >= 80, so max delta allowed is (right total - 80)
    const rightTotalBefore = rt.width + rb.width;
    const maxDelta = Math.max(0, rightTotalBefore - 80);
    expect(Math.abs(leftAfter.width - (left.width + maxDelta))).toBeLessThan(1e-6);
    expect(rtAfter.width).toBeGreaterThanOrEqual(40);
    expect(rbAfter.width).toBeGreaterThanOrEqual(40);
  });
});
