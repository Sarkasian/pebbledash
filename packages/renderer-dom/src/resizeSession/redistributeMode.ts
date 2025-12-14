/**
 * Redistribute mode logic for resize session.
 * Handles the Shift+drag behavior for redistributing tile space.
 */

import type { TileId, TileRect, DashboardModel } from '@pebbledash/core';
import type { RedistributeOption, GhostTile } from '../resizeTypes.js';
import {
  findTilesOnEdgeSides,
  shrinkingTileExtendsBeyond,
  calculateGhostTileExpanding,
  calculateRedistributeOptionsForTiles,
} from '../redistributeUtils.js';
import type { KeyboardState } from './keyboardHandlers.js';
import type { VisualFeedbackState } from './visualFeedback.js';
import { updateGhostTileElement, applyVisualPreview } from './visualFeedback.js';

/**
 * State specific to redistribute mode calculations
 */
export interface RedistributeModeState {
  ghostTile: GhostTile | null;
}

/**
 * Create initial redistribute mode state
 */
export function createRedistributeModeState(): RedistributeModeState {
  return {
    ghostTile: null,
  };
}

/**
 * Context needed for redistribute calculations
 */
export interface RedistributeModeContext {
  container: HTMLElement;
  tileElements: Map<string, HTMLElement>;
  isVertical: boolean;
  originalEdgePosition: number;
  minTileWidth: number;
  minTileHeight: number;
  el: HTMLElement;
  cachedContainerRect: DOMRect;
}

/**
 * Calculate and apply redistribute preview during drag.
 * Returns true if redistribute is active and valid, false otherwise.
 */
export function processRedistributeMode(
  ctx: RedistributeModeContext,
  keyboardState: KeyboardState,
  visualState: VisualFeedbackState,
  redistributeState: RedistributeModeState,
  cursorDelta: number,
  cursorX: number,
  cursorY: number,
  shouldRecalcOptions: boolean
): boolean {
  const { container, tileElements, isVertical, originalEdgePosition, minTileWidth, minTileHeight, el, cachedContainerRect } = ctx;
  const cursorPct = { x: cursorX, y: cursorY };
  
  // If roles aren't locked yet, try to determine them from first significant movement
  if (!keyboardState.lockedExpandingTileId) {
    const cursorMovingNegative = cursorDelta < 0;
    
    // Find tiles on each side of the edge
    const { shrinkingTile, expandingTile } = findTilesOnEdgeSides(
      keyboardState.originalTilePositions || [],
      originalEdgePosition,
      isVertical,
      cursorPct,
      cursorMovingNegative
    );
    
    if (shrinkingTile && expandingTile) {
      // Check if redistribute is applicable
      const extendsBeyond = shrinkingTileExtendsBeyond(shrinkingTile, expandingTile, isVertical);
      if (extendsBeyond) {
        // Lock the roles - these won't change until Shift is released
        keyboardState.lockedExpandingTileId = expandingTile.id;
        keyboardState.lockedShrinkingTileId = shrinkingTile.id;
        keyboardState.lockedGrowDirection = isVertical
          ? (cursorMovingNegative ? 'left' : 'right')
          : (cursorMovingNegative ? 'top' : 'bottom');
      }
    }
    
    // If still not locked (no valid redistribute), return false
    if (!keyboardState.lockedExpandingTileId) {
      return false;
    }
  }
  
  // Roles are locked - calculate using locked direction
  const lockedCursorMovingNegative = keyboardState.lockedGrowDirection === 'left' || keyboardState.lockedGrowDirection === 'top';
  
  // Only recalculate options if needed
  if (shouldRecalcOptions) {
    const lockedCursorDelta = lockedCursorMovingNegative ? -Math.abs(cursorDelta) : Math.abs(cursorDelta);
    
    // Get current tiles for calculation
    const tiles = keyboardState.originalTilePositions || [];
    const { shrinkingTile, expandingTile } = findTilesOnEdgeSides(
      tiles,
      originalEdgePosition,
      isVertical,
      cursorPct,
      lockedCursorMovingNegative
    );
    
    if (shrinkingTile && expandingTile && shrinkingTileExtendsBeyond(shrinkingTile, expandingTile, isVertical)) {
      keyboardState.redistributeOptions = calculateRedistributeOptionsForTiles(
        tiles,
        shrinkingTile,
        expandingTile,
        isVertical,
        lockedCursorDelta,
        minTileWidth,
        minTileHeight
      );
    }
  }
  
  if (keyboardState.redistributeOptions.length === 0) {
    return false;
  }
  
  // Use current selected option
  if (keyboardState.currentOptionIndex >= keyboardState.redistributeOptions.length) {
    keyboardState.currentOptionIndex = 0;
  }
  const currentOption = keyboardState.redistributeOptions[keyboardState.currentOptionIndex];
  if (!currentOption) {
    return false;
  }
  
  const fullSnapLayout = currentOption.tiles;
  const fullSnapMap = new Map<TileId, TileRect>(fullSnapLayout.map(t => [t.id, t]));
  
  // Find the LOCKED expanding tile
  const fullSnapExpanding = fullSnapMap.get(keyboardState.lockedExpandingTileId!);
  const originalExpanding = keyboardState.originalTileMap?.get(keyboardState.lockedExpandingTileId!);
  
  if (!fullSnapExpanding || !originalExpanding) {
    // Fallback to full snap
    keyboardState.isSnappedToFull = true;
    keyboardState.pendingRedistributeLayout = fullSnapLayout;
    applyVisualPreview(visualState, tileElements, keyboardState.originalTileMap, fullSnapLayout);
    updateGhostTileElement(container, visualState, null);
    redistributeState.ghostTile = null;
    return true;
  }
  
  // Calculate expand/shrink mode and actual size based on cursor position
  const result = calculateExpandShrinkLayout(
    keyboardState,
    visualState,
    redistributeState,
    ctx,
    fullSnapExpanding,
    originalExpanding,
    fullSnapLayout,
    cursorX,
    cursorY
  );
  
  if (result.layout) {
    keyboardState.pendingRedistributeLayout = result.layout;
    keyboardState.isSnappedToFull = result.isSnapped;
    keyboardState.isInShrinkMode = result.isShrinkMode;
    applyVisualPreview(visualState, tileElements, keyboardState.originalTileMap, result.layout);
    updateGhostTileElement(container, visualState, redistributeState.ghostTile);
  }
  
  // Valid redistribute - hide edge
  el.style.opacity = '0';
  return true;
}

/**
 * Calculate layout based on whether we're expanding or shrinking
 */
function calculateExpandShrinkLayout(
  keyboardState: KeyboardState,
  visualState: VisualFeedbackState,
  redistributeState: RedistributeModeState,
  ctx: RedistributeModeContext,
  fullSnapExpanding: TileRect,
  originalExpanding: TileRect,
  fullSnapLayout: TileRect[],
  cursorX: number,
  cursorY: number
): { layout: TileRect[] | null; isSnapped: boolean; isShrinkMode: boolean } {
  const { isVertical, minTileWidth, minTileHeight } = ctx;
  const growDirection = keyboardState.lockedGrowDirection!;
  
  let isExpandingMode = true;
  let actualSize = 0;
  const originalSize = isVertical ? originalExpanding.width : originalExpanding.height;
  const fullSnapSize = isVertical ? fullSnapExpanding.width : fullSnapExpanding.height;
  
  // Determine if expanding or shrinking based on cursor position relative to original edge
  if (isVertical) {
    if (growDirection === 'left') {
      const originalLeft = originalExpanding.x;
      if (cursorX > originalLeft) {
        isExpandingMode = false;
        const shrinkAmount = cursorX - originalLeft;
        actualSize = Math.max(minTileWidth, originalExpanding.width - shrinkAmount);
      } else {
        const fullSnapLeft = fullSnapExpanding.x;
        const clampedLeft = Math.max(fullSnapLeft, cursorX);
        actualSize = (originalExpanding.x + originalExpanding.width) - clampedLeft;
      }
    } else {
      const originalRight = originalExpanding.x + originalExpanding.width;
      if (cursorX < originalRight) {
        isExpandingMode = false;
        const shrinkAmount = originalRight - cursorX;
        actualSize = Math.max(minTileWidth, originalExpanding.width - shrinkAmount);
      } else {
        const fullSnapRight = fullSnapExpanding.x + fullSnapExpanding.width;
        const clampedRight = Math.min(fullSnapRight, cursorX);
        actualSize = clampedRight - originalExpanding.x;
      }
    }
  } else {
    if (growDirection === 'top') {
      const originalTop = originalExpanding.y;
      if (cursorY > originalTop) {
        isExpandingMode = false;
        const shrinkAmount = cursorY - originalTop;
        actualSize = Math.max(minTileHeight, originalExpanding.height - shrinkAmount);
      } else {
        const fullSnapTop = fullSnapExpanding.y;
        const clampedTop = Math.max(fullSnapTop, cursorY);
        actualSize = (originalExpanding.y + originalExpanding.height) - clampedTop;
      }
    } else {
      const originalBottom = originalExpanding.y + originalExpanding.height;
      if (cursorY < originalBottom) {
        isExpandingMode = false;
        const shrinkAmount = originalBottom - cursorY;
        actualSize = Math.max(minTileHeight, originalExpanding.height - shrinkAmount);
      } else {
        const fullSnapBottom = fullSnapExpanding.y + fullSnapExpanding.height;
        const clampedBottom = Math.min(fullSnapBottom, cursorY);
        actualSize = clampedBottom - originalExpanding.y;
      }
    }
  }
  
  // Calculate actual dimensions
  let actualExpandingWidth = isVertical ? actualSize : originalExpanding.width;
  let actualExpandingHeight = isVertical ? originalExpanding.height : actualSize;
  
  // For expanding mode, also update orthogonal dimension to match fullSnap
  if (isExpandingMode) {
    if (isVertical) {
      actualExpandingHeight = fullSnapExpanding.height;
    } else {
      actualExpandingWidth = fullSnapExpanding.width;
    }
  }
  
  // Check states
  const isAtOriginal = Math.abs(actualSize - originalSize) < 0.5;
  const isAtFullSnap = isExpandingMode && Math.abs(actualSize - fullSnapSize) < 0.5;
  const isShrinking = !isExpandingMode && actualSize < originalSize - 0.5;
  
  if (isAtOriginal && !isShrinking) {
    // At original position - show original layout
    redistributeState.ghostTile = null;
    return { layout: null, isSnapped: false, isShrinkMode: false };
  }
  
  if (isExpandingMode) {
    return calculateExpandingLayout(
      keyboardState,
      redistributeState,
      ctx,
      fullSnapExpanding,
      originalExpanding,
      fullSnapLayout,
      actualExpandingWidth,
      actualExpandingHeight,
      isAtFullSnap
    );
  } else {
    return calculateShrinkingLayout(
      keyboardState,
      redistributeState,
      ctx,
      originalExpanding,
      actualSize,
      originalSize
    );
  }
}

/**
 * Calculate layout when expanding
 */
function calculateExpandingLayout(
  keyboardState: KeyboardState,
  redistributeState: RedistributeModeState,
  ctx: RedistributeModeContext,
  fullSnapExpanding: TileRect,
  originalExpanding: TileRect,
  fullSnapLayout: TileRect[],
  actualExpandingWidth: number,
  actualExpandingHeight: number,
  isAtFullSnap: boolean
): { layout: TileRect[] | null; isSnapped: boolean; isShrinkMode: boolean } {
  const { isVertical, minTileWidth, minTileHeight } = ctx;
  const growDirection = keyboardState.lockedGrowDirection!;
  
  // Ghost is in the gap between current size and full-snap size
  redistributeState.ghostTile = calculateGhostTileExpanding(
    fullSnapExpanding,
    actualExpandingWidth,
    actualExpandingHeight,
    growDirection,
    minTileWidth,
    minTileHeight
  );
  
  if (isAtFullSnap || !redistributeState.ghostTile || !redistributeState.ghostTile.isValid) {
    // Snap to full
    redistributeState.ghostTile = null;
    return { layout: fullSnapLayout, isSnapped: true, isShrinkMode: false };
  }
  
  // Build partial layout
  const partialLayout = fullSnapLayout.map(t => {
    if (t.id === keyboardState.lockedExpandingTileId) {
      if (isVertical) {
        if (growDirection === 'left') {
          const newX = fullSnapExpanding.x + fullSnapExpanding.width - actualExpandingWidth;
          return { ...t, x: newX, width: actualExpandingWidth };
        } else {
          return { ...t, x: originalExpanding.x, width: actualExpandingWidth };
        }
      } else {
        if (growDirection === 'top') {
          const newY = fullSnapExpanding.y + fullSnapExpanding.height - actualExpandingHeight;
          return { ...t, y: newY, height: actualExpandingHeight };
        } else {
          return { ...t, y: originalExpanding.y, height: actualExpandingHeight };
        }
      }
    }
    return t;
  });
  
  return { layout: partialLayout, isSnapped: false, isShrinkMode: false };
}

/**
 * Calculate layout when shrinking
 */
function calculateShrinkingLayout(
  keyboardState: KeyboardState,
  redistributeState: RedistributeModeState,
  ctx: RedistributeModeContext,
  originalExpanding: TileRect,
  actualSize: number,
  originalSize: number
): { layout: TileRect[] | null; isSnapped: boolean; isShrinkMode: boolean } {
  const { isVertical, minTileWidth, minTileHeight } = ctx;
  const growDirection = keyboardState.lockedGrowDirection!;
  
  const gapSize = originalSize - actualSize;
  
  // Calculate ghost position (in B's vacated space)
  let shrinkGhost: GhostTile;
  if (isVertical) {
    if (growDirection === 'left') {
      shrinkGhost = {
        x: originalExpanding.x,
        y: originalExpanding.y,
        width: gapSize,
        height: originalExpanding.height,
        isValid: gapSize >= minTileWidth,
      };
    } else {
      shrinkGhost = {
        x: originalExpanding.x + actualSize,
        y: originalExpanding.y,
        width: gapSize,
        height: originalExpanding.height,
        isValid: gapSize >= minTileWidth,
      };
    }
  } else {
    if (growDirection === 'top') {
      shrinkGhost = {
        x: originalExpanding.x,
        y: originalExpanding.y,
        width: originalExpanding.width,
        height: gapSize,
        isValid: gapSize >= minTileHeight,
      };
    } else {
      shrinkGhost = {
        x: originalExpanding.x,
        y: originalExpanding.y + actualSize,
        width: originalExpanding.width,
        height: gapSize,
        isValid: gapSize >= minTileHeight,
      };
    }
  }
  
  redistributeState.ghostTile = shrinkGhost;
  
  // Build shrink layout (B at smaller size, other tiles at original)
  const shrinkLayout = (keyboardState.originalTilePositions || []).map(t => {
    if (t.id === keyboardState.lockedExpandingTileId) {
      if (isVertical) {
        if (growDirection === 'left') {
          return { ...t, x: originalExpanding.x + (originalSize - actualSize), width: actualSize };
        } else {
          return { ...t, width: actualSize };
        }
      } else {
        if (growDirection === 'top') {
          return { ...t, y: originalExpanding.y + (originalSize - actualSize), height: actualSize };
        } else {
          return { ...t, height: actualSize };
        }
      }
    }
    return { ...t };
  });
  
  return { layout: shrinkLayout, isSnapped: false, isShrinkMode: true };
}

/**
 * Handle commit when redistribute mode ends
 */
export function commitRedistribute(
  keyboardState: KeyboardState,
  redistributeState: RedistributeModeState,
  model: DashboardModel,
  tileElements: Map<string, HTMLElement>
): { committed: boolean; newTileId: TileId | null } {
  if (!keyboardState.pendingRedistributeLayout) {
    return { committed: false, newTileId: null };
  }
  
  // Add commit animation class
  tileElements.forEach(tileEl => {
    tileEl.classList.add('redistribute-committing');
    tileEl.classList.remove('redistribute-expanding', 'redistribute-shrinking');
  });
  
  if (keyboardState.isSnappedToFull) {
    // Scenario 1: Expand + snapped to full → commit layout (no new tile)
    try {
      const currentState = model.getState();
      const tilesForSnapshot = keyboardState.pendingRedistributeLayout.map(t => {
        const existingTile = currentState.tiles.get(t.id);
        return {
          id: t.id,
          x: t.x,
          y: t.y,
          width: t.width,
          height: t.height,
          locked: existingTile?.locked ?? false,
          meta: existingTile?.meta ?? {},
        };
      });
      model.restoreSnapshot({ version: 1 as const, tiles: tilesForSnapshot });
      return { committed: true, newTileId: null };
    } catch (e) {
      console.error('Redistribute: Failed to apply snapped layout:', e);
      return { committed: false, newTileId: null };
    }
  }
  
  if (redistributeState.ghostTile && redistributeState.ghostTile.isValid) {
    // Scenario 2 or 4: Valid ghost → create new tile at ghost position
    try {
      const currentState = model.getState();
      const tilesForSnapshot = keyboardState.pendingRedistributeLayout.map(t => {
        const existingTile = currentState.tiles.get(t.id);
        return {
          id: t.id,
          x: t.x,
          y: t.y,
          width: t.width,
          height: t.height,
          locked: existingTile?.locked ?? false,
          meta: existingTile?.meta ?? {},
        };
      });
      
      const newTileId = `tile-${Date.now()}` as TileId;
      tilesForSnapshot.push({
        id: newTileId,
        x: redistributeState.ghostTile.x,
        y: redistributeState.ghostTile.y,
        width: redistributeState.ghostTile.width,
        height: redistributeState.ghostTile.height,
        locked: false,
        meta: {},
      });
      
      model.restoreSnapshot({ version: 1 as const, tiles: tilesForSnapshot });
      return { committed: true, newTileId };
    } catch (e) {
      console.error('Redistribute: Failed to apply layout with new tile:', e);
      return { committed: false, newTileId: null };
    }
  }
  
  if (keyboardState.isInShrinkMode && redistributeState.ghostTile && !redistributeState.ghostTile.isValid) {
    // Scenario 3: Shrink + invalid ghost → REVERT (don't commit)
    return { committed: false, newTileId: null };
  }
  
  // Other cases → REVERT
  return { committed: false, newTileId: null };
}

