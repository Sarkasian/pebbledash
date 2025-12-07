import type { Tile } from '../entities/Tile.js';

export interface SnapshotV1 {
  version: 1;
  tiles: Array<Pick<Tile, 'id' | 'x' | 'y' | 'width' | 'height' | 'locked' | 'meta'>>;
}

export interface PersistenceAdapter {
  save(key: string, snapshot: SnapshotV1): Promise<void>;
  load(key: string): Promise<SnapshotV1 | null>;
  list(prefix?: string): Promise<string[]>;
}
