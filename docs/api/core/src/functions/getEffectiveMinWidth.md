[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / getEffectiveMinWidth

# Function: getEffectiveMinWidth()

> **getEffectiveMinWidth**(`config`, `tileMinWidth?`): `number`

Defined in: [packages/core/src/config/defaults.ts:118](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/defaults.ts#L118)

Get the effective minimum width for a tile, considering tile-specific overrides
and global defaults.

## Parameters

### config

[`ExtendedConfig`](../interfaces/ExtendedConfig.md)

The dashboard config

### tileMinWidth?

`number`

Optional tile-specific minimum width

## Returns

`number`

The effective minimum width
