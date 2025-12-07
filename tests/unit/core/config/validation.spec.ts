import { describe, it, expect } from 'vitest';
import {
  validateConfig,
  validatePartialConfig,
  createConfig,
} from '../../../../packages/core/src/index';
import { validateTileConstraints } from '../../../../packages/core/src/config/validation';

describe('validateConfig', () => {
  describe('valid configs', () => {
    it('accepts a complete valid config', () => {
      const config = createConfig();
      const result = validateConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts config with custom values', () => {
      const config = createConfig({
        minTile: { width: 10, height: 15 },
        gutter: 4,
        border: { width: 2, style: 'dashed', color: '#333' },
      });
      const result = validateConfig(config);

      expect(result.valid).toBe(true);
    });
  });

  describe('invalid configs', () => {
    it('rejects null config', () => {
      const result = validateConfig(null);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejects non-object config', () => {
      const result = validateConfig('not an object');

      expect(result.valid).toBe(false);
    });

    it('rejects invalid minTile.width', () => {
      const config = { ...createConfig(), minTile: { width: -5, height: 10 } };
      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'minTile.width')).toBe(true);
    });

    it('rejects minTile.width > 100', () => {
      const config = { ...createConfig(), minTile: { width: 150, height: 10 } };
      const result = validateConfig(config);

      expect(result.valid).toBe(false);
    });

    it('rejects negative gutter', () => {
      const config = { ...createConfig(), gutter: -5 };
      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'gutter')).toBe(true);
    });

    it('rejects invalid border style', () => {
      const config = {
        ...createConfig(),
        border: { width: 1, style: 'invalid' as any, color: '#000' },
      };
      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.path === 'border.style')).toBe(true);
    });

    it('rejects negative animation duration', () => {
      const config = {
        ...createConfig(),
        animation: { duration: -100, easing: 'ease', enabled: true },
      };
      const result = validateConfig(config);

      expect(result.valid).toBe(false);
    });

    it('rejects invalid interaction mode', () => {
      const config = { ...createConfig(), interactionMode: 'invalid' as any };
      const result = validateConfig(config);

      expect(result.valid).toBe(false);
    });

    it('rejects non-integer maxTiles', () => {
      const config = { ...createConfig(), maxTiles: 5.5 };
      const result = validateConfig(config);

      expect(result.valid).toBe(false);
    });
  });
});

describe('validatePartialConfig', () => {
  it('accepts valid partial config', () => {
    const result = validatePartialConfig({ gutter: 4 });

    expect(result.valid).toBe(true);
  });

  it('accepts empty partial config', () => {
    const result = validatePartialConfig({});

    expect(result.valid).toBe(true);
  });

  it('accepts null/undefined partial config', () => {
    expect(validatePartialConfig(null).valid).toBe(true);
    expect(validatePartialConfig(undefined).valid).toBe(true);
  });

  it('rejects invalid partial values', () => {
    const result = validatePartialConfig({ gutter: -10 });

    expect(result.valid).toBe(false);
  });
});

describe('validateTileConstraints', () => {
  it('accepts valid constraints', () => {
    const errors = validateTileConstraints({
      minWidth: 10,
      minHeight: 10,
      maxWidth: 50,
      maxHeight: 50,
    });

    expect(errors).toHaveLength(0);
  });

  it('accepts empty constraints', () => {
    const errors = validateTileConstraints({});
    expect(errors).toHaveLength(0);
  });

  it('accepts null/undefined constraints', () => {
    expect(validateTileConstraints(null)).toHaveLength(0);
    expect(validateTileConstraints(undefined)).toHaveLength(0);
  });

  it('rejects minWidth > maxWidth', () => {
    const errors = validateTileConstraints({
      minWidth: 50,
      maxWidth: 30,
    });

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.path.includes('minWidth'))).toBe(true);
  });

  it('rejects minHeight > maxHeight', () => {
    const errors = validateTileConstraints({
      minHeight: 50,
      maxHeight: 30,
    });

    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects values out of range [0, 100]', () => {
    const errors = validateTileConstraints({
      minWidth: -5,
      maxWidth: 150,
    });

    expect(errors.length).toBe(2);
  });

  it('rejects invalid aspect ratio', () => {
    const errors = validateTileConstraints({
      aspectRatio: -1,
    });

    expect(errors.length).toBeGreaterThan(0);
  });

  it('accepts null aspect ratio', () => {
    const errors = validateTileConstraints({
      aspectRatio: null,
    });

    expect(errors).toHaveLength(0);
  });

  it('rejects invalid locked zones', () => {
    const errors = validateTileConstraints({
      lockedZones: ['top', 'invalid' as any],
    });

    expect(errors.length).toBeGreaterThan(0);
  });
});
