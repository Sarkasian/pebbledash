/**
 * @pebbledash/react - React bindings for pebbledash dashboards
 * 
 * @packageDocumentation
 */

// Main component
export { Dashboard } from './Dashboard.js';

// Context and Provider
export { 
  DashboardProvider,
  DashboardContext,
  useDashboardContext,
  useDashboardContextOptional,
} from './context/DashboardContext.js';

// Hooks
export { useDashboard } from './hooks/useDashboard.js';
export { useTile, useTiles } from './hooks/useTile.js';

// Types
export type {
  DashboardProps,
  DashboardApi,
  DashboardState,
  DashboardContextValue,
  DashboardDefaults,
  DashboardFeatures,
  InitialLayout,
  ResizeConfig,
  TileState,
} from './types.js';

// Re-export core types for convenience
export type { 
  TileId, 
  Tile, 
  ResizeEdge,
  SnapshotV1,
  PartialExtendedConfig,
  DashboardModel,
} from '@pebbledash/core';

// Re-export widget types for convenience
export type {
  Widget,
  WidgetFactory,
  WidgetRegistry,
  WidgetContext,
  OverlayPosition,
} from '@pebbledash/renderer-dom';
