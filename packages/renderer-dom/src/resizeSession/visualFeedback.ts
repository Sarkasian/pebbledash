/**
 * Visual feedback functions for resize session.
 * Handles ghost tiles, DOM preview, and CSS classes.
 */

import type { TileId, TileRect } from '@pebbledash/core';
import type { GhostTile } from '../resizeTypes.js';

/**
 * State for visual feedback during resize
 */
export interface VisualFeedbackState {
  ghostTileElement: HTMLElement | null;
  previewApplied: boolean;
  lastExpandedTiles: string[];
  lastShrunkTiles: string[];
  lastAppliedLayoutKey: string;
}

/**
 * Create initial visual feedback state
 */
export function createVisualFeedbackState(): VisualFeedbackState {
  return {
    ghostTileElement: null,
    previewApplied: false,
    lastExpandedTiles: [],
    lastShrunkTiles: [],
    lastAppliedLayoutKey: '',
  };
}

/**
 * Create or update ghost tile DOM element
 */
export function updateGhostTileElement(
  container: HTMLElement,
  state: VisualFeedbackState,
  ghost: GhostTile | null
): void {
  if (!ghost) {
    // Remove ghost tile element if exists
    if (state.ghostTileElement) {
      state.ghostTileElement.remove();
      state.ghostTileElement = null;
    }
    return;
  }
  
  // Create element if doesn't exist
  if (!state.ghostTileElement) {
    state.ghostTileElement = document.createElement('div');
    state.ghostTileElement.className = 'redistribute-ghost';
    container.appendChild(state.ghostTileElement);
  }
  
  // Update position and size
  state.ghostTileElement.style.position = 'absolute';
  state.ghostTileElement.style.left = `${ghost.x}%`;
  state.ghostTileElement.style.top = `${ghost.y}%`;
  state.ghostTileElement.style.width = `${ghost.width}%`;
  state.ghostTileElement.style.height = `${ghost.height}%`;
  
  // Update valid/invalid state
  if (ghost.isValid) {
    state.ghostTileElement.classList.remove('invalid');
  } else {
    state.ghostTileElement.classList.add('invalid');
  }
}

/**
 * Apply visual preview to DOM tiles (without changing model)
 * All positions are applied immediately - CSS transitions handle the visual smoothing
 */
export function applyVisualPreview(
  state: VisualFeedbackState,
  tileElements: Map<string, HTMLElement>,
  originalTileMap: Map<TileId, TileRect> | null,
  layout: TileRect[] | null
): void {
  if (!layout) {
    // Reset to original positions - apply all immediately
    if (originalTileMap) {
      tileElements.forEach((tileEl, tileId) => {
        const original = originalTileMap.get(tileId as TileId);
        if (original) {
          tileEl.classList.remove('redistribute-expanding', 'redistribute-shrinking');
          tileEl.style.left = `${original.x}%`;
          tileEl.style.top = `${original.y}%`;
          tileEl.style.width = `${original.width}%`;
          tileEl.style.height = `${original.height}%`;
        }
      });
    }
    
    state.lastExpandedTiles = [];
    state.lastShrunkTiles = [];
    state.previewApplied = false;
    state.lastAppliedLayoutKey = '';
    return;
  }
  
  // Convert layout to Map for O(1) lookups
  const layoutMap = new Map<TileId, TileRect>(layout.map(t => [t.id, t]));
  
  // Track which tiles changed for proper cleanup later
  const shrinkingTiles: string[] = [];
  const expandingTiles: string[] = [];
  
  if (originalTileMap) {
    for (const previewTile of layout) {
      const original = originalTileMap.get(previewTile.id);
      if (original) {
        const originalArea = original.width * original.height;
        const previewArea = previewTile.width * previewTile.height;
        if (previewArea < originalArea - 0.1) {
          shrinkingTiles.push(previewTile.id);
        } else if (previewArea > originalArea + 0.1) {
          expandingTiles.push(previewTile.id);
        }
      }
    }
  }
  
  state.lastExpandedTiles = expandingTiles;
  state.lastShrunkTiles = shrinkingTiles;
  
  // Apply ALL tile positions immediately - CSS transitions handle visual smoothing
  tileElements.forEach((tileEl, tileId) => {
    const previewTile = layoutMap.get(tileId as TileId);
    if (!previewTile) return;
    
    tileEl.style.left = `${previewTile.x}%`;
    tileEl.style.top = `${previewTile.y}%`;
    tileEl.style.width = `${previewTile.width}%`;
    tileEl.style.height = `${previewTile.height}%`;
    
    // Add visual feedback classes for expanding/shrinking tiles
    if (expandingTiles.includes(tileId)) {
      tileEl.classList.add('redistribute-expanding');
      tileEl.classList.remove('redistribute-shrinking');
    } else if (shrinkingTiles.includes(tileId)) {
      tileEl.classList.add('redistribute-shrinking');
      tileEl.classList.remove('redistribute-expanding');
    } else {
      tileEl.classList.remove('redistribute-expanding', 'redistribute-shrinking');
    }
  });
  
  state.previewApplied = true;
}

/**
 * Enable/disable transition animations on tiles
 */
export function setTileTransitions(
  tileElements: Map<string, HTMLElement>,
  enabled: boolean
): void {
  tileElements.forEach(tileEl => {
    if (enabled) {
      tileEl.classList.add('redistribute-animating');
    } else {
      tileEl.classList.remove('redistribute-animating', 'redistribute-shrinking', 'redistribute-expanding');
    }
  });
}

/**
 * Clean up all visual feedback state
 */
export function cleanupVisualFeedback(
  container: HTMLElement,
  state: VisualFeedbackState,
  tileElements: Map<string, HTMLElement>
): void {
  // Remove ghost tile
  if (state.ghostTileElement) {
    state.ghostTileElement.remove();
    state.ghostTileElement = null;
  }
  
  // Remove CSS classes
  tileElements.forEach(tileEl => {
    tileEl.classList.remove(
      'redistribute-animating',
      'redistribute-shrinking',
      'redistribute-expanding',
      'redistribute-committing'
    );
  });
  
  container.classList.remove('redistribute-mode');
}

