/**
 * Error codes for programmatic handling of dashboard errors.
 * Each code is a unique identifier that can be used for:
 * - Internationalization (i18n) of error messages
 * - Error tracking and analytics
 * - Conditional error handling in consuming applications
 */
export const ErrorCode = {
  // Tile validation errors (TILE_xxx)
  TILE_INVALID_DIMENSIONS: 'TILE_INVALID_DIMENSIONS',
  TILE_OUT_OF_BOUNDS: 'TILE_OUT_OF_BOUNDS',
  TILE_OVERLAP: 'TILE_OVERLAP',
  TILE_NOT_FOUND: 'TILE_NOT_FOUND',
  TILE_LOCKED: 'TILE_LOCKED',

  // State errors (STATE_xxx)
  STATE_INVALID: 'STATE_INVALID',
  STATE_COVERAGE_GAP: 'STATE_COVERAGE_GAP',
  STATE_EMPTY: 'STATE_EMPTY',

  // Operation errors (OP_xxx)
  OP_INVALID_PARAMS: 'OP_INVALID_PARAMS',
  OP_REJECTED: 'OP_REJECTED',
  OP_CONSTRAINT_VIOLATION: 'OP_CONSTRAINT_VIOLATION',
  OP_MAX_TILES_REACHED: 'OP_MAX_TILES_REACHED',
  OP_MIN_TILE_SIZE: 'OP_MIN_TILE_SIZE',

  // Strategy errors (STRATEGY_xxx)
  STRATEGY_NOT_FOUND: 'STRATEGY_NOT_FOUND',
  STRATEGY_INVALID: 'STRATEGY_INVALID',

  // Config errors (CONFIG_xxx)
  CONFIG_INVALID: 'CONFIG_INVALID',
  CONFIG_VERSION_MISMATCH: 'CONFIG_VERSION_MISMATCH',
  CONFIG_VALIDATION_FAILED: 'CONFIG_VALIDATION_FAILED',

  // Persistence errors (PERSIST_xxx)
  PERSIST_LOAD_FAILED: 'PERSIST_LOAD_FAILED',
  PERSIST_SAVE_FAILED: 'PERSIST_SAVE_FAILED',
  PERSIST_MIGRATION_FAILED: 'PERSIST_MIGRATION_FAILED',

  // History errors (HISTORY_xxx)
  HISTORY_EMPTY: 'HISTORY_EMPTY',
  HISTORY_UNDO_UNAVAILABLE: 'HISTORY_UNDO_UNAVAILABLE',
  HISTORY_REDO_UNAVAILABLE: 'HISTORY_REDO_UNAVAILABLE',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Base class for dashboard errors with structured error codes.
 */
export class DashboardError extends Error {
  /** Error code for programmatic handling */
  readonly code: ErrorCodeType;

  /** Additional context about the error */
  readonly context?: Record<string, unknown>;

  constructor(code: ErrorCodeType, message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'DashboardError';
    this.code = code;
    this.context = context;

    // Maintain proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DashboardError);
    }
  }

  /** Convert error to JSON for logging/serialization */
  toJSON(): { code: ErrorCodeType; message: string; context?: Record<string, unknown> } {
    return {
      code: this.code,
      message: this.message,
      ...(this.context ? { context: this.context } : {}),
    };
  }
}

/**
 * Error thrown when tile validation fails.
 */
export class TileValidationError extends DashboardError {
  constructor(code: ErrorCodeType, message: string, context?: Record<string, unknown>) {
    super(code, message, context);
    this.name = 'TileValidationError';
  }
}

/**
 * Error thrown when a state validation fails.
 */
export class StateValidationError extends DashboardError {
  constructor(code: ErrorCodeType, message: string, context?: Record<string, unknown>) {
    super(code, message, context);
    this.name = 'StateValidationError';
  }
}

/**
 * Error thrown when an operation fails.
 */
export class OperationError extends DashboardError {
  constructor(code: ErrorCodeType, message: string, context?: Record<string, unknown>) {
    super(code, message, context);
    this.name = 'OperationError';
  }
}

/**
 * Error thrown when a configuration is invalid.
 */
export class ConfigError extends DashboardError {
  constructor(code: ErrorCodeType, message: string, context?: Record<string, unknown>) {
    super(code, message, context);
    this.name = 'ConfigError';
  }
}

/**
 * Error thrown when persistence operations fail.
 */
export class PersistenceError extends DashboardError {
  constructor(code: ErrorCodeType, message: string, context?: Record<string, unknown>) {
    super(code, message, context);
    this.name = 'PersistenceError';
  }
}

/**
 * Type guard to check if an error is a DashboardError.
 */
export function isDashboardError(error: unknown): error is DashboardError {
  return error instanceof DashboardError;
}

/**
 * Type guard to check if an error has a specific error code.
 */
export function hasErrorCode(error: unknown, code: ErrorCodeType): boolean {
  return isDashboardError(error) && error.code === code;
}
