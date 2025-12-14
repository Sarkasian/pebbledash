/**
 * Keyboard event handlers for resize session.
 * Handles Shift key for redistribute mode and Tab for option cycling.
 */

import type { TileId, TileRect } from '@pebbledash/core';
import type { RedistributeOption } from '../resizeTypes.js';
import type { VisualFeedbackState } from './visualFeedback.js';
import { applyVisualPreview, setTileTransitions, updateGhostTileElement } from './visualFeedback.js';

/**
 * State for keyboard handling during resize
 */
export interface KeyboardState {
  shiftKeyHeld: boolean;
  redistributeOptions: RedistributeOption[];
  currentOptionIndex: number;
  pendingRedistributeLayout: TileRect[] | null;
  originalTilePositions: TileRect[] | null;
  originalTileMap: Map<TileId, TileRect> | null;
  lastRedistributeCursorPct: number;
  
  // Locked redistribute state - set when redistribute first activates
  lockedExpandingTileId: TileId | null;
  lockedShrinkingTileId: TileId | null;
  lockedGrowDirection: 'left' | 'right' | 'top' | 'bottom' | null;
  
  // Mode tracking
  isSnappedToFull: boolean;
  isInShrinkMode: boolean;
}

/**
 * Create initial keyboard state
 */
export function createKeyboardState(): KeyboardState {
  return {
    shiftKeyHeld: false,
    redistributeOptions: [],
    currentOptionIndex: 0,
    pendingRedistributeLayout: null,
    originalTilePositions: null,
    originalTileMap: null,
    lastRedistributeCursorPct: 0,
    lockedExpandingTileId: null,
    lockedShrinkingTileId: null,
    lockedGrowDirection: null,
    isSnappedToFull: false,
    isInShrinkMode: false,
  };
}

/**
 * Create keyboard event handlers for redistribute mode
 */
export function createKeyboardHandlers(
  container: HTMLElement,
  tileElements: Map<string, HTMLElement>,
  visualState: VisualFeedbackState,
  keyboardState: KeyboardState,
  redistributeEnabled: boolean,
  getCurrentTiles: () => TileRect[],
  isRunning: () => boolean
): {
  onKeyDown: (e: KeyboardEvent) => void;
  onKeyUp: (e: KeyboardEvent) => void;
} {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Shift' && !keyboardState.shiftKeyHeld && isRunning() && redistributeEnabled) {
      keyboardState.shiftKeyHeld = true;
      container.classList.add('redistribute-mode');
      // Store original positions when entering redistribute mode (both array and Map)
      keyboardState.originalTilePositions = getCurrentTiles();
      keyboardState.originalTileMap = new Map(keyboardState.originalTilePositions.map(t => [t.id, t]));
      // Reset cursor tracking for threshold check
      keyboardState.lastRedistributeCursorPct = 0;
      visualState.lastAppliedLayoutKey = '';
      // NOTE: Do NOT enable transitions here - positions should update instantly during drag
    }
    
    if (e.key === 'Tab' && keyboardState.shiftKeyHeld && isRunning() && keyboardState.redistributeOptions.length > 1) {
      e.preventDefault();
      // Cycle to next option
      keyboardState.currentOptionIndex = (keyboardState.currentOptionIndex + 1) % keyboardState.redistributeOptions.length;
      keyboardState.pendingRedistributeLayout = keyboardState.redistributeOptions[keyboardState.currentOptionIndex]?.tiles ?? null;
      // Enable transitions for smooth cycling animation
      setTileTransitions(tileElements, true);
      applyVisualPreview(visualState, tileElements, keyboardState.originalTileMap, keyboardState.pendingRedistributeLayout);
      // Disable transitions after animation completes so drag updates are instant
      setTimeout(() => setTileTransitions(tileElements, false), 250);
    }
  };
  
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Shift' && keyboardState.shiftKeyHeld) {
      keyboardState.shiftKeyHeld = false;
      container.classList.remove('redistribute-mode');
      // Enable transitions for smooth reset animation back to original
      setTileTransitions(tileElements, true);
      // Reset visual preview to original positions
      applyVisualPreview(visualState, tileElements, keyboardState.originalTileMap, null);
      // Remove ghost tile
      updateGhostTileElement(container, visualState, null);
      keyboardState.isSnappedToFull = false;
      keyboardState.isInShrinkMode = false;
      // Reset locked redistribute state
      keyboardState.lockedExpandingTileId = null;
      keyboardState.lockedShrinkingTileId = null;
      keyboardState.lockedGrowDirection = null;
      // Disable transitions after animation completes
      setTimeout(() => setTileTransitions(tileElements, false), 200);
      keyboardState.redistributeOptions = [];
      keyboardState.currentOptionIndex = 0;
      keyboardState.pendingRedistributeLayout = null;
      keyboardState.originalTilePositions = null;
      keyboardState.originalTileMap = null;
      keyboardState.lastRedistributeCursorPct = 0;
      visualState.lastAppliedLayoutKey = '';
    }
  };
  
  return { onKeyDown, onKeyUp };
}

/**
 * Reset keyboard state (call when session ends)
 */
export function resetKeyboardState(state: KeyboardState): void {
  state.shiftKeyHeld = false;
  state.redistributeOptions = [];
  state.currentOptionIndex = 0;
  state.pendingRedistributeLayout = null;
  state.originalTilePositions = null;
  state.originalTileMap = null;
  state.lastRedistributeCursorPct = 0;
  state.lockedExpandingTileId = null;
  state.lockedShrinkingTileId = null;
  state.lockedGrowDirection = null;
  state.isSnappedToFull = false;
  state.isInShrinkMode = false;
}

