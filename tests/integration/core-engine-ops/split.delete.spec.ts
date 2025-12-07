import { describe, it, expect } from 'vitest';
import { DashboardModel } from '../../../packages/core/src/index';

describe('Operations: split/delete', () => {
  it('initializes and splits a full-screen tile vertically', async () => {
    const model = new DashboardModel();
    await model.initialize();
    const state1 = model.getState();
    const first = state1.toArray()[0];
    const res = await model.splitTile(first.id, { orientation: 'vertical', ratio: 0.5 });
    expect(res.valid).toBe(true);
    const tiles = model.getState().toArray();
    expect(tiles).toHaveLength(2);
    expect(tiles[0].width + tiles[1].width).toBeCloseTo(100);
  });

  it('deletes a tile and keeps perfect tiling', async () => {
    const model = new DashboardModel();
    await model.initialize();
    let t0 = model.getState().toArray()[0];
    await model.splitTile(t0.id, { orientation: 'vertical', ratio: 0.5 });
    const [a, _b] = model.getState().toArray();
    const res = await model.deleteTile(a.id);
    expect(res.valid).toBe(true);
    const tiles = model.getState().toArray();
    expect(tiles).toHaveLength(1);
    expect(tiles[0].width).toBeCloseTo(100);
  });
});
