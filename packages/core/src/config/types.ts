import type { TileId } from '../index.js';

/**
 * Current config schema version.
 * Increment when making breaking changes to the config structure.
 */
export const CURRENT_CONFIG_VERSION = 1;

/**
 * Border styling configuration for tiles.
 */
export interface BorderConfig {
  /** Border width in pixels (default: 1) */
  width: number;
  /** Border style (default: 'solid') */
  style: 'solid' | 'dashed' | 'dotted' | 'none';
  /** Border color as CSS color string (default: '#e0e0e0') */
  color: string;
}

/**
 * Animation configuration for tile transitions.
 */
export interface AnimationConfig {
  /** Animation duration in milliseconds (default: 200) */
  duration: number;
  /** CSS easing function (default: 'ease-out') */
  easing: string;
  /** Whether animations are enabled (default: true) */
  enabled: boolean;
}

/**
 * Snap threshold configuration for resize operations.
 */
export interface SnapThresholdsConfig {
  /** Snap threshold for resize operations in percentage (default: 1) */
  resize: number;
  /** Optional grid snap size in percentage (default: undefined - no grid) */
  grid?: number;
}

/**
 * Default constraints applied to all tiles unless overridden.
 */
export interface TileDefaultsConfig {
  /** Minimum tile width as percentage (default: inherited from minTile.width) */
  minWidth?: number;
  /** Minimum tile height as percentage (default: inherited from minTile.height) */
  minHeight?: number;
  /** Maximum tile width as percentage (default: 100) */
  maxWidth?: number;
  /** Maximum tile height as percentage (default: 100) */
  maxHeight?: number;
  /** Aspect ratio constraint (width/height), null for no constraint (default: null) */
  aspectRatio?: number | null;
}

/**
 * Per-tile constraint overrides.
 */
export interface TileConstraints {
  /** Minimum tile width as percentage */
  minWidth?: number;
  /** Minimum tile height as percentage */
  minHeight?: number;
  /** Maximum tile width as percentage */
  maxWidth?: number;
  /** Maximum tile height as percentage */
  maxHeight?: number;
  /** Aspect ratio constraint (width/height), null for no constraint */
  aspectRatio?: number | null;
  /** Zones that cannot be resized (edges that are locked) */
  lockedZones?: Array<'top' | 'bottom' | 'left' | 'right'>;
}

/**
 * Extended configuration for the dashboard.
 * All options are optional with sensible defaults.
 */
export interface ExtendedConfig {
  /** Config schema version for migration support */
  version: typeof CURRENT_CONFIG_VERSION;

  // === Core layout settings ===

  /** Minimum tile dimensions in percentage units (default: { width: 5, height: 5 }) */
  minTile: { width: number; height: number };
  /** Maximum number of tiles allowed (default: undefined - no limit) */
  maxTiles?: number;
  /** Floating point tolerance for coordinate comparisons (default: 1e-6) */
  epsilon?: number;

  // === Visual settings (renderer-only, don't affect layout coordinates) ===

  /** CSS gap between tiles in pixels (default: 0) */
  gutter: number;
  /** Border styling for tiles */
  border: BorderConfig;
  /** Animation settings for tile transitions */
  animation: AnimationConfig;

  // === Behavioral settings ===

  /** Snap thresholds for resize operations */
  snapThresholds: SnapThresholdsConfig;
  /** Current interaction mode (default: 'insert') */
  interactionMode: 'insert' | 'resize' | 'locked';

  // === Per-tile constraint defaults ===

  /** Default constraints applied to all tiles */
  tileDefaults: TileDefaultsConfig;
}

/**
 * Partial config for updates - all fields optional except version.
 */
export type PartialExtendedConfig = Partial<Omit<ExtendedConfig, 'version'>> & {
  version?: ExtendedConfig['version'];
};

/**
 * Result of a configuration change operation.
 */
export interface ConfigChangeResult {
  /** Whether the change was successful */
  success: boolean;
  /** The new configuration after the change */
  config: ExtendedConfig;
  /** Tiles that were auto-adjusted to meet new constraints */
  adjustedTiles?: TileId[];
  /** Error message if the change failed */
  error?: string;
  /** Validation errors if any */
  validationErrors?: ValidationError[];
}

/**
 * Single validation error.
 */
export interface ValidationError {
  /** Path to the invalid field (e.g., 'minTile.width') */
  path: string;
  /** Error message */
  message: string;
  /** The invalid value */
  value: unknown;
}

/**
 * Result of config validation.
 */
export interface ValidationResult {
  /** Whether the config is valid */
  valid: boolean;
  /** Validation errors if invalid */
  errors: ValidationError[];
}

/**
 * Persistence adapter interface for config storage.
 * Mirrors the existing PersistenceAdapter pattern used for layout snapshots.
 */
export interface ConfigPersistenceAdapter {
  /**
   * Load configuration from storage.
   * @returns The loaded config, or null if no config exists
   */
  load(): Promise<ExtendedConfig | null>;

  /**
   * Save configuration to storage.
   * @param config - The config to save
   */
  save(config: ExtendedConfig): Promise<void>;

  /**
   * Clear stored configuration.
   * Optional - not all adapters may support this.
   */
  clear?(): Promise<void>;
}

/**
 * Configuration events emitted by ConfigManager.
 */
export type ConfigEvent =
  | 'willChange'
  | 'didChange'
  | 'validate'
  | 'previewStart'
  | 'previewEnd'
  | 'commit'
  | 'revert';

/**
 * Event handler for configuration events.
 */
export type ConfigEventHandler<T = unknown> = (payload: T) => void | Promise<void>;

/**
 * Payload for willChange event.
 */
export interface WillChangePayload {
  /** Current config before change */
  currentConfig: ExtendedConfig;
  /** Proposed changes */
  proposedChanges: PartialExtendedConfig;
}

/**
 * Payload for didChange event.
 */
export interface DidChangePayload {
  /** Previous config */
  previousConfig: ExtendedConfig;
  /** New config after change */
  newConfig: ExtendedConfig;
  /** Tiles that were auto-adjusted */
  adjustedTiles: TileId[];
}

/**
 * Payload for validate event.
 */
export interface ValidatePayload {
  /** Config being validated */
  config: unknown;
  /** Validation result */
  result: ValidationResult;
}

/**
 * Payload for preview events.
 */
export interface PreviewPayload {
  /** Preview config (null on previewEnd) */
  previewConfig: ExtendedConfig | null;
  /** Tiles that would be affected */
  affectedTiles: TileId[];
}

/**
 * Options for creating a CallbackConfigAdapter.
 */
export interface CallbackConfigAdapterOptions {
  /** Callback to load config */
  onLoad: () => Promise<ExtendedConfig | null>;
  /** Callback to save config */
  onSave: (config: ExtendedConfig) => Promise<void>;
  /** Optional callback to clear config */
  onClear?: () => Promise<void>;
}

/**
 * Options for creating a LocalStorageConfigAdapter.
 */
export interface LocalStorageConfigAdapterOptions {
  /** Storage key prefix (default: 'ud-config') */
  keyPrefix?: string;
  /** Dashboard ID for namespacing */
  dashboardId: string;
}

/**
 * Options for ConfigManager constructor.
 */
export interface ConfigManagerOptions {
  /** Unique dashboard identifier for namespacing */
  dashboardId: string;
  /** Initial configuration (merged with defaults) */
  initialConfig?: PartialExtendedConfig;
  /** Persistence adapter (default: MemoryConfigAdapter) */
  adapter?: ConfigPersistenceAdapter;
  /** Whether to auto-save on changes (default: false) */
  autoSave?: boolean;
}
