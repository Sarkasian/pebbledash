import type { DashboardState } from '../entities/DashboardState.js';
import type { TileId } from '../index.js';
import type { SeamOption } from '../operations/seam-graph.js';

/**
 * Strategy interface for resize operations.
 * Implement this to customize how tiles are resized.
 */
export interface ResizeStrategy {
  /** Unique identifier for this strategy */
  key: string;
  /**
   * Compute a new state after resizing a tile.
   * @param state - Current dashboard state
   * @param tileId - ID of the tile to resize
   * @param edge - Which edge to move
   * @param delta - Amount to move the edge
   * @param opts - Optional constraints
   * @returns New dashboard state with resize applied
   */
  compute(
    state: DashboardState,
    tileId: TileId,
    edge: 'left' | 'right' | 'top' | 'bottom',
    delta: number,
    opts?: { minTile?: { width: number; height: number }; epsilon?: number; useSeamCore?: boolean },
  ): DashboardState;
}

/**
 * Strategy interface for split operations.
 * Implement this to customize how tiles are split.
 */
export interface SplitStrategy {
  /** Unique identifier for this strategy */
  key: string;
  /**
   * Compute a new state after splitting a tile.
   * @param state - Current dashboard state
   * @param tileId - ID of the tile to split
   * @param orientation - Direction of the split
   * @param ratio - Split ratio (default: 0.5)
   * @returns New dashboard state with split applied
   */
  compute(
    state: DashboardState,
    tileId: TileId,
    orientation: 'horizontal' | 'vertical',
    ratio?: number,
  ): DashboardState;
}

/**
 * Strategy interface for delete operations.
 * Implement this to customize how deleted tile space is reclaimed.
 */
export interface DeleteStrategy {
  /** Unique identifier for this strategy */
  key: string;
  /**
   * Choose which neighboring tiles should expand to fill deleted space.
   * @param options - Available options for filling the space
   * @returns The chosen option, or undefined if none is valid
   */
  choose(options: SeamOption[]): SeamOption | undefined;
}

/**
 * Registry for resize, split, and delete strategies.
 *
 * Allows customization of tile operations by registering different strategies.
 *
 * @example
 * ```typescript
 * const registry = new StrategyRegistry();
 *
 * // Register a custom strategy
 * registry.registerResize(myCustomResizeStrategy);
 *
 * // Activate it
 * registry.setActiveResize('my-custom');
 * ```
 */
export class StrategyRegistry {
  private resize = new Map<string, ResizeStrategy>();
  private split = new Map<string, SplitStrategy>();
  private del = new Map<string, DeleteStrategy>();
  private active = { resize: 'linear', split: 'equal', del: 'heuristic' };

  registerResize(s: ResizeStrategy): void {
    this.resize.set(s.key, s);
  }
  registerSplit(s: SplitStrategy): void {
    this.split.set(s.key, s);
  }
  registerDelete(s: DeleteStrategy): void {
    this.del.set(s.key, s);
  }

  setActiveResize(key: string): void {
    if (!this.resize.has(key)) throw new Error(`Unknown resize strategy ${key}`);
    this.active.resize = key;
  }
  setActiveSplit(key: string): void {
    if (!this.split.has(key)) throw new Error(`Unknown split strategy ${key}`);
    this.active.split = key;
  }
  setActiveDelete(key: string): void {
    if (!this.del.has(key)) throw new Error(`Unknown delete strategy ${key}`);
    this.active.del = key;
  }

  getResize(): ResizeStrategy {
    const s = this.resize.get(this.active.resize);
    if (!s) throw new Error('No active resize strategy');
    return s;
  }
  getSplit(): SplitStrategy {
    const s = this.split.get(this.active.split);
    if (!s) throw new Error('No active split strategy');
    return s;
  }
  getDelete(): DeleteStrategy {
    const s = this.del.get(this.active.del);
    if (!s) throw new Error('No active delete strategy');
    return s;
  }
}
