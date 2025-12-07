import type {
  ExtendedConfig,
  BorderConfig,
  AnimationConfig,
  SnapThresholdsConfig,
  TileDefaultsConfig,
  PartialExtendedConfig,
} from './types.js';
import { CURRENT_CONFIG_VERSION } from './types.js';

/**
 * Default border configuration.
 */
export const DEFAULT_BORDER: BorderConfig = {
  width: 1,
  style: 'solid',
  color: '#e0e0e0',
};

/**
 * Default animation configuration.
 */
export const DEFAULT_ANIMATION: AnimationConfig = {
  duration: 200,
  easing: 'ease-out',
  enabled: true,
};

/**
 * Default snap thresholds configuration.
 */
export const DEFAULT_SNAP_THRESHOLDS: SnapThresholdsConfig = {
  resize: 1,
  grid: undefined,
};

/**
 * Default tile constraints.
 */
export const DEFAULT_TILE_DEFAULTS: TileDefaultsConfig = {
  minWidth: undefined, // Inherits from minTile.width
  minHeight: undefined, // Inherits from minTile.height
  maxWidth: 100,
  maxHeight: 100,
  aspectRatio: null,
};

/**
 * Complete default configuration.
 */
export const DEFAULT_CONFIG: ExtendedConfig = {
  version: CURRENT_CONFIG_VERSION,
  minTile: { width: 5, height: 5 },
  maxTiles: undefined,
  epsilon: 1e-6,
  gutter: 0,
  border: { ...DEFAULT_BORDER },
  animation: { ...DEFAULT_ANIMATION },
  snapThresholds: { ...DEFAULT_SNAP_THRESHOLDS },
  interactionMode: 'insert',
  tileDefaults: { ...DEFAULT_TILE_DEFAULTS },
};

/**
 * Deep merge two objects, with source values overriding target values.
 * Handles nested objects but not arrays (arrays are replaced entirely).
 */
function deepMerge(target: ExtendedConfig, source: Partial<ExtendedConfig>): ExtendedConfig {
  const result = { ...target };

  for (const key of Object.keys(source) as Array<keyof ExtendedConfig>) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue !== undefined &&
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      // Recursively merge nested objects
      (result as Record<string, unknown>)[key] = {
        ...targetValue,
        ...sourceValue,
      };
    } else if (sourceValue !== undefined) {
      // Replace value
      (result as Record<string, unknown>)[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Create a complete ExtendedConfig by merging partial config with defaults.
 * @param partial - Partial configuration to merge
 * @returns Complete configuration with all defaults applied
 */
export function createConfig(partial?: PartialExtendedConfig): ExtendedConfig {
  if (!partial) {
    return { ...DEFAULT_CONFIG };
  }

  return deepMerge(DEFAULT_CONFIG, partial);
}

/**
 * Get the effective minimum width for a tile, considering tile-specific overrides
 * and global defaults.
 * @param config - The dashboard config
 * @param tileMinWidth - Optional tile-specific minimum width
 * @returns The effective minimum width
 */
export function getEffectiveMinWidth(config: ExtendedConfig, tileMinWidth?: number): number {
  if (tileMinWidth !== undefined) {
    return tileMinWidth;
  }
  if (config.tileDefaults.minWidth !== undefined) {
    return config.tileDefaults.minWidth;
  }
  return config.minTile.width;
}

/**
 * Get the effective minimum height for a tile, considering tile-specific overrides
 * and global defaults.
 * @param config - The dashboard config
 * @param tileMinHeight - Optional tile-specific minimum height
 * @returns The effective minimum height
 */
export function getEffectiveMinHeight(config: ExtendedConfig, tileMinHeight?: number): number {
  if (tileMinHeight !== undefined) {
    return tileMinHeight;
  }
  if (config.tileDefaults.minHeight !== undefined) {
    return config.tileDefaults.minHeight;
  }
  return config.minTile.height;
}

/**
 * Get the effective maximum width for a tile, considering tile-specific overrides
 * and global defaults.
 * @param config - The dashboard config
 * @param tileMaxWidth - Optional tile-specific maximum width
 * @returns The effective maximum width
 */
export function getEffectiveMaxWidth(config: ExtendedConfig, tileMaxWidth?: number): number {
  if (tileMaxWidth !== undefined) {
    return tileMaxWidth;
  }
  return config.tileDefaults.maxWidth ?? 100;
}

/**
 * Get the effective maximum height for a tile, considering tile-specific overrides
 * and global defaults.
 * @param config - The dashboard config
 * @param tileMaxHeight - Optional tile-specific maximum height
 * @returns The effective maximum height
 */
export function getEffectiveMaxHeight(config: ExtendedConfig, tileMaxHeight?: number): number {
  if (tileMaxHeight !== undefined) {
    return tileMaxHeight;
  }
  return config.tileDefaults.maxHeight ?? 100;
}
