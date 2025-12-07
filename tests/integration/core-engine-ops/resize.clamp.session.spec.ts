import { describe, it, expect } from 'vitest';
import { DashboardModel } from '@pebbledash/core';

describe('resize clamp session behavior', () => {
  it('ignores repeated overshoot once clamp reached', async () => {
    const model = new DashboardModel({ minTile: { width: 20, height: 20 } });
    await model.initialize();
    const first = model.getState().toArray()[0];
    await model.splitTile(first.id, { orientation: 'vertical', ratio: 0.5 });
    const [left, _right] = model
      .getState()
      .toArray()
      .sort((a, b) => a.x - b.x);
    const snapshotBefore = model.createSnapshot();
    // Overshoot clamp twice
    await model.resizeTile(left.id, { edge: 'right', delta: 200 });
    const afterFirst = model.createSnapshot();
    await model.resizeTile(left.id, { edge: 'right', delta: 200 });
    const afterSecond = model.createSnapshot();
    expect(afterFirst.tiles).toEqual(afterSecond.tiles);
    expect(afterFirst.tiles).not.toEqual(snapshotBefore.tiles);
    expect(model.getSeamRange(left.id, 'right').max).toBeGreaterThanOrEqual(0);
  });
});
