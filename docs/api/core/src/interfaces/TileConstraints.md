[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / TileConstraints

# Interface: TileConstraints

Defined in: [packages/core/src/entities/Tile.ts:15](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L15)

Per-tile constraint overrides for size and behavior.

## Properties

### aspectRatio?

> `optional` **aspectRatio**: `number`

Defined in: [packages/core/src/entities/Tile.ts:25](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L25)

Aspect ratio constraint (width/height), null for no constraint

***

### lockedZones?

> `optional` **lockedZones**: (`"top"` \| `"bottom"` \| `"left"` \| `"right"`)[]

Defined in: [packages/core/src/entities/Tile.ts:27](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L27)

Zones that cannot be resized (edges that are locked)

***

### maxHeight?

> `optional` **maxHeight**: `number`

Defined in: [packages/core/src/entities/Tile.ts:23](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L23)

Maximum tile height as percentage

***

### maxWidth?

> `optional` **maxWidth**: `number`

Defined in: [packages/core/src/entities/Tile.ts:21](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L21)

Maximum tile width as percentage

***

### minHeight?

> `optional` **minHeight**: `number`

Defined in: [packages/core/src/entities/Tile.ts:19](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L19)

Minimum tile height as percentage

***

### minWidth?

> `optional` **minWidth**: `number`

Defined in: [packages/core/src/entities/Tile.ts:17](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L17)

Minimum tile width as percentage
