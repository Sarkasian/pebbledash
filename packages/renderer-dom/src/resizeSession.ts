/**
 * Resize session handling for drag-based tile resizing.
 * Includes support for redistribute mode (Shift + drag).
 * 
 * This module orchestrates the resize session, delegating to:
 * - `resizeSession/visualFeedback.ts` - Ghost tiles and DOM preview
 * - `resizeSession/keyboardHandlers.ts` - Shift/Tab key handling
 * - `resizeSession/redistributeMode.ts` - Redistribute calculations
 * - `resizeSession/normalResize.ts` - Standard seam-based resize
 * - `resizeTypes.ts` - Type definitions
 * - `redistributeUtils.ts` - Pure calculation functions
 */

import type { TileId, TileRect } from '@pebbledash/core';
import type { ResizeSessionHooks } from './resizeTypes.js';
import {
  DEFAULT_CLAMP_DEADBAND_PX,
  REDISTRIBUTE_THRESHOLD_PCT,
} from './resizeTypes.js';
import {
  createVisualFeedbackState,
  updateGhostTileElement,
  applyVisualPreview,
  setTileTransitions,
} from './resizeSession/visualFeedback.js';
import {
  createKeyboardState,
  createKeyboardHandlers,
  resetKeyboardState,
} from './resizeSession/keyboardHandlers.js';
import {
  createRedistributeModeState,
  processRedistributeMode,
  commitRedistribute,
} from './resizeSession/redistributeMode.js';
import {
  createNormalResizeState,
  processNormalResize,
  resetEdgeElement,
} from './resizeSession/normalResize.js';

// Re-export types for consumers
export type { ResizeConfig, RedistributeConfig, ResizeSessionHooks } from './resizeTypes.js';

/**
 * Start a resize session for drag-based tile resizing.
 * 
 * @param hooks - Session configuration and callbacks
 * @param pointerId - Pointer ID for capture
 */
export function startResizeSession(hooks: ResizeSessionHooks, pointerId: number): void {
  const { model, renderer, container, el, edge, resizeConfig, redistributeConfig } = hooks;
  const startX = hooks.startX;
  const startY = hooks.startY;
  const isVertical = edge.side === 'left' || edge.side === 'right';
  const CLAMP_DEADBAND_PX = resizeConfig?.clampDeadbandPx ?? DEFAULT_CLAMP_DEADBAND_PX;
  
  // Redistribute config
  const redistributeEnabled = redistributeConfig?.enabled !== false;
  const minTileWidth = redistributeConfig?.minWidth ?? 10;
  const minTileHeight = redistributeConfig?.minHeight ?? 10;
  
  // Pointer tracking
  let lastPointerX = startX;
  let lastPointerY = startY;
  let running = true;
  let rafId = 0;
  
  // Initialize states
  const visualState = createVisualFeedbackState();
  const keyboardState = createKeyboardState();
  const redistributeState = createRedistributeModeState();
  const normalResizeState = createNormalResizeState();
  
  // Cache DOM elements at session start for performance
  const tileElements = new Map<string, HTMLElement>();
  container.querySelectorAll<HTMLElement>('.ud-tile').forEach(tileEl => {
    const id = tileEl.dataset.tileId;
    if (id) tileElements.set(id, tileEl);
  });
  
  // Cache container rect at session start
  const cachedContainerRect = container.getBoundingClientRect();
  
  // Store original edge position (seam position)
  const originalEdgePosition = isVertical
    ? edge.x
    : edge.y;
  
  // Get current tiles helper
  const getCurrentTiles = (): TileRect[] => {
    const state = model.getState();
    return state.toArray().map((t: { id: TileId; x: number; y: number; width: number; height: number }) => ({
      id: t.id,
      x: t.x,
      y: t.y,
      width: t.width,
      height: t.height,
    }));
  };
  
  // Create keyboard handlers
  const { onKeyDown, onKeyUp } = createKeyboardHandlers(
    container,
    tileElements,
    visualState,
    keyboardState,
    redistributeEnabled,
    getCurrentTiles,
    () => running
  );
  
  // Pointer move handler
  const onMove = (eMove: PointerEvent): void => {
    lastPointerX = eMove.clientX;
    lastPointerY = eMove.clientY;
    if (running && !rafId) {
      rafId = requestAnimationFrame(() => void tick());
    }
  };
  
  // Pointer up handler
  const onUp = (eUp: PointerEvent): void => {
    try {
      el.releasePointerCapture(pointerId);
    } catch { /* ignore */ }
    eUp.preventDefault();
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    
    resetEdgeElement(el);
    container.classList.remove('redistribute-mode');
    
    let newTileIdForAnimation: TileId | null = null;
    let committed = normalResizeState.hasCommitted;
    
    // Handle redistribute mode commit
    if (keyboardState.shiftKeyHeld && keyboardState.pendingRedistributeLayout) {
      const result = commitRedistribute(
        keyboardState,
        redistributeState,
        model,
        tileElements
      );
      
      if (result.committed) {
        committed = true;
        newTileIdForAnimation = result.newTileId;
      } else {
        // Revert visual preview
        applyVisualPreview(visualState, tileElements, keyboardState.originalTileMap, null);
      }
      
      // Clean up ghost tile
      updateGhostTileElement(container, visualState, null);
      redistributeState.ghostTile = null;
    } else if (visualState.previewApplied) {
      // No pending layout but preview was applied - reset
      applyVisualPreview(visualState, tileElements, keyboardState.originalTileMap, null);
      updateGhostTileElement(container, visualState, null);
      redistributeState.ghostTile = null;
    }
    
    // Cleanup with animation delay
    setTimeout(() => {
      setTileTransitions(tileElements, false);
      tileElements.forEach(tileEl => {
        tileEl.classList.remove('redistribute-committing');
      });
      
      if (committed) {
        renderer.render?.();
        
        // Add success flash to newly created tile
        if (newTileIdForAnimation) {
          setTimeout(() => {
            const newTileEl = container.querySelector(`[data-tile-id="${newTileIdForAnimation}"]`) as HTMLElement;
            if (newTileEl) {
              newTileEl.classList.add('redistribute-new-tile');
              setTimeout(() => {
                newTileEl.classList.remove('redistribute-new-tile');
              }, 400);
            }
          }, 50);
        }
      }
    }, 300);
    
    // Reset all state
    resetKeyboardState(keyboardState);
    redistributeState.ghostTile = null;
    
    // Record history at end of session
    if (committed) {
      model.recordHistory();
    }
    
    hooks.onSessionEnd(committed);
    hooks.clearBoundaryOverlays();
    hooks.rebuildOverlays();
    
    // Clean up event listeners
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointercancel', onUp);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  };
  
  // Main tick function
  const tick = async (): Promise<void> => {
    rafId = 0;
    if (!running) return;
    
    const rect = cachedContainerRect;
    const dxPct = ((lastPointerX - startX) / rect.width) * 100;
    const dyPct = ((lastPointerY - startY) / rect.height) * 100;
    const cursorDelta = isVertical ? dxPct : dyPct;
    
    // REDISTRIBUTE MODE (Shift held)
    if (keyboardState.shiftKeyHeld && redistributeEnabled) {
      const cursorX = ((lastPointerX - rect.left) / rect.width) * 100;
      const cursorY = ((lastPointerY - rect.top) / rect.height) * 100;
      
      // Threshold check for option recalculation
      const cursorPctForThreshold = isVertical ? cursorX : cursorY;
      const cursorMovedEnough = Math.abs(cursorPctForThreshold - keyboardState.lastRedistributeCursorPct) >= REDISTRIBUTE_THRESHOLD_PCT;
      const shouldRecalcOptions = cursorMovedEnough || keyboardState.redistributeOptions.length === 0;
      
      if (cursorMovedEnough) {
        keyboardState.lastRedistributeCursorPct = cursorPctForThreshold;
      }
      
      const redistributeContext = {
        container,
        tileElements,
        isVertical,
        originalEdgePosition,
        minTileWidth,
        minTileHeight,
        el,
        cachedContainerRect,
      };
      
      const redistributeActive = processRedistributeMode(
        redistributeContext,
        keyboardState,
        visualState,
        redistributeState,
        cursorDelta,
        cursorX,
        cursorY,
        shouldRecalcOptions
      );
      
      if (!redistributeActive) {
        // Show OOB state
        el.style.opacity = '';
        el.classList.add('edge--oob');
        const px = (isVertical ? rect.width : rect.height) * (cursorDelta / 100);
        el.style.transform = isVertical ? `translateX(${px}px)` : `translateY(${px}px)`;
      } else {
        el.classList.remove('edge--oob');
      }
      
      if (running && !rafId) {
        rafId = requestAnimationFrame(() => void tick());
      }
      return;
    }
    
    // NORMAL RESIZE MODE
    const normalResizeContext = {
      model,
      renderer,
      edge,
      el,
      isVertical,
      clampDeadbandPx: CLAMP_DEADBAND_PX,
      cachedContainerRect,
      onResizeMove: hooks.onResizeMove,
    };
    
    await processNormalResize(normalResizeContext, normalResizeState, cursorDelta);
    
    if (running && !rafId) {
      rafId = requestAnimationFrame(() => void tick());
    }
  };
  
  // Start session
  hooks.onSessionStart();
  try {
    el.setPointerCapture(pointerId);
  } catch { /* ignore */ }
  
  // Add pointer event listeners
  el.addEventListener('pointermove', onMove, { passive: false });
  el.addEventListener('pointerup', onUp, { passive: false });
  el.addEventListener('pointercancel', onUp, { passive: false });
  
  // Add keyboard listeners for redistribute mode
  if (redistributeEnabled) {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  }
  
  // Start animation loop
  if (!rafId) {
    rafId = requestAnimationFrame(() => void tick());
  }
}
