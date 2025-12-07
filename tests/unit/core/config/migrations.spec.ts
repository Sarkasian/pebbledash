import { describe, it, expect } from 'vitest';
import {
  migrateConfig,
  CURRENT_CONFIG_VERSION,
  DEFAULT_CONFIG,
} from '../../../../packages/core/src/index';
import { needsMigration, getVersion } from '../../../../packages/core/src/config/migrations';

describe('migrateConfig', () => {
  it('returns default config for null input', () => {
    const result = migrateConfig(null);

    expect(result).toBeDefined();
    expect((result as any).version).toBe(CURRENT_CONFIG_VERSION);
    expect((result as any).minTile).toEqual(DEFAULT_CONFIG.minTile);
  });

  it('returns default config for undefined input', () => {
    const result = migrateConfig(undefined);

    expect(result).toBeDefined();
    expect((result as any).version).toBe(CURRENT_CONFIG_VERSION);
  });

  it('returns default config for non-object input', () => {
    const result = migrateConfig('not an object');

    expect(result).toBeDefined();
    expect((result as any).version).toBe(CURRENT_CONFIG_VERSION);
  });

  it('fills missing fields with defaults', () => {
    const partial = {
      minTile: { width: 10, height: 10 },
    };

    const result = migrateConfig(partial);

    expect((result as any).version).toBe(CURRENT_CONFIG_VERSION);
    expect((result as any).minTile).toEqual({ width: 10, height: 10 });
    expect((result as any).gutter).toBe(DEFAULT_CONFIG.gutter);
    expect((result as any).border).toEqual(DEFAULT_CONFIG.border);
  });

  it('preserves existing valid values', () => {
    const config = {
      version: 1,
      minTile: { width: 15, height: 20 },
      gutter: 8,
      border: { width: 2, style: 'dashed', color: '#333' },
    };

    const result = migrateConfig(config);

    expect((result as any).minTile).toEqual({ width: 15, height: 20 });
    expect((result as any).gutter).toBe(8);
    expect((result as any).border.style).toBe('dashed');
  });

  it('handles legacy config without version field', () => {
    const legacyConfig = {
      minTile: { width: 5, height: 5 },
    };

    const result = migrateConfig(legacyConfig);

    expect((result as any).version).toBe(CURRENT_CONFIG_VERSION);
  });

  it('deep merges nested objects', () => {
    const partial = {
      border: { width: 3 }, // Only width specified
    };

    const result = migrateConfig(partial);

    expect((result as any).border.width).toBe(3);
    // Should have defaults for other border properties
    expect((result as any).border.style).toBe(DEFAULT_CONFIG.border.style);
    expect((result as any).border.color).toBe(DEFAULT_CONFIG.border.color);
  });
});

describe('needsMigration', () => {
  it('returns true for null input', () => {
    expect(needsMigration(null)).toBe(true);
  });

  it('returns true for undefined input', () => {
    expect(needsMigration(undefined)).toBe(true);
  });

  it('returns true for non-object input', () => {
    expect(needsMigration('string')).toBe(true);
  });

  it('returns false for current version', () => {
    const config = { version: CURRENT_CONFIG_VERSION };
    expect(needsMigration(config)).toBe(false);
  });

  it('returns true for older version', () => {
    // Assuming version 0 is older than current
    const config = { version: 0 };
    expect(needsMigration(config)).toBe(true);
  });

  it('returns false for config without version (assumes v1)', () => {
    const config = { minTile: { width: 5, height: 5 } };
    // Legacy configs without version are assumed to be v1
    expect(needsMigration(config)).toBe(false);
  });
});

describe('getVersion', () => {
  it('returns 0 for null input', () => {
    expect(getVersion(null)).toBe(0);
  });

  it('returns 0 for non-object input', () => {
    expect(getVersion('string')).toBe(0);
  });

  it('returns version field value', () => {
    expect(getVersion({ version: 1 })).toBe(1);
    expect(getVersion({ version: 2 })).toBe(2);
  });

  it('returns 1 for config without version (legacy)', () => {
    expect(getVersion({ minTile: {} })).toBe(1);
  });
});
