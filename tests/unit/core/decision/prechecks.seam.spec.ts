import { describe, it, expect } from 'vitest';
import { DashboardModel, type TileId } from '../../../../packages/core/src/index';

describe('Decision engine seam prechecks', () => {
  it('seam:resize allowed even when chain not fully covered', async () => {
    const model = new DashboardModel();
    await model.initialize();
    const only = model.getState().toArray()[0];
    // Split vertical 50/50
    await model.splitTile(only.id, { orientation: 'vertical', ratio: 0.5 });
    // No stacking on either side => coverage is full, make it non-covered by deleting right? Not allowed; instead test with outer seam at x=0 (no neighbors one side)
    const res = await (model as any).resizeSeam('seam|v|0.000000', 5);
    expect(res.valid).toBe(true);
  });

  it('seam:resize valid when chain fully covered', async () => {
    const model = new DashboardModel();
    await model.initialize();
    const only = model.getState().toArray()[0];
    // Build L (two stacked left) and one R full-span
    await model.splitTile(only.id, { orientation: 'vertical', ratio: 0.5 });
    const [left, _right] = model
      .getState()
      .toArray()
      .sort((a, b) => a.x - b.x);
    await model.splitTile(left.id as TileId, { orientation: 'horizontal', ratio: 0.5 });
    const seamX = left.x + left.width;
    const res = await (model as any).resizeSeam(`seam|v|${seamX.toFixed(6)}`, 5);
    expect(res.valid).toBe(true);
  });
});
