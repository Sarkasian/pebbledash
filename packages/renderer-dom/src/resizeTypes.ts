/**
 * Types and interfaces for resize operations.
 * Shared between resizeSession.ts and redistributeUtils.ts
 */

import type { DashboardModel, TileId, ResizeEdge, TileRect } from '@pebbledash/core';

/**
 * Data about an edge being dragged
 */
export interface EdgeData {
  tileId: TileId;
  side: ResizeEdge;
  orientation: 'vertical' | 'horizontal';
  x: number;
  y: number;
  width: number;
  height: number;
  seamId?: string;
}

/**
 * Configuration for resize behavior
 */
export interface ResizeConfig {
  /** Minimum pixel range for resize to be enabled (default: 2) */
  minResizeRangePx?: number;
  /** Deadband for clamp feedback in pixels (default: 1) */
  clampDeadbandPx?: number;
  /** Minimum pixels to drag before resize starts (default: 3) */
  dragThreshold?: number;
}

/**
 * Configuration for redistribute mode (Shift + drag)
 */
export interface RedistributeConfig {
  /** Enable redistribute mode (default: true) */
  enabled?: boolean;
  /** Minimum tile width as percentage (default: 10) */
  minWidth?: number;
  /** Minimum tile height as percentage (default: 10) */
  minHeight?: number;
  /** If true, tiles in shrink chain resize proportionally. If false, first tile shrinks to min before next starts. */
  redistributeEqually?: boolean;
}

/**
 * A redistribute option describing how tiles will be rearranged
 */
export interface RedistributeOption {
  /** Description of the option (e.g., "Shrink A from top") */
  description: string;
  /** Direction the neighbor shrinks from ('top', 'bottom', 'left', 'right') */
  shrinkDirection: 'top' | 'bottom' | 'left' | 'right';
  /** The resulting tile positions */
  tiles: TileRect[];
  /** Area retained by the shrinking tile (for sorting) */
  neighborRetainedArea: number;
}

/**
 * Ghost tile that appears in gaps during redistribute
 */
export interface GhostTile {
  x: number;
  y: number;
  width: number;
  height: number;
  /** false if < min size (shows red) */
  isValid: boolean;
}

/**
 * Hooks for resize session lifecycle
 */
export interface ResizeSessionHooks {
  model: DashboardModel;
  renderer: { render?: () => void };
  container: HTMLElement;
  el: HTMLElement;
  edge: EdgeData;
  startX: number;
  startY: number;
  onSessionStart(): void;
  /** Called when session ends, with flag indicating if any resize was committed */
  onSessionEnd(committed?: boolean): void;
  /** Called during resize with live delta (for preview UI) */
  onResizeMove?: (delta: number, clamped: boolean) => void;
  clearBoundaryOverlays(): void;
  rebuildOverlays(): void;
  /** Optional resize configuration */
  resizeConfig?: ResizeConfig;
  /** Optional redistribute configuration (Shift + drag) */
  redistributeConfig?: RedistributeConfig;
}

// Re-export TileRect for convenience
export type { TileRect, TileId, ResizeEdge } from '@pebbledash/core';

// Constants
export const DEFAULT_CLAMP_DEADBAND_PX = 1;
export const APPLY_EPS = 0.01;
export const REDISTRIBUTE_THRESHOLD_PCT = 0.5;

