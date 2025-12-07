import type { TileId } from '../index.js';

export class TileGroup {
  readonly id: string;
  readonly tiles: ReadonlySet<TileId>;

  constructor(id: string, tiles: Iterable<TileId> = []) {
    this.id = id;
    this.tiles = new Set(tiles);
    Object.freeze(this);
  }

  add(tileId: TileId): TileGroup {
    const next = new Set(this.tiles);
    next.add(tileId);
    return new TileGroup(this.id, next);
  }

  remove(tileId: TileId): TileGroup {
    const next = new Set(this.tiles);
    next.delete(tileId);
    return new TileGroup(this.id, next);
  }
}
