import type { TileId } from '../index.js';
import { Tile } from '../entities/Tile.js';
import { TileRepository } from '../repository/TileRepository.js';

type TileEvent =
  | { type: 'tile:added'; tile: Tile }
  | { type: 'tile:updated'; prev: Tile; next: Tile }
  | { type: 'tile:removed'; tile: Tile };

type Handler = (e: TileEvent) => void;

export class TileState {
  private readonly repo = new TileRepository();
  private readonly handlers = new Set<Handler>();

  on(handler: Handler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  addTile(tile: Tile): void {
    this.repo.add(tile);
    this.emit({ type: 'tile:added', tile });
  }

  updateTile(tileId: TileId, patch: Partial<Omit<Tile, 'id'>>): Tile {
    const prev = this.repo.require(tileId);
    const next = this.repo.update(tileId, (p) => p.with(patch));
    this.emit({ type: 'tile:updated', prev, next });
    return next;
  }

  removeTile(tileId: TileId): Tile | undefined {
    const removed = this.repo.remove(tileId);
    if (removed) this.emit({ type: 'tile:removed', tile: removed });
    return removed;
  }

  getTile(tileId: TileId): Tile | undefined {
    return this.repo.get(tileId);
  }

  getAllTiles(): Tile[] {
    return this.repo.all();
  }

  has(tileId: TileId): boolean {
    return this.repo.has(tileId);
  }

  clear(): void {
    this.repo.clear();
  }

  private emit(e: TileEvent) {
    for (const h of this.handlers) h(e);
  }
}
