/**
 * BoundsValid condition node.
 * 
 * Validates that all tiles in the dashboard are within the valid
 * coordinate bounds (0-100% for both x/y and width/height).
 * 
 * @module decision-engine/conditions/BoundsValid
 */

import type { DecisionContext } from '../types.js';
import { ConditionNode } from '../nodes.js';
import { withinBounds } from '../../utils/geometry.js';

/**
 * Creates a condition node that checks all tiles are within bounds.
 * 
 * Uses the `withinBounds` utility to verify each tile's position
 * and dimensions are within the 0-100% valid range.
 * 
 * @returns A ConditionNode that validates bounds for all tiles
 * 
 * @example
 * ```ts
 * const graph = Sequence(
 *   TileExists(),
 *   NotLocked(),
 *   BoundsValid(),  // Ensures no tiles extend outside 0-100% bounds
 * );
 * ```
 * 
 * @violation
 * - Code: `OutOfBounds`
 * - Message: `One or more tiles are out of bounds`
 */
export function BoundsValid() {
  return new ConditionNode(
    'BoundsValid',
    (ctx: DecisionContext) => Array.from(ctx.state.tiles.values()).every(withinBounds),
    () => ({ code: 'OutOfBounds', message: 'One or more tiles are out of bounds' }),
  );
}
