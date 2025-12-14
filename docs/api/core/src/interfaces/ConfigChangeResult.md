[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / ConfigChangeResult

# Interface: ConfigChangeResult

Defined in: [packages/core/src/config/types.ts:126](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L126)

Result of a configuration change operation.

## Properties

### adjustedTiles?

> `optional` **adjustedTiles**: [`TileId`](../type-aliases/TileId.md)[]

Defined in: [packages/core/src/config/types.ts:132](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L132)

Tiles that were auto-adjusted to meet new constraints

***

### config

> **config**: [`ExtendedConfig`](ExtendedConfig.md)

Defined in: [packages/core/src/config/types.ts:130](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L130)

The new configuration after the change

***

### error?

> `optional` **error**: `string`

Defined in: [packages/core/src/config/types.ts:134](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L134)

Error message if the change failed

***

### success

> **success**: `boolean`

Defined in: [packages/core/src/config/types.ts:128](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L128)

Whether the change was successful

***

### validationErrors?

> `optional` **validationErrors**: [`ValidationError`](ValidationError.md)[]

Defined in: [packages/core/src/config/types.ts:136](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L136)

Validation errors if any
