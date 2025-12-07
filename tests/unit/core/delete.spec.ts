import { describe, it, expect } from 'vitest';
import { DashboardModel, type TileId, DashboardState } from '../../../packages/core/src/index';

const id = (s: string) => s as TileId;

function withGroups(model: DashboardModel, groups: Record<string, string[]>) {
  const g = new Map<string, Set<TileId>>();
  for (const [gid, members] of Object.entries(groups)) {
    g.set(gid, new Set(members.map((m) => id(m))));
  }
  const tiles = model.getState().toArray();
  (model as any).state = new DashboardState({ tiles, groups: g });
}

describe('Delete operation (strategy + constraints)', () => {
  it('deletes a left tile and expands right neighbor (ungrouped)', async () => {
    const model = new DashboardModel();
    await model.initialize({
      layout: {
        tiles: [
          { id: id('L'), x: 0, y: 0, width: 60, height: 100 },
          { id: id('R'), x: 60, y: 0, width: 40, height: 100 },
        ],
      },
    });
    const res = await model.deleteTile(id('L'));
    expect(res.valid).toBe(true);
    const tiles = model.getState().toArray();
    expect(tiles).toHaveLength(1);
    expect(tiles[0].x).toBeCloseTo(0, 6);
    expect(tiles[0].y).toBeCloseTo(0, 6);
    expect(tiles[0].width).toBeCloseTo(100, 6);
    expect(tiles[0].height).toBeCloseTo(100, 6);
  });

  it('chooses left side when both sides are feasible (minimizes segments)', async () => {
    const model = new DashboardModel();
    await model.initialize({
      layout: {
        tiles: [
          { id: id('A'), x: 0, y: 0, width: 50, height: 100 },
          { id: id('T'), x: 50, y: 0, width: 20, height: 100 },
          { id: id('B'), x: 70, y: 0, width: 30, height: 100 },
        ],
      },
    });
    const res = await model.deleteTile(id('T'));
    expect(res.valid).toBe(true);
    const tiles = model
      .getState()
      .toArray()
      .sort((a, b) => a.x - b.x);
    expect(tiles).toHaveLength(2);
    const left = tiles[0];
    const right = tiles[1];
    expect(left.width).toBeCloseTo(70, 6);
    expect(right.width).toBeCloseTo(30, 6);
  });

  it('enforces group policy: must fill from within group if group size > 1', async () => {
    const model = new DashboardModel();
    await model.initialize({
      layout: {
        tiles: [
          { id: id('G1'), x: 0, y: 0, width: 60, height: 100 },
          { id: id('T'), x: 60, y: 0, width: 40, height: 100 },
        ],
      },
    });
    withGroups(model, { g: ['G1', 'T'] });
    const res = await model.deleteTile(id('T'));
    expect(res.valid).toBe(true);
    const tiles = model.getState().toArray();
    expect(tiles).toHaveLength(1);
    expect(tiles[0].id).toBe(id('G1'));
    expect(tiles[0].width).toBeCloseTo(100, 6);
  });

  it('rejects delete when grouped tile has no adjacent same-group neighbor', async () => {
    const model = new DashboardModel();
    await model.initialize({
      layout: {
        tiles: [
          { id: id('L'), x: 0, y: 0, width: 60, height: 100 },
          { id: id('T'), x: 60, y: 0, width: 40, height: 100 },
        ],
      },
    });
    // Group T with a non-adjacent phantom id (not in layout) or different location. We'll reuse L but different group membership
    withGroups(model, { g: ['T', 'X'] }); // 'X' not in layout -> effectively no same-group neighbor
    const res = await model.deleteTile(id('T'));
    expect(res.valid).toBe(false);
    expect(res.violations.some((v) => v.code === 'GroupIsolated')).toBe(true);
  });

  it('last member of group may delete and allow cross-group fill', async () => {
    const model = new DashboardModel();
    await model.initialize({
      layout: {
        tiles: [
          { id: id('L'), x: 0, y: 0, width: 60, height: 100 },
          { id: id('T'), x: 60, y: 0, width: 40, height: 100 },
        ],
      },
    });
    withGroups(model, { g: ['T'] });
    const res = await model.deleteTile(id('T'));
    expect(res.valid).toBe(true);
    const tiles = model.getState().toArray();
    expect(tiles).toHaveLength(1);
    expect(tiles[0].id).toBe(id('L'));
    expect(tiles[0].width).toBeCloseTo(100, 6);
  });

  it('fails when only full-span option is blocked by locked neighbor', async () => {
    const model = new DashboardModel();
    await model.initialize({
      layout: {
        tiles: [
          { id: id('L'), x: 0, y: 0, width: 60, height: 100, locked: true },
          { id: id('T'), x: 60, y: 0, width: 40, height: 100 },
        ],
      },
    });
    const res = await model.deleteTile(id('T'));
    expect(res.valid).toBe(false);
    expect(res.violations.some((v) => v.code === 'NeighborLocked')).toBe(true);
  });
});
