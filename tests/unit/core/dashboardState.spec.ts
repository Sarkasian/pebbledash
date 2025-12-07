import { describe, it, expect } from 'vitest';
import { DashboardState, Tile, type TileId } from '../../../packages/core/src/index';

function id(s: string) {
  return s as TileId;
}

describe('DashboardState', () => {
  it('accepts a full-screen single tile', () => {
    const t = new Tile({ id: id('t1'), x: 0, y: 0, width: 100, height: 100 });
    const s = new DashboardState({ tiles: [t] });
    expect(s.tiles.size).toBe(1);
  });

  it('throws on overlaps', () => {
    const a = new Tile({ id: id('a'), x: 0, y: 0, width: 60, height: 100 });
    const b = new Tile({ id: id('b'), x: 40, y: 0, width: 60, height: 100 });
    expect(() => new DashboardState({ tiles: [a, b] })).toThrow();
  });

  it('throws on out-of-bounds', () => {
    expect(() => new Tile({ id: id('t'), x: 0, y: 0, width: 101, height: 100 })).toThrow();
  });
});
