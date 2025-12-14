import type { Tile } from '../entities/Tile.js';
import type { PartialExtendedConfig, TileConstraints } from '../config/types.js';

/** Tile data with optional per-tile constraints */
export interface TileSnapshot {
  id: Tile['id'];
  x: number;
  y: number;
  width: number;
  height: number;
  locked?: boolean;
  meta?: Record<string, unknown>;
  /** Per-tile constraints (V2+) */
  constraints?: TileConstraints;
}

export interface SnapshotV1 {
  version: 1;
  tiles: Array<Pick<Tile, 'id' | 'x' | 'y' | 'width' | 'height' | 'locked' | 'meta'>>;
}

/** V2 snapshot with optional settings and per-tile constraints */
export interface SnapshotV2 {
  version: 2;
  tiles: TileSnapshot[];
  /** Optional dashboard-level settings */
  settings?: PartialExtendedConfig;
}

/** Union type for all snapshot versions */
export type Snapshot = SnapshotV1 | SnapshotV2;

/**
 * Check if a snapshot is V2
 */
export function isSnapshotV2(snapshot: Snapshot): snapshot is SnapshotV2 {
  return snapshot.version === 2;
}

/**
 * Migrate a V1 snapshot to V2
 */
export function migrateSnapshotToV2(snapshot: SnapshotV1): SnapshotV2 {
  return {
    version: 2,
    tiles: snapshot.tiles.map(t => ({
      id: t.id,
      x: t.x,
      y: t.y,
      width: t.width,
      height: t.height,
      locked: t.locked,
      meta: t.meta,
    })),
  };
}

export interface PersistenceAdapter {
  save(key: string, snapshot: Snapshot): Promise<void>;
  load(key: string): Promise<Snapshot | null>;
  list(prefix?: string): Promise<string[]>;
}
