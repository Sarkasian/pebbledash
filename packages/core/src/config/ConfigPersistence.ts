import type {
  ExtendedConfig,
  ConfigPersistenceAdapter,
  CallbackConfigAdapterOptions,
  LocalStorageConfigAdapterOptions,
} from './types.js';
import { validateConfig } from './validation.js';
import { migrateConfig } from './migrations.js';

/**
 * In-memory only adapter - no persistence.
 * Useful for testing or when persistence is not needed.
 */
export class MemoryConfigAdapter implements ConfigPersistenceAdapter {
  private config: ExtendedConfig | null = null;

  async load(): Promise<ExtendedConfig | null> {
    return this.config;
  }

  async save(config: ExtendedConfig): Promise<void> {
    this.config = config;
  }

  async clear(): Promise<void> {
    this.config = null;
  }
}

/**
 * Browser localStorage adapter with namespaced keys.
 * Supports automatic migration of old config versions.
 */
export class LocalStorageConfigAdapter implements ConfigPersistenceAdapter {
  private readonly storageKey: string;

  constructor(options: LocalStorageConfigAdapterOptions) {
    const prefix = options.keyPrefix ?? 'ud-config';
    this.storageKey = `${prefix}-${options.dashboardId}`;
  }

  async load(): Promise<ExtendedConfig | null> {
    if (typeof localStorage === 'undefined') {
      console.warn('LocalStorageConfigAdapter: localStorage is not available');
      return null;
    }

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);

      // Attempt migration if needed
      const migrated = migrateConfig(parsed);

      // Validate after migration
      const validation = validateConfig(migrated);
      if (!validation.valid) {
        console.error(
          'LocalStorageConfigAdapter: Invalid config after migration',
          validation.errors,
        );
        return null;
      }

      return migrated as ExtendedConfig;
    } catch (error) {
      console.error('LocalStorageConfigAdapter: Failed to load config', error);
      return null;
    }
  }

  async save(config: ExtendedConfig): Promise<void> {
    if (typeof localStorage === 'undefined') {
      console.warn('LocalStorageConfigAdapter: localStorage is not available');
      return;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(config));
    } catch (error) {
      console.error('LocalStorageConfigAdapter: Failed to save config', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('LocalStorageConfigAdapter: Failed to clear config', error);
    }
  }

  /**
   * Get the storage key being used.
   */
  getStorageKey(): string {
    return this.storageKey;
  }
}

/**
 * Callback-based adapter for custom storage backends.
 * Wraps user-provided onLoad/onSave callbacks.
 *
 * Use this adapter when you need to:
 * - Load config from a file (JSON, YAML, frontmatter)
 * - Store config in a database
 * - Use a custom storage mechanism (IndexedDB, cloud storage, etc.)
 *
 * @example
 * ```typescript
 * // JSON file example (in Node.js or Electron)
 * const adapter = new CallbackConfigAdapter({
 *   onLoad: async () => {
 *     const content = await fs.readFile('config.json', 'utf-8');
 *     return JSON.parse(content);
 *   },
 *   onSave: async (config) => {
 *     await fs.writeFile('config.json', JSON.stringify(config, null, 2));
 *   }
 * });
 *
 * // YAML file example
 * const yamlAdapter = new CallbackConfigAdapter({
 *   onLoad: async () => {
 *     const content = await fs.readFile('config.yml', 'utf-8');
 *     return yaml.parse(content); // Using a YAML library
 *   },
 *   onSave: async (config) => {
 *     await fs.writeFile('config.yml', yaml.stringify(config));
 *   }
 * });
 *
 * // API example
 * const apiAdapter = new CallbackConfigAdapter({
 *   onLoad: async () => {
 *     const response = await fetch('/api/dashboard/config');
 *     return response.json();
 *   },
 *   onSave: async (config) => {
 *     await fetch('/api/dashboard/config', {
 *       method: 'PUT',
 *       body: JSON.stringify(config)
 *     });
 *   }
 * });
 * ```
 */
export class CallbackConfigAdapter implements ConfigPersistenceAdapter {
  private readonly onLoadCallback: () => Promise<ExtendedConfig | null>;
  private readonly onSaveCallback: (config: ExtendedConfig) => Promise<void>;
  private readonly onClearCallback?: () => Promise<void>;

  constructor(options: CallbackConfigAdapterOptions) {
    this.onLoadCallback = options.onLoad;
    this.onSaveCallback = options.onSave;
    this.onClearCallback = options.onClear;
  }

  async load(): Promise<ExtendedConfig | null> {
    try {
      const raw = await this.onLoadCallback();
      if (!raw) {
        return null;
      }

      // Attempt migration if needed
      const migrated = migrateConfig(raw);

      // Validate after migration
      const validation = validateConfig(migrated);
      if (!validation.valid) {
        console.error('CallbackConfigAdapter: Invalid config after migration', validation.errors);
        return null;
      }

      return migrated as ExtendedConfig;
    } catch (error) {
      console.error('CallbackConfigAdapter: Failed to load config', error);
      return null;
    }
  }

  async save(config: ExtendedConfig): Promise<void> {
    await this.onSaveCallback(config);
  }

  async clear(): Promise<void> {
    if (this.onClearCallback) {
      await this.onClearCallback();
    }
  }
}
