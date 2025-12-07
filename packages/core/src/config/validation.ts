import type {
  ExtendedConfig,
  ValidationResult,
  ValidationError,
  BorderConfig,
  AnimationConfig,
  SnapThresholdsConfig,
  TileDefaultsConfig,
  TileConstraints,
} from './types.js';
import { CURRENT_CONFIG_VERSION } from './types.js';

/**
 * Validate a complete ExtendedConfig object.
 * Uses strict validation - rejects invalid config entirely.
 *
 * @param config - The configuration to validate
 * @returns Validation result with errors if invalid
 */
export function validateConfig(config: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (config === null || config === undefined) {
    errors.push({
      path: '',
      message: 'Config cannot be null or undefined',
      value: config,
    });
    return { valid: false, errors };
  }

  if (typeof config !== 'object') {
    errors.push({
      path: '',
      message: 'Config must be an object',
      value: config,
    });
    return { valid: false, errors };
  }

  const cfg = config as Record<string, unknown>;

  // Version validation
  if (cfg.version !== undefined && cfg.version !== CURRENT_CONFIG_VERSION) {
    errors.push({
      path: 'version',
      message: `Invalid version. Expected ${CURRENT_CONFIG_VERSION}, got ${cfg.version}`,
      value: cfg.version,
    });
  }

  // minTile validation
  validateMinTile(cfg.minTile, errors);

  // maxTiles validation
  if (cfg.maxTiles !== undefined) {
    validateMaxTiles(cfg.maxTiles, errors);
  }

  // epsilon validation
  if (cfg.epsilon !== undefined) {
    validateEpsilon(cfg.epsilon, errors);
  }

  // gutter validation
  if (cfg.gutter !== undefined) {
    validateGutter(cfg.gutter, errors);
  }

  // border validation
  if (cfg.border !== undefined) {
    validateBorder(cfg.border, errors);
  }

  // animation validation
  if (cfg.animation !== undefined) {
    validateAnimation(cfg.animation, errors);
  }

  // snapThresholds validation
  if (cfg.snapThresholds !== undefined) {
    validateSnapThresholds(cfg.snapThresholds, errors);
  }

  // interactionMode validation
  if (cfg.interactionMode !== undefined) {
    validateInteractionMode(cfg.interactionMode, errors);
  }

  // tileDefaults validation
  if (cfg.tileDefaults !== undefined) {
    validateTileDefaults(cfg.tileDefaults, errors);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a partial config for updates.
 * Less strict than full validation - only validates fields that are present.
 *
 * @param partial - The partial configuration to validate
 * @returns Validation result with errors if invalid
 */
export function validatePartialConfig(partial: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (partial === null || partial === undefined) {
    // Null/undefined partial is OK - means no changes
    return { valid: true, errors: [] };
  }

  if (typeof partial !== 'object') {
    errors.push({
      path: '',
      message: 'Partial config must be an object',
      value: partial,
    });
    return { valid: false, errors };
  }

  const cfg = partial as Partial<ExtendedConfig>;

  // Only validate fields that are present
  if (cfg.minTile !== undefined) {
    validateMinTile(cfg.minTile, errors);
  }

  if (cfg.maxTiles !== undefined) {
    validateMaxTiles(cfg.maxTiles, errors);
  }

  if (cfg.epsilon !== undefined) {
    validateEpsilon(cfg.epsilon, errors);
  }

  if (cfg.gutter !== undefined) {
    validateGutter(cfg.gutter, errors);
  }

  if (cfg.border !== undefined) {
    validateBorder(cfg.border, errors);
  }

  if (cfg.animation !== undefined) {
    validateAnimation(cfg.animation, errors);
  }

  if (cfg.snapThresholds !== undefined) {
    validateSnapThresholds(cfg.snapThresholds, errors);
  }

  if (cfg.interactionMode !== undefined) {
    validateInteractionMode(cfg.interactionMode, errors);
  }

  if (cfg.tileDefaults !== undefined) {
    validateTileDefaults(cfg.tileDefaults, errors);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate tile constraints.
 *
 * @param constraints - The constraints to validate
 * @param path - Base path for error messages
 * @returns Validation errors if any
 */
export function validateTileConstraints(
  constraints: unknown,
  path = 'constraints',
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (constraints === null || constraints === undefined) {
    return errors;
  }

  if (typeof constraints !== 'object') {
    errors.push({
      path,
      message: 'Constraints must be an object',
      value: constraints,
    });
    return errors;
  }

  const c = constraints as TileConstraints;

  if (c.minWidth !== undefined) {
    if (typeof c.minWidth !== 'number' || c.minWidth < 0 || c.minWidth > 100) {
      errors.push({
        path: `${path}.minWidth`,
        message: 'minWidth must be a number between 0 and 100',
        value: c.minWidth,
      });
    }
  }

  if (c.minHeight !== undefined) {
    if (typeof c.minHeight !== 'number' || c.minHeight < 0 || c.minHeight > 100) {
      errors.push({
        path: `${path}.minHeight`,
        message: 'minHeight must be a number between 0 and 100',
        value: c.minHeight,
      });
    }
  }

  if (c.maxWidth !== undefined) {
    if (typeof c.maxWidth !== 'number' || c.maxWidth < 0 || c.maxWidth > 100) {
      errors.push({
        path: `${path}.maxWidth`,
        message: 'maxWidth must be a number between 0 and 100',
        value: c.maxWidth,
      });
    }
  }

  if (c.maxHeight !== undefined) {
    if (typeof c.maxHeight !== 'number' || c.maxHeight < 0 || c.maxHeight > 100) {
      errors.push({
        path: `${path}.maxHeight`,
        message: 'maxHeight must be a number between 0 and 100',
        value: c.maxHeight,
      });
    }
  }

  // Check min <= max relationships
  if (c.minWidth !== undefined && c.maxWidth !== undefined && c.minWidth > c.maxWidth) {
    errors.push({
      path: `${path}.minWidth`,
      message: 'minWidth cannot be greater than maxWidth',
      value: c.minWidth,
    });
  }

  if (c.minHeight !== undefined && c.maxHeight !== undefined && c.minHeight > c.maxHeight) {
    errors.push({
      path: `${path}.minHeight`,
      message: 'minHeight cannot be greater than maxHeight',
      value: c.minHeight,
    });
  }

  if (c.aspectRatio !== undefined && c.aspectRatio !== null) {
    if (typeof c.aspectRatio !== 'number' || c.aspectRatio <= 0) {
      errors.push({
        path: `${path}.aspectRatio`,
        message: 'aspectRatio must be a positive number or null',
        value: c.aspectRatio,
      });
    }
  }

  if (c.lockedZones !== undefined) {
    if (!Array.isArray(c.lockedZones)) {
      errors.push({
        path: `${path}.lockedZones`,
        message: 'lockedZones must be an array',
        value: c.lockedZones,
      });
    } else {
      const validZones = ['top', 'bottom', 'left', 'right'];
      for (const zone of c.lockedZones) {
        if (!validZones.includes(zone)) {
          errors.push({
            path: `${path}.lockedZones`,
            message: `Invalid locked zone: ${zone}. Must be one of: ${validZones.join(', ')}`,
            value: zone,
          });
        }
      }
    }
  }

  return errors;
}

// === Private validation helpers ===

function validateMinTile(value: unknown, errors: ValidationError[]): void {
  if (value === undefined) {
    return; // Will use default
  }

  if (typeof value !== 'object' || value === null) {
    errors.push({
      path: 'minTile',
      message: 'minTile must be an object with width and height',
      value,
    });
    return;
  }

  const minTile = value as { width?: unknown; height?: unknown };

  if (typeof minTile.width !== 'number' || minTile.width <= 0 || minTile.width > 100) {
    errors.push({
      path: 'minTile.width',
      message: 'minTile.width must be a positive number <= 100',
      value: minTile.width,
    });
  }

  if (typeof minTile.height !== 'number' || minTile.height <= 0 || minTile.height > 100) {
    errors.push({
      path: 'minTile.height',
      message: 'minTile.height must be a positive number <= 100',
      value: minTile.height,
    });
  }
}

function validateMaxTiles(value: unknown, errors: ValidationError[]): void {
  if (value === undefined) {
    return;
  }

  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    errors.push({
      path: 'maxTiles',
      message: 'maxTiles must be a positive integer',
      value,
    });
  }
}

function validateEpsilon(value: unknown, errors: ValidationError[]): void {
  if (typeof value !== 'number' || value <= 0) {
    errors.push({
      path: 'epsilon',
      message: 'epsilon must be a positive number',
      value,
    });
  }
}

function validateGutter(value: unknown, errors: ValidationError[]): void {
  if (typeof value !== 'number' || value < 0) {
    errors.push({
      path: 'gutter',
      message: 'gutter must be a non-negative number',
      value,
    });
  }
}

function validateBorder(value: unknown, errors: ValidationError[]): void {
  if (typeof value !== 'object' || value === null) {
    errors.push({
      path: 'border',
      message: 'border must be an object',
      value,
    });
    return;
  }

  const border = value as BorderConfig;

  if (border.width !== undefined) {
    if (typeof border.width !== 'number' || border.width < 0) {
      errors.push({
        path: 'border.width',
        message: 'border.width must be a non-negative number',
        value: border.width,
      });
    }
  }

  if (border.style !== undefined) {
    const validStyles = ['solid', 'dashed', 'dotted', 'none'];
    if (!validStyles.includes(border.style)) {
      errors.push({
        path: 'border.style',
        message: `border.style must be one of: ${validStyles.join(', ')}`,
        value: border.style,
      });
    }
  }

  if (border.color !== undefined) {
    if (typeof border.color !== 'string' || border.color.length === 0) {
      errors.push({
        path: 'border.color',
        message: 'border.color must be a non-empty string',
        value: border.color,
      });
    }
  }
}

function validateAnimation(value: unknown, errors: ValidationError[]): void {
  if (typeof value !== 'object' || value === null) {
    errors.push({
      path: 'animation',
      message: 'animation must be an object',
      value,
    });
    return;
  }

  const animation = value as AnimationConfig;

  if (animation.duration !== undefined) {
    if (typeof animation.duration !== 'number' || animation.duration < 0) {
      errors.push({
        path: 'animation.duration',
        message: 'animation.duration must be a non-negative number',
        value: animation.duration,
      });
    }
  }

  if (animation.easing !== undefined) {
    if (typeof animation.easing !== 'string' || animation.easing.length === 0) {
      errors.push({
        path: 'animation.easing',
        message: 'animation.easing must be a non-empty string',
        value: animation.easing,
      });
    }
  }

  if (animation.enabled !== undefined) {
    if (typeof animation.enabled !== 'boolean') {
      errors.push({
        path: 'animation.enabled',
        message: 'animation.enabled must be a boolean',
        value: animation.enabled,
      });
    }
  }
}

function validateSnapThresholds(value: unknown, errors: ValidationError[]): void {
  if (typeof value !== 'object' || value === null) {
    errors.push({
      path: 'snapThresholds',
      message: 'snapThresholds must be an object',
      value,
    });
    return;
  }

  const snap = value as SnapThresholdsConfig;

  if (snap.resize !== undefined) {
    if (typeof snap.resize !== 'number' || snap.resize < 0 || snap.resize > 100) {
      errors.push({
        path: 'snapThresholds.resize',
        message: 'snapThresholds.resize must be a number between 0 and 100',
        value: snap.resize,
      });
    }
  }

  if (snap.grid !== undefined && snap.grid !== null) {
    if (typeof snap.grid !== 'number' || snap.grid <= 0 || snap.grid > 100) {
      errors.push({
        path: 'snapThresholds.grid',
        message: 'snapThresholds.grid must be a positive number <= 100',
        value: snap.grid,
      });
    }
  }
}

function validateInteractionMode(value: unknown, errors: ValidationError[]): void {
  const validModes = ['insert', 'resize', 'locked'];
  if (!validModes.includes(value as string)) {
    errors.push({
      path: 'interactionMode',
      message: `interactionMode must be one of: ${validModes.join(', ')}`,
      value,
    });
  }
}

function validateTileDefaults(value: unknown, errors: ValidationError[]): void {
  if (typeof value !== 'object' || value === null) {
    errors.push({
      path: 'tileDefaults',
      message: 'tileDefaults must be an object',
      value,
    });
    return;
  }

  const defaults = value as TileDefaultsConfig;

  if (defaults.minWidth !== undefined) {
    if (typeof defaults.minWidth !== 'number' || defaults.minWidth < 0 || defaults.minWidth > 100) {
      errors.push({
        path: 'tileDefaults.minWidth',
        message: 'tileDefaults.minWidth must be a number between 0 and 100',
        value: defaults.minWidth,
      });
    }
  }

  if (defaults.minHeight !== undefined) {
    if (
      typeof defaults.minHeight !== 'number' ||
      defaults.minHeight < 0 ||
      defaults.minHeight > 100
    ) {
      errors.push({
        path: 'tileDefaults.minHeight',
        message: 'tileDefaults.minHeight must be a number between 0 and 100',
        value: defaults.minHeight,
      });
    }
  }

  if (defaults.maxWidth !== undefined) {
    if (typeof defaults.maxWidth !== 'number' || defaults.maxWidth < 0 || defaults.maxWidth > 100) {
      errors.push({
        path: 'tileDefaults.maxWidth',
        message: 'tileDefaults.maxWidth must be a number between 0 and 100',
        value: defaults.maxWidth,
      });
    }
  }

  if (defaults.maxHeight !== undefined) {
    if (
      typeof defaults.maxHeight !== 'number' ||
      defaults.maxHeight < 0 ||
      defaults.maxHeight > 100
    ) {
      errors.push({
        path: 'tileDefaults.maxHeight',
        message: 'tileDefaults.maxHeight must be a number between 0 and 100',
        value: defaults.maxHeight,
      });
    }
  }

  // Check min <= max relationships
  if (
    defaults.minWidth !== undefined &&
    defaults.maxWidth !== undefined &&
    defaults.minWidth > defaults.maxWidth
  ) {
    errors.push({
      path: 'tileDefaults.minWidth',
      message: 'tileDefaults.minWidth cannot be greater than tileDefaults.maxWidth',
      value: defaults.minWidth,
    });
  }

  if (
    defaults.minHeight !== undefined &&
    defaults.maxHeight !== undefined &&
    defaults.minHeight > defaults.maxHeight
  ) {
    errors.push({
      path: 'tileDefaults.minHeight',
      message: 'tileDefaults.minHeight cannot be greater than tileDefaults.maxHeight',
      value: defaults.minHeight,
    });
  }

  if (defaults.aspectRatio !== undefined && defaults.aspectRatio !== null) {
    if (typeof defaults.aspectRatio !== 'number' || defaults.aspectRatio <= 0) {
      errors.push({
        path: 'tileDefaults.aspectRatio',
        message: 'tileDefaults.aspectRatio must be a positive number or null',
        value: defaults.aspectRatio,
      });
    }
  }
}
