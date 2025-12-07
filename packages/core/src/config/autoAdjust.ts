import type { TileId } from '../index.js';
import type { DashboardState } from '../entities/DashboardState.js';
import { Tile } from '../entities/Tile.js';
import type { ExtendedConfig, TileConstraints } from './types.js';
import {
  getEffectiveMinWidth,
  getEffectiveMinHeight,
  getEffectiveMaxWidth,
  getEffectiveMaxHeight,
} from './defaults.js';

/**
 * Result of an auto-adjustment operation.
 */
export interface AutoAdjustResult {
  /** Whether adjustment was successful */
  success: boolean;
  /** New state after adjustment (null if failed) */
  newState: DashboardState | null;
  /** IDs of tiles that were adjusted */
  adjustedTiles: TileId[];
  /** IDs of tiles that violate constraints (if adjustment failed) */
  violatingTiles: TileId[];
  /** Error message if adjustment failed */
  error?: string;
}

/**
 * Information about a constraint violation.
 */
interface ViolationInfo {
  tileId: TileId;
  tile: Tile;
  violations: Array<{
    type: 'minWidth' | 'minHeight' | 'maxWidth' | 'maxHeight' | 'aspectRatio';
    current: number;
    required: number;
  }>;
}

/**
 * Auto-adjust the layout when config changes would invalidate existing tiles.
 *
 * This function uses smart reflow to redistribute space when tiles violate
 * new constraints (e.g., minTile increased beyond existing tile sizes).
 *
 * Strategy:
 * 1. Identify violating tiles
 * 2. Try proportional scaling first
 * 3. Fall back to more aggressive redistribution if needed
 *
 * @param state - Current dashboard state
 * @param newConfig - New configuration to apply
 * @param tileConstraints - Per-tile constraint overrides
 * @returns Auto-adjustment result
 */
export function autoAdjustLayout(
  state: DashboardState,
  newConfig: ExtendedConfig,
  tileConstraints: Map<TileId, TileConstraints> = new Map(),
): AutoAdjustResult {
  const tiles = state.toArray();

  // Find all violations
  const violations = findViolations(tiles, newConfig, tileConstraints);

  if (violations.length === 0) {
    // No violations - no adjustment needed
    return {
      success: true,
      newState: state,
      adjustedTiles: [],
      violatingTiles: [],
    };
  }

  // Try to fix violations
  // Note: adjustedTiles map is populated by tryProportionalAdjustment

  // Strategy 1: Try proportional scaling for undersized tiles
  const result = tryProportionalAdjustment(tiles, violations, newConfig, tileConstraints);

  if (result.success) {
    // Validate the adjusted tiles still form a valid layout
    try {
      const newTiles = tiles.map((t) => result.adjustedTiles.get(t.id) ?? t);
      const newState = state.withTiles(newTiles);

      return {
        success: true,
        newState,
        adjustedTiles: Array.from(result.adjustedTiles.keys()),
        violatingTiles: [],
      };
    } catch {
      // Layout validation failed - fall through to more aggressive strategies
    }
  }

  // Strategy 2: Try redistributing space from neighbors
  const redistributeResult = tryRedistributeFromNeighbors(
    tiles,
    violations,
    newConfig,
    tileConstraints,
  );

  if (redistributeResult.success) {
    try {
      const newTiles = tiles.map((t) => redistributeResult.adjustedTiles.get(t.id) ?? t);
      const newState = state.withTiles(newTiles);

      return {
        success: true,
        newState,
        adjustedTiles: Array.from(redistributeResult.adjustedTiles.keys()),
        violatingTiles: [],
      };
    } catch {
      // Still failed
    }
  }

  // All strategies failed - return the violations
  return {
    success: false,
    newState: null,
    adjustedTiles: [],
    violatingTiles: violations.map((v) => v.tileId),
    error: `Cannot adjust layout: ${violations.length} tile(s) would violate constraints and cannot be automatically fixed`,
  };
}

/**
 * Find all tiles that violate constraints.
 */
function findViolations(
  tiles: Tile[],
  config: ExtendedConfig,
  tileConstraints: Map<TileId, TileConstraints>,
): ViolationInfo[] {
  const violations: ViolationInfo[] = [];

  for (const tile of tiles) {
    const constraints = tileConstraints.get(tile.id);
    const tileViolations: ViolationInfo['violations'] = [];

    const minWidth = getEffectiveMinWidth(config, constraints?.minWidth);
    const minHeight = getEffectiveMinHeight(config, constraints?.minHeight);
    const maxWidth = getEffectiveMaxWidth(config, constraints?.maxWidth);
    const maxHeight = getEffectiveMaxHeight(config, constraints?.maxHeight);

    if (tile.width < minWidth) {
      tileViolations.push({
        type: 'minWidth',
        current: tile.width,
        required: minWidth,
      });
    }

    if (tile.height < minHeight) {
      tileViolations.push({
        type: 'minHeight',
        current: tile.height,
        required: minHeight,
      });
    }

    if (tile.width > maxWidth) {
      tileViolations.push({
        type: 'maxWidth',
        current: tile.width,
        required: maxWidth,
      });
    }

    if (tile.height > maxHeight) {
      tileViolations.push({
        type: 'maxHeight',
        current: tile.height,
        required: maxHeight,
      });
    }

    // Check aspect ratio if specified
    const aspectRatio = constraints?.aspectRatio ?? config.tileDefaults.aspectRatio;
    if (aspectRatio !== null && aspectRatio !== undefined) {
      const currentRatio = tile.width / tile.height;
      const tolerance = config.epsilon ?? 1e-6;
      if (Math.abs(currentRatio - aspectRatio) > tolerance) {
        tileViolations.push({
          type: 'aspectRatio',
          current: currentRatio,
          required: aspectRatio,
        });
      }
    }

    if (tileViolations.length > 0) {
      violations.push({
        tileId: tile.id,
        tile,
        violations: tileViolations,
      });
    }
  }

  return violations;
}

/**
 * Try to fix violations by proportionally adjusting tiles.
 */
function tryProportionalAdjustment(
  tiles: Tile[],
  violations: ViolationInfo[],
  config: ExtendedConfig,
  tileConstraints: Map<TileId, TileConstraints>,
): { success: boolean; adjustedTiles: Map<TileId, Tile> } {
  const adjustedTiles = new Map<TileId, Tile>();
  const epsilon = config.epsilon ?? 1e-6;

  // Group violations by type
  const widthViolations = violations.filter(
    (v) =>
      v.violations.some((vv) => vv.type === 'minWidth') ||
      v.violations.some((vv) => vv.type === 'maxWidth'),
  );
  const heightViolations = violations.filter(
    (v) =>
      v.violations.some((vv) => vv.type === 'minHeight') ||
      v.violations.some((vv) => vv.type === 'maxHeight'),
  );

  // Process width violations
  for (const violation of widthViolations) {
    const { tile } = violation;
    const constraints = tileConstraints.get(tile.id);
    const minWidth = getEffectiveMinWidth(config, constraints?.minWidth);
    const maxWidth = getEffectiveMaxWidth(config, constraints?.maxWidth);

    let newWidth = tile.width;
    if (tile.width < minWidth) {
      newWidth = minWidth;
    } else if (tile.width > maxWidth) {
      newWidth = maxWidth;
    }

    if (Math.abs(newWidth - tile.width) > epsilon) {
      // Find horizontal neighbors to steal/give space
      const widthDelta = newWidth - tile.width;
      const neighbors = findHorizontalNeighbors(tile, tiles);

      if (neighbors.length > 0) {
        // Distribute the delta among neighbors
        const deltaPerNeighbor = widthDelta / neighbors.length;

        for (const neighbor of neighbors) {
          const existingAdjusted = adjustedTiles.get(neighbor.id);
          const neighborTile = existingAdjusted ?? neighbor;

          const neighborConstraints = tileConstraints.get(neighbor.id);
          const neighborMinWidth = getEffectiveMinWidth(config, neighborConstraints?.minWidth);

          const neighborNewWidth = neighborTile.width - deltaPerNeighbor;

          // Check if neighbor can accommodate the change
          if (neighborNewWidth < neighborMinWidth) {
            // Can't adjust this way
            return { success: false, adjustedTiles: new Map() };
          }

          // Adjust neighbor
          const adjustedNeighbor = new Tile({
            ...neighborTile,
            width: neighborNewWidth,
            x: neighborTile.x + (deltaPerNeighbor > 0 ? deltaPerNeighbor : 0),
          });
          adjustedTiles.set(neighbor.id, adjustedNeighbor);
        }

        // Adjust the violating tile
        const adjustedTile = new Tile({
          ...tile,
          width: newWidth,
        });
        adjustedTiles.set(tile.id, adjustedTile);
      }
    }
  }

  // Process height violations (similar logic)
  for (const violation of heightViolations) {
    const { tile } = violation;
    const existingAdjusted = adjustedTiles.get(tile.id);
    const currentTile = existingAdjusted ?? tile;

    const constraints = tileConstraints.get(tile.id);
    const minHeight = getEffectiveMinHeight(config, constraints?.minHeight);
    const maxHeight = getEffectiveMaxHeight(config, constraints?.maxHeight);

    let newHeight = currentTile.height;
    if (currentTile.height < minHeight) {
      newHeight = minHeight;
    } else if (currentTile.height > maxHeight) {
      newHeight = maxHeight;
    }

    if (Math.abs(newHeight - currentTile.height) > epsilon) {
      const heightDelta = newHeight - currentTile.height;
      const neighbors = findVerticalNeighbors(tile, tiles);

      if (neighbors.length > 0) {
        const deltaPerNeighbor = heightDelta / neighbors.length;

        for (const neighbor of neighbors) {
          const existingNeighbor = adjustedTiles.get(neighbor.id);
          const neighborTile = existingNeighbor ?? neighbor;

          const neighborConstraints = tileConstraints.get(neighbor.id);
          const neighborMinHeight = getEffectiveMinHeight(config, neighborConstraints?.minHeight);

          const neighborNewHeight = neighborTile.height - deltaPerNeighbor;

          if (neighborNewHeight < neighborMinHeight) {
            return { success: false, adjustedTiles: new Map() };
          }

          const adjustedNeighbor = new Tile({
            ...neighborTile,
            height: neighborNewHeight,
            y: neighborTile.y + (deltaPerNeighbor > 0 ? deltaPerNeighbor : 0),
          });
          adjustedTiles.set(neighbor.id, adjustedNeighbor);
        }

        const adjustedTile = new Tile({
          ...currentTile,
          height: newHeight,
        });
        adjustedTiles.set(tile.id, adjustedTile);
      }
    }
  }

  // Check if we successfully adjusted all violations
  const remainingViolations = findViolations(
    tiles.map((t) => adjustedTiles.get(t.id) ?? t),
    config,
    tileConstraints,
  );

  return {
    success: remainingViolations.length === 0,
    adjustedTiles,
  };
}

/**
 * Try to fix violations by redistributing space from neighbors.
 * More aggressive than proportional adjustment.
 */
function tryRedistributeFromNeighbors(
  tiles: Tile[],
  violations: ViolationInfo[],
  config: ExtendedConfig,
  tileConstraints: Map<TileId, TileConstraints>,
): { success: boolean; adjustedTiles: Map<TileId, Tile> } {
  // For now, use the same logic as proportional adjustment
  // This can be enhanced with more sophisticated redistribution strategies
  return tryProportionalAdjustment(tiles, violations, config, tileConstraints);
}

/**
 * Find tiles that are horizontal neighbors of the given tile.
 */
function findHorizontalNeighbors(tile: Tile, allTiles: Tile[]): Tile[] {
  const epsilon = 1e-6;
  const neighbors: Tile[] = [];

  for (const other of allTiles) {
    if (other.id === tile.id) continue;

    // Check if tiles share a vertical seam (are horizontally adjacent)
    const tileRight = tile.x + tile.width;
    const otherRight = other.x + other.width;

    // Other is to the right of tile
    if (Math.abs(other.x - tileRight) < epsilon) {
      // Check vertical overlap
      if (hasVerticalOverlap(tile, other, epsilon)) {
        neighbors.push(other);
      }
    }
    // Other is to the left of tile
    else if (Math.abs(otherRight - tile.x) < epsilon) {
      if (hasVerticalOverlap(tile, other, epsilon)) {
        neighbors.push(other);
      }
    }
  }

  return neighbors;
}

/**
 * Find tiles that are vertical neighbors of the given tile.
 */
function findVerticalNeighbors(tile: Tile, allTiles: Tile[]): Tile[] {
  const epsilon = 1e-6;
  const neighbors: Tile[] = [];

  for (const other of allTiles) {
    if (other.id === tile.id) continue;

    const tileBottom = tile.y + tile.height;
    const otherBottom = other.y + other.height;

    // Other is below tile
    if (Math.abs(other.y - tileBottom) < epsilon) {
      if (hasHorizontalOverlap(tile, other, epsilon)) {
        neighbors.push(other);
      }
    }
    // Other is above tile
    else if (Math.abs(otherBottom - tile.y) < epsilon) {
      if (hasHorizontalOverlap(tile, other, epsilon)) {
        neighbors.push(other);
      }
    }
  }

  return neighbors;
}

/**
 * Check if two tiles have vertical overlap (same horizontal band).
 */
function hasVerticalOverlap(a: Tile, b: Tile, epsilon: number): boolean {
  const aTop = a.y;
  const aBottom = a.y + a.height;
  const bTop = b.y;
  const bBottom = b.y + b.height;

  return aTop < bBottom - epsilon && aBottom > bTop + epsilon;
}

/**
 * Check if two tiles have horizontal overlap (same vertical band).
 */
function hasHorizontalOverlap(a: Tile, b: Tile, epsilon: number): boolean {
  const aLeft = a.x;
  const aRight = a.x + a.width;
  const bLeft = b.x;
  const bRight = b.x + b.width;

  return aLeft < bRight - epsilon && aRight > bLeft + epsilon;
}

/**
 * Check if a single tile would violate constraints.
 *
 * @param tile - The tile to check
 * @param config - Dashboard configuration
 * @param constraints - Optional per-tile constraints
 * @returns true if the tile violates any constraints
 */
export function wouldViolateConstraints(
  tile: Tile,
  config: ExtendedConfig,
  constraints?: TileConstraints,
): boolean {
  const minWidth = getEffectiveMinWidth(config, constraints?.minWidth);
  const minHeight = getEffectiveMinHeight(config, constraints?.minHeight);
  const maxWidth = getEffectiveMaxWidth(config, constraints?.maxWidth);
  const maxHeight = getEffectiveMaxHeight(config, constraints?.maxHeight);

  if (tile.width < minWidth || tile.height < minHeight) {
    return true;
  }

  if (tile.width > maxWidth || tile.height > maxHeight) {
    return true;
  }

  const aspectRatio = constraints?.aspectRatio ?? config.tileDefaults.aspectRatio;
  if (aspectRatio !== null && aspectRatio !== undefined) {
    const currentRatio = tile.width / tile.height;
    const tolerance = config.epsilon ?? 1e-6;
    if (Math.abs(currentRatio - aspectRatio) > tolerance) {
      return true;
    }
  }

  return false;
}

/**
 * Get IDs of tiles that would be affected by a config change.
 *
 * @param state - Current dashboard state
 * @param newConfig - Proposed new configuration
 * @param tileConstraints - Per-tile constraints
 * @returns Array of tile IDs that would need adjustment
 */
export function getAffectedTiles(
  state: DashboardState,
  newConfig: ExtendedConfig,
  tileConstraints: Map<TileId, TileConstraints> = new Map(),
): TileId[] {
  const tiles = state.toArray();
  const violations = findViolations(tiles, newConfig, tileConstraints);
  return violations.map((v) => v.tileId);
}
