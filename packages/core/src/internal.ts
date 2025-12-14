/**
 * Internal utilities for advanced usage and testing.
 * 
 * These exports are NOT part of the stable public API and may change
 * between minor versions. Use with caution.
 * 
 * For normal usage, import from '@pebbledash/core' instead.
 */

// Seam manipulation utilities - used internally for resize operations
export {
  clampSeamDelta,
  applySeamDelta,
  seamIdForEdge,
  resolveEdgeToSeamId,
  coversSpan,
  coversFullSpanVertical,
  coversFullSpanHorizontal,
} from './seams/index.js';

// Re-export Seam type for completeness
export type { Seam } from './entities/Seam.js';

// Insertion navigation utilities - used by renderer-dom for insert mode overlays
export { InsertionNavigator } from './interaction/InsertionNavigator.js';
export type { 
  HoverEdge, 
  BoundaryGroup, 
  InsertionBoundary,
  EdgeSide,
  Orientation,
} from './interaction/InsertionNavigator.js';