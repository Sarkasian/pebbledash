import type { DecisionContext } from '../types.js';
import { ConditionNode } from '../nodes.js';

/**
 * Get effective minimum width for a tile, considering:
 * 1. Per-tile constraints (highest priority)
 * 2. Global minTile config (fallback)
 */
function getEffectiveMinWidth(
  tile: { constraints?: { minWidth?: number } },
  globalMin: { width: number },
): number {
  if (tile.constraints?.minWidth !== undefined) {
    return tile.constraints.minWidth;
  }
  return globalMin.width;
}

/**
 * Get effective minimum height for a tile, considering:
 * 1. Per-tile constraints (highest priority)
 * 2. Global minTile config (fallback)
 */
function getEffectiveMinHeight(
  tile: { constraints?: { minHeight?: number } },
  globalMin: { height: number },
): number {
  if (tile.constraints?.minHeight !== undefined) {
    return tile.constraints.minHeight;
  }
  return globalMin.height;
}

/**
 * Get effective maximum width for a tile.
 * Returns 100 if no constraint is set.
 */
function getEffectiveMaxWidth(tile: { constraints?: { maxWidth?: number } }): number {
  if (tile.constraints?.maxWidth !== undefined) {
    return tile.constraints.maxWidth;
  }
  return 100;
}

/**
 * Get effective maximum height for a tile.
 * Returns 100 if no constraint is set.
 */
function getEffectiveMaxHeight(tile: { constraints?: { maxHeight?: number } }): number {
  if (tile.constraints?.maxHeight !== undefined) {
    return tile.constraints.maxHeight;
  }
  return 100;
}

export function MinTileSizeAll() {
  return new ConditionNode(
    'MinTileSizeAll',
    (ctx: DecisionContext) => {
      const min = ctx.config.minTile;
      if (!min) return true;

      for (const t of ctx.state.tiles.values()) {
        // Check minimum size constraints
        const effectiveMinWidth = getEffectiveMinWidth(t, min);
        const effectiveMinHeight = getEffectiveMinHeight(t, min);

        if (t.width < effectiveMinWidth || t.height < effectiveMinHeight) {
          return false;
        }

        // Check maximum size constraints (if any)
        const effectiveMaxWidth = getEffectiveMaxWidth(t);
        const effectiveMaxHeight = getEffectiveMaxHeight(t);

        if (t.width > effectiveMaxWidth || t.height > effectiveMaxHeight) {
          return false;
        }
      }
      return true;
    },
    () => ({ code: 'MinSize', message: 'One or more tiles violate size constraints' }),
  );
}
