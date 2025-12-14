[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / getEffectiveMaxWidth

# Function: getEffectiveMaxWidth()

> **getEffectiveMaxWidth**(`config`, `tileMaxWidth?`): `number`

Defined in: [packages/core/src/config/defaults.ts:152](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/defaults.ts#L152)

Get the effective maximum width for a tile, considering tile-specific overrides
and global defaults.

## Parameters

### config

[`ExtendedConfig`](../interfaces/ExtendedConfig.md)

The dashboard config

### tileMaxWidth?

`number`

Optional tile-specific maximum width

## Returns

`number`

The effective maximum width
