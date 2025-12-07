import type { TileId } from '../index.js';
import { EPSILON, area, overlaps, withinBounds } from '../utils/geometry.js';
import { Tile } from './Tile.js';
import type { Seam } from './Seam.js';
import { makeSeamId } from './Seam.js';

/**
 * Initialization options for DashboardState.
 */
export interface DashboardStateInit {
  /** The tiles in the dashboard */
  tiles: Iterable<Tile>;
  /** Optional tile groups for coordinated behavior */
  groups?: Map<string, Set<TileId>>;
}

/**
 * Immutable snapshot of the dashboard layout.
 *
 * DashboardState represents a valid, complete tiling of the dashboard container.
 * It enforces invariants: no overlaps, no gaps, all tiles within bounds.
 *
 * @example
 * ```typescript
 * const state = new DashboardState({
 *   tiles: [
 *     new Tile({ id: 'left', x: 0, y: 0, width: 50, height: 100 }),
 *     new Tile({ id: 'right', x: 50, y: 0, width: 50, height: 100 })
 *   ]
 * });
 *
 * console.log(state.toArray().length); // 2
 * console.log(state.seams.size); // Number of seams
 * ```
 */
export class DashboardState {
  /** Map of tile ID to Tile instance */
  readonly tiles: Map<TileId, Tile>;
  /** Optional tile groups for coordinated behavior */
  readonly groups?: Map<string, Set<TileId>>;
  /** Version number incremented on each adjacency-changing operation */
  readonly adjacencyVersion: number;
  /** Computed seams (shared edges) between tiles */
  readonly seams: Map<string, Seam>;

  /**
   * Creates a new DashboardState.
   * @param init - Initialization options
   * @param adjacencyVersion - Version number (default: 0)
   * @throws Error if tiles overlap
   * @throws Error if tiles are out of bounds
   * @throws Error if total tile area doesn't equal container area
   */
  constructor(init: DashboardStateInit, adjacencyVersion = 0) {
    this.tiles = new Map(Array.from(init.tiles, (t) => [t.id, t]));
    this.groups = init.groups ? cloneGroups(init.groups) : undefined;
    this.adjacencyVersion = adjacencyVersion;
    validateNoOverlapAndBounds(this.tiles);
    this.seams = buildSeamsFromTiles(this.tiles, EPSILON);
    Object.freeze(this);
  }

  /**
   * Create a new state with different tiles.
   * @param tiles - The new tiles
   * @returns A new DashboardState with incremented adjacency version
   */
  withTiles(tiles: Iterable<Tile>): DashboardState {
    return new DashboardState({ tiles, groups: this.groups }, this.adjacencyVersion + 1);
  }

  /**
   * Get all tiles as an array.
   * @returns Array of all tiles in the state
   */
  toArray(): Tile[] {
    return Array.from(this.tiles.values());
  }
}

export function validateNoOverlapAndBounds(tiles: Map<TileId, Tile>): void {
  const list = Array.from(tiles.values());
  // Bounds and positive dimensions
  for (const t of list) {
    if (!withinBounds(t)) {
      throw new Error(`Tile ${t.id} is out of bounds`);
    }
    if (t.width <= EPSILON || t.height <= EPSILON) {
      throw new Error(`Tile ${t.id} has non-positive size`);
    }
  }
  // No overlaps
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const t1 = list[i];
      const t2 = list[j];
      if (t1 && t2 && overlaps(t1, t2)) {
        throw new Error(`Tiles ${t1.id} and ${t2.id} overlap`);
      }
    }
  }
  // Area check (approximate no-gaps constraint)
  const sumArea = list.reduce((acc, t) => acc + area(t), 0);
  const containerArea = 100 * 100;
  if (Math.abs(sumArea - containerArea) > 1e-1) {
    throw new Error(`Total area ${sumArea} != ${containerArea}`);
  }
}

function cloneGroups(src: Map<string, Set<TileId>>): Map<string, Set<TileId>> {
  const out = new Map<string, Set<TileId>>();
  for (const [k, v] of src.entries()) out.set(k, new Set(v));
  return out;
}

function buildSeamsFromTiles(tiles: Map<TileId, Tile>, eps: number): Map<string, Seam> {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const t of tiles.values()) {
    xs.push(t.x, t.x + t.width);
    ys.push(t.y, t.y + t.height);
  }
  xs.sort((a, b) => a - b);
  ys.sort((a, b) => a - b);
  const snapAxis = (vals: number[]) => {
    const out: number[] = [];
    let anchor: number | undefined;
    for (const v of vals) {
      if (anchor === undefined || Math.abs(v - anchor) > eps) {
        anchor = v;
        out.push(anchor);
      }
    }
    return out;
  };
  const vx = snapAxis(xs);
  const vy = snapAxis(ys);
  const seams = new Map<string, Seam>();
  for (const x of vx) {
    const id = makeSeamId('vertical', x);
    seams.set(id, { id, orientation: 'vertical', coord: x });
  }
  for (const y of vy) {
    const id = makeSeamId('horizontal', y);
    seams.set(id, { id, orientation: 'horizontal', coord: y });
  }
  return seams;
}
