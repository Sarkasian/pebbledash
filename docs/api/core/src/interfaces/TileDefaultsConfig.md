[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / TileDefaultsConfig

# Interface: TileDefaultsConfig

Defined in: [packages/core/src/config/types.ts:46](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L46)

Default constraints applied to all tiles unless overridden.

## Properties

### aspectRatio?

> `optional` **aspectRatio**: `number`

Defined in: [packages/core/src/config/types.ts:56](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L56)

Aspect ratio constraint (width/height), null for no constraint (default: null)

***

### maxHeight?

> `optional` **maxHeight**: `number`

Defined in: [packages/core/src/config/types.ts:54](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L54)

Maximum tile height as percentage (default: 100)

***

### maxWidth?

> `optional` **maxWidth**: `number`

Defined in: [packages/core/src/config/types.ts:52](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L52)

Maximum tile width as percentage (default: 100)

***

### minHeight?

> `optional` **minHeight**: `number`

Defined in: [packages/core/src/config/types.ts:50](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L50)

Minimum tile height as percentage (default: inherited from minTile.height)

***

### minWidth?

> `optional` **minWidth**: `number`

Defined in: [packages/core/src/config/types.ts:48](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L48)

Minimum tile width as percentage (default: inherited from minTile.width)
