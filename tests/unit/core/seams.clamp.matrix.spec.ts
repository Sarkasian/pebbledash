import { describe, it, expect } from 'vitest';
import { DashboardModel } from '../../../packages/core/src/index';
import { clampSeamDelta, seamIdForEdge } from '../../../packages/core/src/seams';

describe('Seam clamp matrix (vertical/horizontal, mixed chains)', () => {
  it('vertical: clamp respects minTile across stacked right neighbors', async () => {
    const model = new DashboardModel({ minTile: { width: 20, height: 10 } });
    await model.initialize();
    const only = model.getState().toArray()[0];
    // Left/right split 50/50
    await model.splitTile(only.id, { orientation: 'vertical', ratio: 0.5 });
    let [left, right] = model
      .getState()
      .toArray()
      .sort((a, b) => a.x - b.x);
    // Split right into two stacks (top/bottom)
    await model.splitTile(right.id, { orientation: 'horizontal', ratio: 0.5 });
    const state = model.getState();
    const seamId = seamIdForEdge(state, 'vertical', left.x + left.width);
    const clamp = clampSeamDelta(state, seamId, +100, {
      minTile: { width: 20, height: 10 },
      epsilon: 1e-6,
    });
    // Right two neighbors each must remain >= 20 width -> max delta limited accordingly
    expect(clamp.max).toBeGreaterThanOrEqual(0);
    expect(clamp.min).toBeLessThanOrEqual(0);
    expect(clamp.chainCovered).toBe(true);
  });

  it('horizontal: clamp respects minTile across chained bottom neighbors', async () => {
    const model = new DashboardModel({ minTile: { width: 10, height: 25 } });
    await model.initialize();
    const only = model.getState().toArray()[0];
    // Top/bottom split 40/60, then split bottom vertically into 2
    await model.splitTile(only.id, { orientation: 'horizontal', ratio: 0.4 });
    let [top, bottom] = model
      .getState()
      .toArray()
      .sort((a, b) => a.y - b.y);
    await model.splitTile(bottom.id, { orientation: 'vertical', ratio: 0.5 });
    const state = model.getState();
    const seamId = seamIdForEdge(state, 'horizontal', top.y + top.height);
    const clamp = clampSeamDelta(state, seamId, +100, {
      minTile: { width: 10, height: 25 },
      epsilon: 1e-6,
    });
    expect(clamp.max).toBeGreaterThanOrEqual(0);
    expect(clamp.chainCovered).toBe(true);
  });
});
