// Curated public API surface
export type TileId = string & { readonly __brand: 'TileId' };
export { Tile, validateTile } from './entities/Tile.js';
export type { TileConstraints } from './entities/Tile.js';
export { TileGroup } from './entities/TileGroup.js';
export { DashboardState } from './entities/DashboardState.js';
export { TileRepository } from './repository/TileRepository.js';
export { TileState } from './state/TileState.js';
export type {
  Operation,
  DecisionContext,
  DecisionResult,
  Violation,
} from './decision-engine/types.js';
export { StrategyRegistry } from './strategies/StrategyRegistry.js';
export { DashboardModel } from './model/DashboardModel.js';
export { HistoryManager } from './history/HistoryManager.js';
export type { SnapshotV1, PersistenceAdapter } from './persistence/PersistenceAdapter.js';
export { MemoryAdapter } from './persistence/MemoryAdapter.js';
export { LocalStorageAdapter } from './persistence/LocalStorageAdapter.js';
export { APIAdapter } from './persistence/APIAdapter.js';
export { PersistenceManager } from './persistence/PersistenceManager.js';
export { Plugin } from './plugins/Plugin.js';
export { PluginManager } from './plugins/PluginManager.js';
export { LifecycleManager } from './lifecycle/LifecycleManager.js';
export type { Seam } from './entities/Seam.js';
// Keep seam helpers exported for tests and advanced usage (may be moved to internal later)
export {
  clampSeamDelta,
  applySeamDelta,
  seamIdForEdge,
  resolveEdgeToSeamId,
  coversSpan,
  coversFullSpanVertical,
  coversFullSpanHorizontal,
} from './seams/index.js';

// Configuration system
export { ConfigManager } from './config/ConfigManager.js';
export type {
  ExtendedConfig,
  PartialExtendedConfig,
  BorderConfig,
  AnimationConfig,
  SnapThresholdsConfig,
  TileDefaultsConfig,
  ConfigChangeResult,
  ValidationResult,
  ValidationError,
  ConfigPersistenceAdapter,
  ConfigEvent,
  ConfigEventHandler,
  ConfigManagerOptions,
} from './config/types.js';
export { CURRENT_CONFIG_VERSION } from './config/types.js';
export {
  DEFAULT_CONFIG,
  createConfig,
  getEffectiveMinWidth,
  getEffectiveMinHeight,
  getEffectiveMaxWidth,
  getEffectiveMaxHeight,
} from './config/defaults.js';
export {
  MemoryConfigAdapter,
  LocalStorageConfigAdapter,
  CallbackConfigAdapter,
} from './config/ConfigPersistence.js';
export { validateConfig, validatePartialConfig } from './config/validation.js';
export { migrateConfig } from './config/migrations.js';
export { autoAdjustLayout, getAffectedTiles } from './config/autoAdjust.js';

// Error types for programmatic error handling
export {
  ErrorCode,
  DashboardError,
  TileValidationError,
  StateValidationError,
  OperationError,
  ConfigError,
  PersistenceError,
  isDashboardError,
  hasErrorCode,
} from './errors.js';
export type { ErrorCodeType } from './errors.js';
