[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / validateConfig

# Function: validateConfig()

> **validateConfig**(`config`): [`ValidationResult`](../interfaces/ValidationResult.md)

Defined in: [packages/core/src/config/validation.ts:20](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/validation.ts#L20)

Validate a complete ExtendedConfig object.
Uses strict validation - rejects invalid config entirely.

## Parameters

### config

`unknown`

The configuration to validate

## Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

Validation result with errors if invalid
