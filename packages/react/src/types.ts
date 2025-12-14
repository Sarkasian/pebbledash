import type { 
  DashboardModel, 
  TileId, 
  ResizeEdge, 
  SnapshotV1, 
  PartialExtendedConfig,
  Tile,
} from '@pebbledash/core';
import type { WidgetRegistry } from '@pebbledash/renderer-dom';

/**
 * Initial layout for the dashboard.
 * Can be a full SnapshotV1 or a simplified tile array.
 */
export type InitialLayout =
  | SnapshotV1
  | {
      tiles: Array<{
        id: TileId | string;
        x: number;
        y: number;
        width: number;
        height: number;
        locked?: boolean;
        meta?: Record<string, unknown>;
      }>;
    };

/**
 * Configuration for resize behavior.
 */
export interface ResizeConfig {
  /** Minimum pixel range for resize to be enabled (default: 2) */
  minResizeRangePx?: number;
  /** Deadband for clamp feedback in pixels (default: 1) */
  clampDeadbandPx?: number;
  /** Minimum pixels to drag before resize starts (default: 3) */
  dragThreshold?: number;
  /** When using Shift+drag redistribute, shrink all tiles equally (default: false) */
  redistributeEqually?: boolean;
}

/**
 * Feature flags for the dashboard.
 */
export interface DashboardFeatures {
  /** Enable edge overlays for insert/resize (default: true) */
  overlays?: boolean;
  /** Enable keyboard navigation (default: true) */
  keyboard?: boolean;
  /** Initial mode (default: 'insert') */
  startMode?: 'insert' | 'resize';
  /** Enable Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts (default: false) */
  keyboardUndoRedo?: boolean;
  /** Enable Delete/Backspace to delete hovered tile (default: false) */
  keyboardDelete?: boolean;
}

/**
 * Default configuration for the dashboard model.
 */
export interface DashboardDefaults {
  /** Minimum tile dimensions as percentages */
  minTile?: { width: number; height: number };
  /** Maximum number of tiles allowed */
  maxTiles?: number;
  /** Epsilon for floating point comparisons (default: 1e-6) */
  epsilon?: number;
}

/**
 * Props for the Dashboard component.
 */
export interface DashboardProps {
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Registry of widget factories keyed by widget type */
  widgets?: WidgetRegistry;
  /** Default configuration for the model */
  defaults?: DashboardDefaults;
  /** Initial layout to render */
  initialLayout?: InitialLayout;
  /** Feature flags */
  features?: DashboardFeatures;
  /** Resize behavior configuration */
  resizeConfig?: ResizeConfig;

  // === Tile Interaction Callbacks ===
  /** Called when a tile is clicked (not on resize edges or during drag) */
  onTileClick?: (tileId: TileId, event: MouseEvent) => void;
  /** Called when a tile is double-clicked */
  onTileDoubleClick?: (tileId: TileId, event: MouseEvent) => void;
  /** Called when pointer enters/leaves a tile */
  onTileHover?: (tileId: TileId, entering: boolean, event: MouseEvent) => void;
  /** Called when a tile receives/loses focus */
  onTileFocus?: (tileId: TileId, focused: boolean) => void;
  /** Called on right-click for custom context menus */
  onTileContextMenu?: (tileId: TileId, event: MouseEvent) => void;

  // === History Callbacks ===
  /** Called when undo/redo availability changes */
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;

  // === Mode Callbacks ===
  /** Called when interaction mode changes */
  onModeChange?: (newMode: 'insert' | 'resize', previousMode: 'insert' | 'resize') => void;

  // === Container Callbacks ===
  /** Called when container is resized */
  onContainerResize?: (width: number, height: number) => void;

  // === Resize Operation Callbacks ===
  /** Called when resize drag starts */
  onResizeStart?: (tileId: TileId, edge: ResizeEdge) => void;
  /** Called during resize with live delta (for preview UI) */
  onResizeMove?: (tileId: TileId, edge: ResizeEdge, delta: number, clamped: boolean) => void;
  /** Called when resize drag ends */
  onResizeEnd?: (tileId: TileId, edge: ResizeEdge, committed: boolean) => void;

  // === State Callbacks ===
  /** Called when tiles change (for external state sync) */
  onTilesChange?: (tiles: Tile[]) => void;
  /** Called when the dashboard is ready */
  onReady?: (dashboard: DashboardApi) => void;
}

/**
 * API exposed by the dashboard for imperative control.
 */
export interface DashboardApi {
  /** Get the underlying DashboardModel */
  getModel(): DashboardModel;
  /** Set the interaction mode */
  setMode(mode: 'insert' | 'resize'): void;
  /** Get the current mode */
  getMode(): 'insert' | 'resize';
  /** Undo the last operation */
  undo(): void;
  /** Redo the last undone operation */
  redo(): void;
  /** Check if undo is available */
  canUndo(): boolean;
  /** Check if redo is available */
  canRedo(): boolean;
  /** Announce a message for screen readers */
  announce(message: string): void;
  /** Start config preview mode */
  startConfigPreview(config: PartialExtendedConfig): void;
  /** End config preview mode */
  endConfigPreview(): void;
  /** Check if config preview is active */
  isConfigPreviewActive(): boolean;
  /** Get tiles affected by current preview */
  getPreviewAffectedTiles(): TileId[];
  /** Force a re-render */
  render(): void;
}

/**
 * State returned by the useDashboard hook.
 */
export interface DashboardState {
  /** The dashboard API (null until mounted) */
  dashboard: DashboardApi | null;
  /** The underlying model (null until mounted) */
  model: DashboardModel | null;
  /** Current interaction mode */
  mode: 'insert' | 'resize';
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Whether the dashboard is ready */
  isReady: boolean;
  /** All tiles in the dashboard */
  tiles: Tile[];
}

/**
 * State returned by the useTile hook.
 */
export interface TileState {
  /** The tile data (null if not found) */
  tile: Tile | null;
  /** Whether the tile exists */
  exists: boolean;
}

/**
 * Context value for the DashboardProvider.
 */
export interface DashboardContextValue extends DashboardState {
  /** Set the interaction mode */
  setMode: (mode: 'insert' | 'resize') => void;
}

