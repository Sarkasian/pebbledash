import { useMemo, useCallback } from 'react';
import type { TileId, Tile } from '@pebbledash/core';
import { useInternalDashboardContext, useDashboardContextOptional } from '../context/DashboardContext.js';
import type { TileState } from '../types.js';

/**
 * Hook to access a specific tile's state and methods.
 * 
 * @param tileId - The ID of the tile to access
 * @returns Tile state and control methods
 * 
 * @example
 * ```tsx
 * function TileInfo({ tileId }: { tileId: TileId }) {
 *   const { tile, exists, updateMeta, remove, split } = useTile(tileId);
 *   
 *   if (!exists) {
 *     return <div>Tile not found</div>;
 *   }
 *   
 *   return (
 *     <div>
 *       <p>Position: ({tile.x}, {tile.y})</p>
 *       <p>Size: {tile.width}% x {tile.height}%</p>
 *       <button onClick={() => updateMeta({ highlighted: true })}>
 *         Highlight
 *       </button>
 *       <button onClick={() => split('vertical')}>Split</button>
 *       <button onClick={remove}>Remove</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTile(tileId: TileId): TileState & {
  /** Update the tile's metadata */
  updateMeta: (meta: Record<string, unknown>) => void;
  /** Remove the tile */
  remove: () => Promise<boolean>;
  /** Split the tile */
  split: (orientation: 'horizontal' | 'vertical', ratio?: number) => Promise<TileId | null>;
  /** Lock/unlock the tile */
  setLocked: (locked: boolean) => void;
  /** Check if the tile is locked */
  isLocked: boolean;
} {
  // Try internal context first (from Dashboard component)
  const internalContext = useInternalDashboardContext();
  // Fall back to provider context
  const providerContext = useDashboardContextOptional();
  
  // Use whichever context is available
  const context = internalContext || providerContext;
  
  const tile = useMemo(() => {
    if (!context?.tiles) return null;
    return context.tiles.find(t => t.id === tileId) ?? null;
  }, [context?.tiles, tileId]);

  const exists = tile !== null;
  const isLocked = tile?.locked ?? false;

  const updateMeta = useCallback((meta: Record<string, unknown>) => {
    if (!context?.model || !tile) return;
    context.model.updateTile(tileId, { 
      meta: { ...tile.meta, ...meta } 
    });
  }, [context?.model, tile, tileId]);

  const remove = useCallback(async (): Promise<boolean> => {
    if (!context?.model) return false;
    const result = await context.model.deleteTile(tileId);
    return result.valid;
  }, [context?.model, tileId]);

  const split = useCallback(async (
    orientation: 'horizontal' | 'vertical', 
    ratio: number = 0.5
  ): Promise<TileId | null> => {
    if (!context?.model) return null;
    const result = await context.model.splitTile(tileId, { orientation, ratio });
    return result.newTileId ?? null;
  }, [context?.model, tileId]);

  const setLocked = useCallback((locked: boolean) => {
    if (!context?.model) return;
    context.model.updateTile(tileId, { locked });
  }, [context?.model, tileId]);

  return {
    tile,
    exists,
    isLocked,
    updateMeta,
    remove,
    split,
    setLocked,
  };
}

/**
 * Hook to access all tiles in the dashboard.
 * 
 * @returns Array of all tiles
 * 
 * @example
 * ```tsx
 * function TileList() {
 *   const tiles = useTiles();
 *   
 *   return (
 *     <ul>
 *       {tiles.map(tile => (
 *         <li key={tile.id}>
 *           Tile {tile.id}: {tile.width}% x {tile.height}%
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useTiles(): Tile[] {
  // Try internal context first (from Dashboard component)
  const internalContext = useInternalDashboardContext();
  // Fall back to provider context
  const providerContext = useDashboardContextOptional();
  
  // Use whichever context is available
  const context = internalContext || providerContext;
  
  return context?.tiles ?? [];
}

