import { describe, it, expect } from 'vitest';
import { DashboardModel } from '@pebbledash/core';

describe('DashboardModel.getSeamRange', () => {
  it('returns consistent min/max for shared seams', async () => {
    const model = new DashboardModel({ minTile: { width: 5, height: 5 } });
    await model.initialize();
    const first = model.getState().toArray()[0];
    await model.splitTile(first.id, { orientation: 'vertical', ratio: 0.6 });
    const [left, right] = model
      .getState()
      .toArray()
      .sort((a, b) => a.x - b.x);
    const rangeLeft = model.getSeamRange(left.id, 'right');
    const rangeRight = model.getSeamRange(right.id, 'left');
    expect(rangeLeft.min).toBeLessThanOrEqual(0);
    expect(rangeLeft.max).toBeGreaterThan(0);
    expect(rangeLeft.min).toBe(rangeRight.min);
    expect(rangeLeft.max).toBe(rangeRight.max);
  });
});
