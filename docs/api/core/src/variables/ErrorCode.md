[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / ErrorCode

# Variable: ErrorCode

> `const` **ErrorCode**: `object`

Defined in: [packages/core/src/errors.ts:8](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/errors.ts#L8)

Error codes for programmatic handling of dashboard errors.
Each code is a unique identifier that can be used for:
- Internationalization (i18n) of error messages
- Error tracking and analytics
- Conditional error handling in consuming applications

## Type Declaration

### CONFIG\_INVALID

> `readonly` **CONFIG\_INVALID**: `"CONFIG_INVALID"` = `'CONFIG_INVALID'`

### CONFIG\_VALIDATION\_FAILED

> `readonly` **CONFIG\_VALIDATION\_FAILED**: `"CONFIG_VALIDATION_FAILED"` = `'CONFIG_VALIDATION_FAILED'`

### CONFIG\_VERSION\_MISMATCH

> `readonly` **CONFIG\_VERSION\_MISMATCH**: `"CONFIG_VERSION_MISMATCH"` = `'CONFIG_VERSION_MISMATCH'`

### HISTORY\_EMPTY

> `readonly` **HISTORY\_EMPTY**: `"HISTORY_EMPTY"` = `'HISTORY_EMPTY'`

### HISTORY\_REDO\_UNAVAILABLE

> `readonly` **HISTORY\_REDO\_UNAVAILABLE**: `"HISTORY_REDO_UNAVAILABLE"` = `'HISTORY_REDO_UNAVAILABLE'`

### HISTORY\_UNDO\_UNAVAILABLE

> `readonly` **HISTORY\_UNDO\_UNAVAILABLE**: `"HISTORY_UNDO_UNAVAILABLE"` = `'HISTORY_UNDO_UNAVAILABLE'`

### OP\_CONSTRAINT\_VIOLATION

> `readonly` **OP\_CONSTRAINT\_VIOLATION**: `"OP_CONSTRAINT_VIOLATION"` = `'OP_CONSTRAINT_VIOLATION'`

### OP\_INVALID\_PARAMS

> `readonly` **OP\_INVALID\_PARAMS**: `"OP_INVALID_PARAMS"` = `'OP_INVALID_PARAMS'`

### OP\_MAX\_TILES\_REACHED

> `readonly` **OP\_MAX\_TILES\_REACHED**: `"OP_MAX_TILES_REACHED"` = `'OP_MAX_TILES_REACHED'`

### OP\_MIN\_TILE\_SIZE

> `readonly` **OP\_MIN\_TILE\_SIZE**: `"OP_MIN_TILE_SIZE"` = `'OP_MIN_TILE_SIZE'`

### OP\_REJECTED

> `readonly` **OP\_REJECTED**: `"OP_REJECTED"` = `'OP_REJECTED'`

### PERSIST\_LOAD\_FAILED

> `readonly` **PERSIST\_LOAD\_FAILED**: `"PERSIST_LOAD_FAILED"` = `'PERSIST_LOAD_FAILED'`

### PERSIST\_MIGRATION\_FAILED

> `readonly` **PERSIST\_MIGRATION\_FAILED**: `"PERSIST_MIGRATION_FAILED"` = `'PERSIST_MIGRATION_FAILED'`

### PERSIST\_SAVE\_FAILED

> `readonly` **PERSIST\_SAVE\_FAILED**: `"PERSIST_SAVE_FAILED"` = `'PERSIST_SAVE_FAILED'`

### STATE\_COVERAGE\_GAP

> `readonly` **STATE\_COVERAGE\_GAP**: `"STATE_COVERAGE_GAP"` = `'STATE_COVERAGE_GAP'`

### STATE\_EMPTY

> `readonly` **STATE\_EMPTY**: `"STATE_EMPTY"` = `'STATE_EMPTY'`

### STATE\_INVALID

> `readonly` **STATE\_INVALID**: `"STATE_INVALID"` = `'STATE_INVALID'`

### STRATEGY\_INVALID

> `readonly` **STRATEGY\_INVALID**: `"STRATEGY_INVALID"` = `'STRATEGY_INVALID'`

### STRATEGY\_NOT\_FOUND

> `readonly` **STRATEGY\_NOT\_FOUND**: `"STRATEGY_NOT_FOUND"` = `'STRATEGY_NOT_FOUND'`

### TILE\_INVALID\_DIMENSIONS

> `readonly` **TILE\_INVALID\_DIMENSIONS**: `"TILE_INVALID_DIMENSIONS"` = `'TILE_INVALID_DIMENSIONS'`

### TILE\_LOCKED

> `readonly` **TILE\_LOCKED**: `"TILE_LOCKED"` = `'TILE_LOCKED'`

### TILE\_NOT\_FOUND

> `readonly` **TILE\_NOT\_FOUND**: `"TILE_NOT_FOUND"` = `'TILE_NOT_FOUND'`

### TILE\_OUT\_OF\_BOUNDS

> `readonly` **TILE\_OUT\_OF\_BOUNDS**: `"TILE_OUT_OF_BOUNDS"` = `'TILE_OUT_OF_BOUNDS'`

### TILE\_OVERLAP

> `readonly` **TILE\_OVERLAP**: `"TILE_OVERLAP"` = `'TILE_OVERLAP'`
