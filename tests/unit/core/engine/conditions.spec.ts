import { describe, it, expect } from 'vitest';
import { Tile, type TileId } from '../../../../packages/core/src/index';
import {
  BoundsValid,
  TileExists,
  NotLocked,
  MinTileSize,
  MaxTileCount,
} from '../../../../packages/core/src/internal';

const id = (s: string) => s as TileId;

const baseCtx = (tiles: Tile[], config: Record<string, unknown> = {}) => ({
  state: { tiles: new Map(tiles.map((t) => [t.id, t])), adjacencyVersion: 0 } as any,
  op: 'validate' as const,
  params: {} as any,
  config,
});

describe('Core conditions', () => {
  it('BoundsValid', async () => {
    const t = new Tile({ id: id('t1'), x: 0, y: 0, width: 100, height: 100 });
    const res = await BoundsValid().evaluate(baseCtx([t]) as any);
    expect(res.valid).toBe(true);
  });

  it('TileExists + NotLocked + MinTileSize + MaxTileCount', async () => {
    const a = new Tile({ id: id('a'), x: 0, y: 0, width: 50, height: 100 });
    const b = new Tile({ id: id('b'), x: 50, y: 0, width: 50, height: 100, locked: true });
    const ctx1 = baseCtx([a, b], { minTile: { width: 40, height: 40 }, maxTiles: 2 });
    const res1 = await TileExists().evaluate({ ...ctx1, params: { tileId: id('a') } } as any);
    expect(res1.valid).toBe(true);
    const res2 = await NotLocked().evaluate({ ...ctx1, params: { tileId: id('b') } } as any);
    expect(res2.valid).toBe(false);
    const res3 = await MinTileSize().evaluate({ ...ctx1, params: { tileId: id('a') } } as any);
    expect(res3.valid).toBe(true);
    const res4 = await MaxTileCount().evaluate(ctx1 as any);
    expect(res4.valid).toBe(true);
  });
});
