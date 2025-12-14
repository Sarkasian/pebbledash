import { useCallback, useMemo } from 'react';
import type { PartialExtendedConfig, TileId, Tile } from '@pebbledash/core';
import { useInternalDashboardContext, useDashboardContextOptional } from '../context/DashboardContext.js';
import type { DashboardState, DashboardApi } from '../types.js';

/**
 * Hook to access the dashboard state and API.
 * 
 * Can be used in two ways:
 * 1. Inside a Dashboard component's children (uses internal context)
 * 2. Inside a DashboardProvider (uses provider context)
 * 
 * @returns Dashboard state and control methods
 * 
 * @example
 * ```tsx
 * function MyToolbar() {
 *   const { mode, setMode, canUndo, undo, canRedo, redo } = useDashboard();
 *   
 *   return (
 *     <div>
 *       <button onClick={() => setMode('insert')} disabled={mode === 'insert'}>
 *         Insert
 *       </button>
 *       <button onClick={() => setMode('resize')} disabled={mode === 'resize'}>
 *         Resize
 *       </button>
 *       <button onClick={undo} disabled={!canUndo}>Undo</button>
 *       <button onClick={redo} disabled={!canRedo}>Redo</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useDashboard(): DashboardState & {
  /** Set the interaction mode */
  setMode: (mode: 'insert' | 'resize') => void;
  /** Undo the last operation */
  undo: () => void;
  /** Redo the last undone operation */
  redo: () => void;
  /** Announce a message for screen readers */
  announce: (message: string) => void;
  /** Start config preview mode */
  startConfigPreview: (config: PartialExtendedConfig) => void;
  /** End config preview mode */
  endConfigPreview: () => void;
  /** Check if config preview is active */
  isConfigPreviewActive: () => boolean;
  /** Get tiles affected by current preview */
  getPreviewAffectedTiles: () => TileId[];
  /** Split a tile */
  splitTile: (tileId: TileId, options: { orientation: 'horizontal' | 'vertical'; ratio?: number }) => Promise<TileId | null>;
  /** Delete a tile */
  deleteTile: (tileId: TileId) => Promise<boolean>;
  /** Update tile metadata */
  updateTileMeta: (tileId: TileId, meta: Record<string, unknown>) => void;
} {
  // Try internal context first (from Dashboard component)
  const internalContext = useInternalDashboardContext();
  // Fall back to provider context
  const providerContext = useDashboardContextOptional();
  
  // Use whichever context is available
  const context = internalContext || providerContext;
  
  const state: DashboardState = context ? {
    dashboard: context.dashboard,
    model: context.model,
    mode: context.mode,
    canUndo: context.canUndo,
    canRedo: context.canRedo,
    isReady: context.isReady,
    tiles: context.tiles,
  } : {
    dashboard: null,
    model: null,
    mode: 'insert',
    canUndo: false,
    canRedo: false,
    isReady: false,
    tiles: [],
  };

  const setMode = useCallback((mode: 'insert' | 'resize') => {
    if (context?.setMode) {
      context.setMode(mode);
    }
  }, [context]);

  const undo = useCallback(() => {
    state.dashboard?.undo();
  }, [state.dashboard]);

  const redo = useCallback(() => {
    state.dashboard?.redo();
  }, [state.dashboard]);

  const announce = useCallback((message: string) => {
    state.dashboard?.announce(message);
  }, [state.dashboard]);

  const startConfigPreview = useCallback((config: PartialExtendedConfig) => {
    state.dashboard?.startConfigPreview(config);
  }, [state.dashboard]);

  const endConfigPreview = useCallback(() => {
    state.dashboard?.endConfigPreview();
  }, [state.dashboard]);

  const isConfigPreviewActive = useCallback(() => {
    return state.dashboard?.isConfigPreviewActive() ?? false;
  }, [state.dashboard]);

  const getPreviewAffectedTiles = useCallback(() => {
    return state.dashboard?.getPreviewAffectedTiles() ?? [];
  }, [state.dashboard]);

  const splitTile = useCallback(async (
    tileId: TileId, 
    options: { orientation: 'horizontal' | 'vertical'; ratio?: number }
  ): Promise<TileId | null> => {
    if (!state.model) return null;
    const result = await state.model.splitTile(tileId, options);
    return result.newTileId ?? null;
  }, [state.model]);

  const deleteTile = useCallback(async (tileId: TileId): Promise<boolean> => {
    if (!state.model) return false;
    const result = await state.model.deleteTile(tileId);
    return result.valid;
  }, [state.model]);

  const updateTileMeta = useCallback((tileId: TileId, meta: Record<string, unknown>) => {
    if (!state.model) return;
    const tile = state.model.getState().tiles.get(tileId);
    if (tile) {
      state.model.updateTile(tileId, { meta: { ...tile.meta, ...meta } });
    }
  }, [state.model]);

  return {
    ...state,
    setMode,
    undo,
    redo,
    announce,
    startConfigPreview,
    endConfigPreview,
    isConfigPreviewActive,
    getPreviewAffectedTiles,
    splitTile,
    deleteTile,
    updateTileMeta,
  };
}

