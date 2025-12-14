[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / validatePartialConfig

# Function: validatePartialConfig()

> **validatePartialConfig**(`partial`): [`ValidationResult`](../interfaces/ValidationResult.md)

Defined in: [packages/core/src/config/validation.ts:105](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/validation.ts#L105)

Validate a partial config for updates.
Less strict than full validation - only validates fields that are present.

## Parameters

### partial

`unknown`

The partial configuration to validate

## Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

Validation result with errors if invalid
