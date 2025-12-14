[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / getEffectiveMinHeight

# Function: getEffectiveMinHeight()

> **getEffectiveMinHeight**(`config`, `tileMinHeight?`): `number`

Defined in: [packages/core/src/config/defaults.ts:135](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/defaults.ts#L135)

Get the effective minimum height for a tile, considering tile-specific overrides
and global defaults.

## Parameters

### config

[`ExtendedConfig`](../interfaces/ExtendedConfig.md)

The dashboard config

### tileMinHeight?

`number`

Optional tile-specific minimum height

## Returns

`number`

The effective minimum height
