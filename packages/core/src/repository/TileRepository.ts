import type { TileId } from '../index.js';
import { Tile } from '../entities/Tile.js';

export class TileRepository {
  private readonly byId = new Map<TileId, Tile>();
  private _version = 0;

  get version(): number {
    return this._version;
  }

  add(tile: Tile): void {
    this.byId.set(tile.id, tile);
    this.bump();
  }

  upsert(tile: Tile): void {
    this.byId.set(tile.id, tile);
    this.bump();
  }

  update(tileId: TileId, update: (prev: Tile) => Tile): Tile {
    const prev = this.require(tileId);
    const next = update(prev);
    this.byId.set(tileId, next);
    this.bump();
    return next;
  }

  remove(tileId: TileId): Tile | undefined {
    const prev = this.byId.get(tileId);
    if (prev) {
      this.byId.delete(tileId);
      this.bump();
    }
    return prev;
  }

  get(tileId: TileId): Tile | undefined {
    return this.byId.get(tileId);
  }

  require(tileId: TileId): Tile {
    const t = this.byId.get(tileId);
    if (!t) throw new Error(`Tile ${tileId} not found`);
    return t;
  }

  has(tileId: TileId): boolean {
    return this.byId.has(tileId);
  }

  all(): Tile[] {
    return Array.from(this.byId.values());
  }

  clear(): void {
    this.byId.clear();
    this.bump();
  }

  private bump() {
    this._version++;
  }
}
