/**
 * Utility functions for redistribute mode calculations.
 * Pure functions that don't depend on session state.
 */

import type { TileId, TileRect } from '@pebbledash/core';
import type { RedistributeOption, GhostTile } from './resizeTypes.js';

/**
 * Find tiles on each side of an edge seam.
 * Returns shrinkingTile and expandingTile based on cursor direction.
 */
export function findTilesOnEdgeSides(
  tiles: TileRect[],
  edgePosition: number,
  isVerticalEdge: boolean,
  cursorPct: { x: number; y: number },
  cursorMovingNegative: boolean
): { shrinkingTile: TileRect | null; expandingTile: TileRect | null } {
  const eps = 0.5; // Slightly larger epsilon for edge matching
  
  // Find tiles touching the edge on each side
  const tilesOnNegativeSide: TileRect[] = []; // LEFT for vertical edge, TOP for horizontal edge
  const tilesOnPositiveSide: TileRect[] = []; // RIGHT for vertical edge, BOTTOM for horizontal edge
  
  for (const tile of tiles) {
    if (isVerticalEdge) {
      // Vertical edge: check x positions
      // Tile is on LEFT if its right edge touches the seam
      if (Math.abs(tile.x + tile.width - edgePosition) < eps) {
        tilesOnNegativeSide.push(tile);
      }
      // Tile is on RIGHT if its left edge touches the seam
      if (Math.abs(tile.x - edgePosition) < eps) {
        tilesOnPositiveSide.push(tile);
      }
    } else {
      // Horizontal edge: check y positions
      // Tile is on TOP if its bottom edge touches the seam
      if (Math.abs(tile.y + tile.height - edgePosition) < eps) {
        tilesOnNegativeSide.push(tile);
      }
      // Tile is on BOTTOM if its top edge touches the seam
      if (Math.abs(tile.y - edgePosition) < eps) {
        tilesOnPositiveSide.push(tile);
      }
    }
  }
  
  // Select tile under cursor from each side
  const selectTileUnderCursor = (candidates: TileRect[]): TileRect | null => {
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0] ?? null;
    
    for (const tile of candidates) {
      if (isVerticalEdge) {
        // For vertical edge, match by cursor Y
        if (cursorPct.y >= tile.y - eps && cursorPct.y <= tile.y + tile.height + eps) {
          return tile;
        }
      } else {
        // For horizontal edge, match by cursor X
        if (cursorPct.x >= tile.x - eps && cursorPct.x <= tile.x + tile.width + eps) {
          return tile;
        }
      }
    }
    return candidates[0] ?? null; // Fallback to first
  };
  
  const tileOnNegative = selectTileUnderCursor(tilesOnNegativeSide);
  const tileOnPositive = selectTileUnderCursor(tilesOnPositiveSide);
  
  // Assign shrinking/expanding based on cursor direction
  // Cursor moving NEGATIVE (left/up) means NEGATIVE side shrinks, POSITIVE side expands
  // Cursor moving POSITIVE (right/down) means POSITIVE side shrinks, NEGATIVE side expands
  if (cursorMovingNegative) {
    return { shrinkingTile: tileOnNegative, expandingTile: tileOnPositive };
  } else {
    return { shrinkingTile: tileOnPositive, expandingTile: tileOnNegative };
  }
}

/**
 * Check if the shrinking tile extends beyond the expanding tile in the orthogonal direction.
 * This is the prerequisite for redistribute to work.
 */
export function shrinkingTileExtendsBeyond(
  shrinkingTile: TileRect,
  expandingTile: TileRect,
  isVerticalEdge: boolean
): boolean {
  // Relaxed epsilon to handle floating-point precision issues
  const eps = 0.5;
  if (isVerticalEdge) {
    // For vertical edge (horizontal drag), check VERTICAL extension
    // shrinkingTile must extend above or below expandingTile
    return shrinkingTile.y < expandingTile.y - eps || 
           shrinkingTile.y + shrinkingTile.height > expandingTile.y + expandingTile.height + eps;
  } else {
    // For horizontal edge (vertical drag), check HORIZONTAL extension
    // shrinkingTile must extend left or right of expandingTile
    return shrinkingTile.x < expandingTile.x - eps || 
           shrinkingTile.x + shrinkingTile.width > expandingTile.x + expandingTile.width + eps;
  }
}

/**
 * Calculate ghost tile for partial redistribute during EXPANDING.
 * Gap is in neighbor's vacated space (between current edge and full-snap position).
 */
export function calculateGhostTileExpanding(
  fullSnapDragged: TileRect,
  actualDraggedWidth: number,
  actualDraggedHeight: number,
  dragDirection: 'left' | 'right' | 'top' | 'bottom',
  minTileWidth: number,
  minTileHeight: number
): GhostTile | null {
  const isHorizontalDrag = dragDirection === 'left' || dragDirection === 'right';
  
  if (isHorizontalDrag) {
    // Horizontal drag - ghost tile is in the horizontal gap
    const fullWidth = fullSnapDragged.width;
    const actualWidth = Math.min(actualDraggedWidth, fullWidth);
    const gapWidth = fullWidth - actualWidth;
    
    if (gapWidth <= 0.1) return null; // No significant gap - will snap
    
    let ghostX: number;
    if (dragDirection === 'right') {
      // Expanding right - gap is on the right side of dragged
      ghostX = fullSnapDragged.x + actualWidth;
    } else {
      // Expanding left - gap is on the left side of dragged
      ghostX = fullSnapDragged.x;
    }
    
    return {
      x: ghostX,
      y: fullSnapDragged.y,
      width: gapWidth,
      height: fullSnapDragged.height,
      isValid: gapWidth >= minTileWidth,
    };
  } else {
    // Vertical drag - ghost tile is in the vertical gap
    const fullHeight = fullSnapDragged.height;
    const actualHeight = Math.min(actualDraggedHeight, fullHeight);
    const gapHeight = fullHeight - actualHeight;
    
    if (gapHeight <= 0.1) return null; // No significant gap - will snap
    
    let ghostY: number;
    if (dragDirection === 'bottom') {
      // Expanding down - gap is at the bottom of dragged
      ghostY = fullSnapDragged.y + actualHeight;
    } else {
      // Expanding up - gap is at the top of dragged
      ghostY = fullSnapDragged.y;
    }
    
    return {
      x: fullSnapDragged.x,
      y: ghostY,
      width: fullSnapDragged.width,
      height: gapHeight,
      isValid: gapHeight >= minTileHeight,
    };
  }
}

/**
 * Calculate the actual layout for a redistribute option.
 * 
 * Example: B expands left into A, A shrinks from top
 * Before:                     After:
 * +-------+-------+           +---------------+
 * |       |   B   |           |       B       |  <- B expands to full width
 * |   A   +-------+     =>    +-------+-------+
 * |       |   C   |           |   A   |   C   |  <- A shrinks to bottom
 * +-------+-------+           +-------+-------+
 */
export function calculateRedistributeLayout(
  tiles: TileRect[],
  draggedTile: TileRect,
  neighbor: TileRect,
  neighborShrinkDirection: 'top' | 'bottom' | 'left' | 'right',
  dragDirection: 'left' | 'right' | 'top' | 'bottom',
  minTileWidth: number,
  minTileHeight: number
): TileRect[] | null {
  const result: TileRect[] = [];
  const isHorizontalDrag = dragDirection === 'left' || dragDirection === 'right';
  
  let newDragged: TileRect;
  let newNeighbor: TileRect;
  
  if (isHorizontalDrag) {
    // Horizontal drag: B expands horizontally to span both its original space AND the neighbor's horizontal extent
    // A (neighbor) shrinks orthogonally (vertically)
    
    // Calculate the combined horizontal extent
    const combinedLeft = Math.min(draggedTile.x, neighbor.x);
    const combinedRight = Math.max(draggedTile.x + draggedTile.width, neighbor.x + neighbor.width);
    const combinedWidth = combinedRight - combinedLeft;
    
    if (neighborShrinkDirection === 'top') {
      // A shrinks from top -> A moves down, B takes top row at full width
      newDragged = {
        ...draggedTile,
        x: combinedLeft,
        width: combinedWidth,
      };
      
      newNeighbor = {
        ...neighbor,
        y: draggedTile.y + draggedTile.height,
        height: neighbor.height - draggedTile.height,
      };
      
    } else if (neighborShrinkDirection === 'bottom') {
      // A shrinks from bottom -> B takes bottom row at full width
      newDragged = {
        ...draggedTile,
        x: combinedLeft,
        width: combinedWidth,
        y: neighbor.y + neighbor.height - draggedTile.height,
      };
      
      newNeighbor = {
        ...neighbor,
        height: neighbor.height - draggedTile.height,
      };
    } else {
      return null;
    }
    
  } else {
    // Vertical drag: B expands vertically to span combined height
    // A (neighbor) shrinks horizontally to make room
    
    // Calculate the combined vertical extent
    const combinedTop = Math.min(draggedTile.y, neighbor.y);
    const combinedBottom = Math.max(draggedTile.y + draggedTile.height, neighbor.y + neighbor.height);
    const combinedHeight = combinedBottom - combinedTop;
    
    if (neighborShrinkDirection === 'left') {
      // Neighbor extends LEFT of dragged tile
      newDragged = {
        ...draggedTile,
        y: combinedTop,
        height: combinedHeight,
      };
      
      newNeighbor = {
        ...neighbor,
        width: draggedTile.x - neighbor.x,
      };
      
    } else if (neighborShrinkDirection === 'right') {
      // Neighbor extends RIGHT of dragged tile
      newDragged = {
        ...draggedTile,
        y: combinedTop,
        height: combinedHeight,
      };
      
      newNeighbor = {
        ...neighbor,
        x: draggedTile.x + draggedTile.width,
        width: (neighbor.x + neighbor.width) - (draggedTile.x + draggedTile.width),
      };
    } else {
      return null;
    }
  }
  
  // Validate sizes
  if (newNeighbor.width < minTileWidth || newNeighbor.height < minTileHeight) {
    return null;
  }
  if (newDragged.width < minTileWidth || newDragged.height < minTileHeight) {
    return null;
  }
  
  // Clamp to bounds (with epsilon for floating point tolerance)
  const boundsEps = 0.01;
  if (newDragged.x < -boundsEps || newDragged.y < -boundsEps || 
      newDragged.x + newDragged.width > 100 + boundsEps || 
      newDragged.y + newDragged.height > 100 + boundsEps) {
    return null;
  }
  if (newNeighbor.x < -boundsEps || newNeighbor.y < -boundsEps || 
      newNeighbor.x + newNeighbor.width > 100 + boundsEps || 
      newNeighbor.y + newNeighbor.height > 100 + boundsEps) {
    return null;
  }
  
  // Build result with updated tiles
  for (const tile of tiles) {
    if (tile.id === draggedTile.id) {
      result.push(newDragged);
    } else if (tile.id === neighbor.id) {
      result.push(newNeighbor);
    } else {
      result.push({ ...tile });
    }
  }
  
  // Validate total area
  const totalArea = result.reduce((sum, t) => sum + t.width * t.height, 0);
  if (Math.abs(totalArea - 10000) > 10) {
    return null;
  }
  
  return result;
}

/**
 * Calculate all redistribute options for the current drag.
 */
export function calculateRedistributeOptionsForTiles(
  tiles: TileRect[],
  shrinkingTile: TileRect,
  expandingTile: TileRect,
  isVertical: boolean,
  cursorDelta: number,
  minTileWidth: number,
  minTileHeight: number
): RedistributeOption[] {
  const options: RedistributeOption[] = [];
  const absDelta = Math.abs(cursorDelta);
  const cursorMovingNegative = cursorDelta < 0;
  
  // Determine drag direction based on which direction the cursor moved
  const dragDirection: 'left' | 'right' | 'top' | 'bottom' = isVertical
    ? (cursorMovingNegative ? 'left' : 'right')
    : (cursorMovingNegative ? 'top' : 'bottom');
  
  if (isVertical) {
    // Vertical edge = Horizontal drag
    const extendsAbove = shrinkingTile.y < expandingTile.y - 0.1;
    const extendsBelow = shrinkingTile.y + shrinkingTile.height > expandingTile.y + expandingTile.height + 0.1;
    const newShrinkingHeight = shrinkingTile.height - expandingTile.height;
    
    // Option 1: shrinkingTile shrinks from bottom (keeps top portion)
    if (extendsAbove && newShrinkingHeight >= minTileHeight) {
      const newTiles = calculateRedistributeLayout(
        tiles, expandingTile, shrinkingTile, 'bottom', dragDirection, minTileWidth, minTileHeight
      );
      if (newTiles) {
        const newShrinking = newTiles.find(t => t.id === shrinkingTile.id);
        options.push({
          description: `${shrinkingTile.id} shrinks from bottom`,
          shrinkDirection: 'bottom',
          tiles: newTiles,
          neighborRetainedArea: newShrinking ? newShrinking.width * newShrinking.height : 0,
        });
      }
    }
    
    // Option 2: shrinkingTile shrinks from top (keeps bottom portion)
    if (extendsBelow && newShrinkingHeight >= minTileHeight) {
      const newTiles = calculateRedistributeLayout(
        tiles, expandingTile, shrinkingTile, 'top', dragDirection, minTileWidth, minTileHeight
      );
      if (newTiles) {
        const newShrinking = newTiles.find(t => t.id === shrinkingTile.id);
        options.push({
          description: `${shrinkingTile.id} shrinks from top`,
          shrinkDirection: 'top',
          tiles: newTiles,
          neighborRetainedArea: newShrinking ? newShrinking.width * newShrinking.height : 0,
        });
      }
    }
  } else {
    // Horizontal edge = Vertical drag
    const newShrinkingWidth = shrinkingTile.width - expandingTile.width;
    
    // Option 1: shrinkingTile shrinks from left (keeps right portion)
    if (shrinkingTile.x < expandingTile.x - 0.1 && newShrinkingWidth >= minTileWidth) {
      const newTiles = calculateRedistributeLayout(
        tiles, expandingTile, shrinkingTile, 'left', dragDirection, minTileWidth, minTileHeight
      );
      if (newTiles) {
        const newShrinking = newTiles.find(t => t.id === shrinkingTile.id);
        options.push({
          description: `${shrinkingTile.id} shrinks from left`,
          shrinkDirection: 'left',
          tiles: newTiles,
          neighborRetainedArea: newShrinking ? newShrinking.width * newShrinking.height : 0,
        });
      }
    }
    
    // Option 2: shrinkingTile shrinks from right (keeps left portion)
    if (shrinkingTile.x + shrinkingTile.width > expandingTile.x + expandingTile.width + 0.1 && 
        newShrinkingWidth >= minTileWidth) {
      const newTiles = calculateRedistributeLayout(
        tiles, expandingTile, shrinkingTile, 'right', dragDirection, minTileWidth, minTileHeight
      );
      if (newTiles) {
        const newShrinking = newTiles.find(t => t.id === shrinkingTile.id);
        options.push({
          description: `${shrinkingTile.id} shrinks from right`,
          shrinkDirection: 'right',
          tiles: newTiles,
          neighborRetainedArea: newShrinking ? newShrinking.width * newShrinking.height : 0,
        });
      }
    }
  }
  
  // Sort by retained area (highest first)
  options.sort((a, b) => b.neighborRetainedArea - a.neighborRetainedArea);
  
  return options;
}

