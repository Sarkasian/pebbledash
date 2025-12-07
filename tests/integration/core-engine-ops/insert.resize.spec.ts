import { describe, it, expect } from 'vitest';
import { DashboardModel } from '../../../packages/core/src/index';

describe('Operations: insert/resize', () => {
  it('inserts a tile to the right of the only tile', async () => {
    const model = new DashboardModel();
    await model.initialize();
    const t = model.getState().toArray()[0];
    const res = await model.insertTile(t.id, { side: 'right', size: 0.4 });
    expect(res.valid).toBe(true);
    const tiles = model.getState().toArray();
    expect(tiles).toHaveLength(2);
    expect(tiles[0].width + tiles[1].width).toBeCloseTo(100);
  });

  it('resizes a tile and adjusts its neighbor', async () => {
    const model = new DashboardModel();
    await model.initialize();
    const t = model.getState().toArray()[0];
    await model.splitTile(t.id, { orientation: 'vertical', ratio: 0.5 });
    const [a, _b] = model.getState().toArray();
    const res = await model.resizeTile(a.id, { edge: 'right', delta: 5 });
    expect(res.valid).toBe(true);
    const tiles = model.getState().toArray();
    const widths = tiles.map((x) => x.width).sort();
    expect(widths[0] + widths[1]).toBeCloseTo(100);
  });
});
