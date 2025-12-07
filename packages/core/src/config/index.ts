// Types
export type {
  ExtendedConfig,
  PartialExtendedConfig,
  BorderConfig,
  AnimationConfig,
  SnapThresholdsConfig,
  TileDefaultsConfig,
  TileConstraints,
  ConfigChangeResult,
  ValidationError,
  ValidationResult,
  ConfigPersistenceAdapter,
  ConfigEvent,
  ConfigEventHandler,
  WillChangePayload,
  DidChangePayload,
  ValidatePayload,
  PreviewPayload,
  CallbackConfigAdapterOptions,
  LocalStorageConfigAdapterOptions,
  ConfigManagerOptions,
} from './types.js';

export { CURRENT_CONFIG_VERSION } from './types.js';

// Defaults
export {
  DEFAULT_CONFIG,
  DEFAULT_BORDER,
  DEFAULT_ANIMATION,
  DEFAULT_SNAP_THRESHOLDS,
  DEFAULT_TILE_DEFAULTS,
  createConfig,
  getEffectiveMinWidth,
  getEffectiveMinHeight,
  getEffectiveMaxWidth,
  getEffectiveMaxHeight,
} from './defaults.js';

// Persistence adapters
export {
  MemoryConfigAdapter,
  LocalStorageConfigAdapter,
  CallbackConfigAdapter,
} from './ConfigPersistence.js';

// Validation
export { validateConfig, validatePartialConfig } from './validation.js';

// Migrations
export { migrateConfig } from './migrations.js';

// Auto-adjustment
export { autoAdjustLayout, type AutoAdjustResult } from './autoAdjust.js';

// ConfigManager
export { ConfigManager } from './ConfigManager.js';
