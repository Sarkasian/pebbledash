import { describe, it, expect } from 'vitest';
import { DashboardModel } from '../../../packages/core/src/index';
import { applySeamDelta, seamIdForEdge } from '../../../packages/core/src/seams';

describe('applySeamDelta conserves total area and adjusts neighbors correctly', () => {
  it('vertical seam move: left widens by +d, right shrinks by -d', async () => {
    const model = new DashboardModel();
    await model.initialize();
    const only = model.getState().toArray()[0];
    await model.splitTile(only.id, { orientation: 'vertical', ratio: 0.5 });
    const before = model.getState();
    const [left, right] = before.toArray().sort((a, b) => a.x - b.x);
    const seamId = seamIdForEdge(before, 'vertical', left.x + left.width);
    const delta = 7.5;
    const after = applySeamDelta(before, seamId, delta, { epsilon: 1e-6 });
    const [la, ra] = after.toArray().sort((a, b) => a.x - b.x);
    expect(Math.abs(la.width - (left.width + delta))).toBeLessThan(1e-6);
    expect(Math.abs(ra.width - (right.width - delta))).toBeLessThan(1e-6);
    const areaBefore = before.toArray().reduce((s, t) => s + t.width * t.height, 0);
    const areaAfter = after.toArray().reduce((s, t) => s + t.width * t.height, 0);
    expect(Math.abs(areaBefore - areaAfter)).toBeLessThan(1e-6);
  });
});
