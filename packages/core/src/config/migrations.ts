import type { ExtendedConfig } from './types.js';
import { CURRENT_CONFIG_VERSION } from './types.js';
import { createConfig } from './defaults.js';

/**
 * Type for migration functions.
 * Each migration function upgrades config from version N to version N+1.
 */
type MigrationFunction = (config: Record<string, unknown>) => Record<string, unknown>;

/**
 * Registry of migration functions.
 * Key is the source version, value is the function to upgrade to the next version.
 *
 * Example: migrations[1] upgrades from v1 to v2
 */
const migrations: Record<number, MigrationFunction> = {
  // No migrations needed yet - we're at version 1
  // When we need to add version 2, add:
  // 1: migrateV1toV2,
};

/**
 * Migrate a config object to the current version.
 * Applies all necessary migrations in sequence.
 *
 * @param config - The config to migrate (may be any version)
 * @returns The migrated config at the current version
 */
export function migrateConfig(config: unknown): unknown {
  if (config === null || config === undefined) {
    return createConfig();
  }

  if (typeof config !== 'object') {
    console.warn('migrateConfig: config is not an object, using defaults');
    return createConfig();
  }

  const cfg = { ...config } as Record<string, unknown>;

  // Determine the source version
  let version = getConfigVersion(cfg);

  // Apply migrations in sequence
  while (version < CURRENT_CONFIG_VERSION) {
    const migration = migrations[version];
    if (!migration) {
      console.warn(`migrateConfig: No migration found for version ${version}`);
      break;
    }

    try {
      const migrated = migration(cfg);
      Object.assign(cfg, migrated);
      version++;
      cfg.version = version;
    } catch (error) {
      console.error(`migrateConfig: Migration from v${version} failed`, error);
      break;
    }
  }

  // Ensure version is set
  cfg.version = CURRENT_CONFIG_VERSION;

  // Fill in any missing defaults
  return fillMissingDefaults(cfg);
}

/**
 * Get the version of a config object.
 * Handles legacy configs that may not have a version field.
 *
 * @param config - The config object
 * @returns The config version (defaults to 1 for legacy configs)
 */
function getConfigVersion(config: Record<string, unknown>): number {
  if (typeof config.version === 'number' && Number.isInteger(config.version)) {
    return config.version;
  }

  // Legacy config without version - assume version 1
  return 1;
}

/**
 * Fill in any missing fields with defaults.
 * This handles partial configs or configs with missing optional fields.
 *
 * @param config - The config to fill
 * @returns Config with all fields populated
 */
function fillMissingDefaults(config: Record<string, unknown>): ExtendedConfig {
  const defaults = createConfig();
  const result = { ...defaults };

  // Merge top-level fields
  for (const key of Object.keys(config)) {
    const value = config[key];
    if (value !== undefined) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Deep merge nested objects
        const defaultValue = (result as Record<string, unknown>)[key];
        if (typeof defaultValue === 'object' && defaultValue !== null) {
          (result as Record<string, unknown>)[key] = {
            ...defaultValue,
            ...value,
          };
        } else {
          (result as Record<string, unknown>)[key] = value;
        }
      } else {
        (result as Record<string, unknown>)[key] = value;
      }
    }
  }

  return result;
}

// === Future migration functions would go here ===

/**
 * Example migration function (not used yet).
 * Upgrades config from version 1 to version 2.
 *
 * @example
 * function migrateV1toV2(config: Record<string, unknown>): Record<string, unknown> {
 *   // Example: rename a field
 *   if ('oldFieldName' in config) {
 *     config.newFieldName = config.oldFieldName;
 *     delete config.oldFieldName;
 *   }
 *
 *   // Example: add a new required field
 *   if (!('newRequiredField' in config)) {
 *     config.newRequiredField = 'default value';
 *   }
 *
 *   // Example: restructure nested fields
 *   if (config.someOldStructure) {
 *     config.newStructure = transformOldStructure(config.someOldStructure);
 *     delete config.someOldStructure;
 *   }
 *
 *   return config;
 * }
 */

/**
 * Check if a config needs migration.
 *
 * @param config - The config to check
 * @returns true if the config version is older than current
 */
export function needsMigration(config: unknown): boolean {
  if (config === null || config === undefined || typeof config !== 'object') {
    return true;
  }

  const cfg = config as Record<string, unknown>;
  const version = getConfigVersion(cfg);

  return version < CURRENT_CONFIG_VERSION;
}

/**
 * Get the version of a raw config object (for external use).
 *
 * @param config - The config to check
 * @returns The version number, or 0 if invalid
 */
export function getVersion(config: unknown): number {
  if (config === null || config === undefined || typeof config !== 'object') {
    return 0;
  }

  return getConfigVersion(config as Record<string, unknown>);
}
