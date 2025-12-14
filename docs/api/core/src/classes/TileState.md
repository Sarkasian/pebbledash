[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / TileState

# Class: TileState

Defined in: [packages/core/src/state/TileState.ts:12](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/state/TileState.ts#L12)

## Constructors

### Constructor

> **new TileState**(): `TileState`

#### Returns

`TileState`

## Methods

### addTile()

> **addTile**(`tile`): `void`

Defined in: [packages/core/src/state/TileState.ts:21](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/state/TileState.ts#L21)

#### Parameters

##### tile

[`Tile`](Tile.md)

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: [packages/core/src/state/TileState.ts:51](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/state/TileState.ts#L51)

#### Returns

`void`

***

### getAllTiles()

> **getAllTiles**(): [`Tile`](Tile.md)[]

Defined in: [packages/core/src/state/TileState.ts:43](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/state/TileState.ts#L43)

#### Returns

[`Tile`](Tile.md)[]

***

### getTile()

> **getTile**(`tileId`): [`Tile`](Tile.md)

Defined in: [packages/core/src/state/TileState.ts:39](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/state/TileState.ts#L39)

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

#### Returns

[`Tile`](Tile.md)

***

### has()

> **has**(`tileId`): `boolean`

Defined in: [packages/core/src/state/TileState.ts:47](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/state/TileState.ts#L47)

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

#### Returns

`boolean`

***

### on()

> **on**(`handler`): () => `void`

Defined in: [packages/core/src/state/TileState.ts:16](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/state/TileState.ts#L16)

#### Parameters

##### handler

`Handler`

#### Returns

> (): `void`

##### Returns

`void`

***

### removeTile()

> **removeTile**(`tileId`): [`Tile`](Tile.md)

Defined in: [packages/core/src/state/TileState.ts:33](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/state/TileState.ts#L33)

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

#### Returns

[`Tile`](Tile.md)

***

### updateTile()

> **updateTile**(`tileId`, `patch`): [`Tile`](Tile.md)

Defined in: [packages/core/src/state/TileState.ts:26](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/state/TileState.ts#L26)

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

##### patch

`Partial`\<`Omit`\<[`Tile`](Tile.md), `"id"`\>\>

#### Returns

[`Tile`](Tile.md)
