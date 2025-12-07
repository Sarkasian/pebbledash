import { describe, it, expect } from 'vitest';
import { Tile, validateTile, type TileId } from '../../../packages/core/src/index';

function id(s: string) {
  return s as TileId;
}

describe('Tile entity', () => {
  it('computes right, bottom, area', () => {
    const t = new Tile({ id: id('t1'), x: 0, y: 0, width: 50, height: 100 });
    expect(t.right).toBeCloseTo(50);
    expect(t.bottom).toBeCloseTo(100);
    expect(t.area).toBeCloseTo(5000);
  });

  it('validates bounds and size', () => {
    expect(() => validateTile({ id: id('bad'), x: -1, y: 0, width: 10, height: 10 })).toThrow();
    expect(() => validateTile({ id: id('bad'), x: 0, y: 0, width: 0, height: 10 })).toThrow();
  });

  it('immutably updates via with()', () => {
    const t1 = new Tile({ id: id('t1'), x: 0, y: 0, width: 50, height: 100 });
    const t2 = t1.with({ width: 60 });
    expect(t1.width).toBe(50);
    expect(t2.width).toBe(60);
  });
});
