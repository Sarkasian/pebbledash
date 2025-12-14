/**
 * Normal resize mode logic for resize session.
 * Handles the standard seam-based resize behavior (without Shift key).
 */

import type { DashboardModel, TileId, ResizeEdge } from '@pebbledash/core';
import type { EdgeData } from '../resizeTypes.js';
import { APPLY_EPS } from '../resizeTypes.js';

/**
 * State for normal resize mode
 */
export interface NormalResizeState {
  lastApplied: number;
  lockedAtLimit: boolean;
  lastPreviewPx: number;
  lastOob: boolean;
  hasCommitted: boolean;
  processing: boolean;
}

/**
 * Create initial normal resize state
 */
export function createNormalResizeState(): NormalResizeState {
  return {
    lastApplied: 0,
    lockedAtLimit: false,
    lastPreviewPx: 0,
    lastOob: false,
    hasCommitted: false,
    processing: false,
  };
}

/**
 * Context for normal resize operations
 */
export interface NormalResizeContext {
  model: DashboardModel;
  renderer: { render?: () => void };
  edge: EdgeData;
  el: HTMLElement;
  isVertical: boolean;
  clampDeadbandPx: number;
  cachedContainerRect: DOMRect;
  onResizeMove?: (delta: number, clamped: boolean) => void;
}

/**
 * Process a tick of normal resize mode.
 * Updates the edge preview and applies resize if needed.
 */
export async function processNormalResize(
  ctx: NormalResizeContext,
  state: NormalResizeState,
  cursorDelta: number
): Promise<void> {
  const { model, renderer, edge, el, isVertical, clampDeadbandPx, cachedContainerRect, onResizeMove } = ctx;
  const rect = cachedContainerRect;
  
  // Get live clamp from current state for the resize operation
  const clamp = model.clampResize(edge.tileId, {
    edge: edge.side,
    delta: cursorDelta,
  });
  
  // Compute live bounds in session-relative coordinates
  const liveMin = clamp.min + state.lastApplied;
  const liveMax = clamp.max + state.lastApplied;
  
  // Use live bounds directly
  const clampedTarget = Math.max(liveMin, Math.min(liveMax, cursorDelta));
  const overshoot = cursorDelta - clampedTarget;
  const diffPx = (Math.abs(overshoot) * (isVertical ? rect.width : rect.height)) / 100;
  const isOob = diffPx > clampDeadbandPx;
  
  if (isOob) {
    if (!state.lockedAtLimit) {
      state.lockedAtLimit = true;
    }
    if (!state.lastOob) {
      el.classList.add('edge--oob');
      state.lastOob = true;
    }
  } else {
    state.lockedAtLimit = false;
    if (state.lastOob) {
      el.classList.remove('edge--oob');
      state.lastOob = false;
    }
  }
  
  const previewShiftPct = state.lockedAtLimit ? 0 : clampedTarget - state.lastApplied;
  const px = (isVertical ? rect.width : rect.height) * (previewShiftPct / 100);
  
  if (Math.abs(px - state.lastPreviewPx) > 0.05) {
    el.style.transform = isVertical ? `translateX(${px}px)` : `translateY(${px}px)`;
    state.lastPreviewPx = px;
  }
  
  const deltaToApply = clampedTarget - state.lastApplied;
  const rangeZero = Math.abs(liveMax - liveMin) <= APPLY_EPS;
  
  if (rangeZero && isOob) {
    el.classList.add('edge--oob');
  }
  
  // Fire the resize move callback
  const isClamped = Math.abs(cursorDelta - clampedTarget) > APPLY_EPS;
  onResizeMove?.(cursorDelta, isClamped);
  
  if (Math.abs(deltaToApply) <= APPLY_EPS || state.lockedAtLimit || state.processing) {
    if (state.lockedAtLimit) {
      el.style.transform = '';
      state.lastPreviewPx = 0;
    }
    return;
  }
  
  state.processing = true;
  try {
    const res = await model.resizeTile(edge.tileId, {
      edge: edge.side,
      delta: deltaToApply,
      skipHistory: true,
    });
    
    if (res.valid) {
      state.hasCommitted = true;
      state.lastApplied = clampedTarget;
      renderer.render?.();
      
      const updatedTile = model.getState().tiles.get(edge.tileId);
      if (updatedTile) {
        if (isVertical) {
          const seamX = edge.side === 'left' ? updatedTile.x : updatedTile.x + updatedTile.width;
          el.style.left = `${seamX}%`;
          el.style.top = `${updatedTile.y}%`;
          el.style.height = `${updatedTile.height}%`;
        } else {
          const seamY = edge.side === 'top' ? updatedTile.y : updatedTile.y + updatedTile.height;
          el.style.top = `${seamY}%`;
          el.style.left = `${updatedTile.x}%`;
          el.style.width = `${updatedTile.width}%`;
        }
      }
      
      el.style.transform = '';
      state.lastPreviewPx = 0;
    }
  } finally {
    state.processing = false;
  }
}

/**
 * Reset the edge element styling when session ends
 */
export function resetEdgeElement(el: HTMLElement): void {
  el.style.transform = '';
  el.style.opacity = '';
  el.classList.remove('edge--oob');
}

