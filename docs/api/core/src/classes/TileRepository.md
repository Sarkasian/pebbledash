[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / TileRepository

# Class: TileRepository

Defined in: [packages/core/src/repository/TileRepository.ts:4](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/repository/TileRepository.ts#L4)

## Constructors

### Constructor

> **new TileRepository**(): `TileRepository`

#### Returns

`TileRepository`

## Accessors

### version

#### Get Signature

> **get** **version**(): `number`

Defined in: [packages/core/src/repository/TileRepository.ts:8](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/repository/TileRepository.ts#L8)

##### Returns

`number`

## Methods

### add()

> **add**(`tile`): `void`

Defined in: [packages/core/src/repository/TileRepository.ts:12](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/repository/TileRepository.ts#L12)

#### Parameters

##### tile

[`Tile`](Tile.md)

#### Returns

`void`

***

### all()

> **all**(): [`Tile`](Tile.md)[]

Defined in: [packages/core/src/repository/TileRepository.ts:53](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/repository/TileRepository.ts#L53)

#### Returns

[`Tile`](Tile.md)[]

***

### clear()

> **clear**(): `void`

Defined in: [packages/core/src/repository/TileRepository.ts:57](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/repository/TileRepository.ts#L57)

#### Returns

`void`

***

### get()

> **get**(`tileId`): [`Tile`](Tile.md)

Defined in: [packages/core/src/repository/TileRepository.ts:39](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/repository/TileRepository.ts#L39)

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

#### Returns

[`Tile`](Tile.md)

***

### has()

> **has**(`tileId`): `boolean`

Defined in: [packages/core/src/repository/TileRepository.ts:49](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/repository/TileRepository.ts#L49)

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

#### Returns

`boolean`

***

### remove()

> **remove**(`tileId`): [`Tile`](Tile.md)

Defined in: [packages/core/src/repository/TileRepository.ts:30](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/repository/TileRepository.ts#L30)

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

#### Returns

[`Tile`](Tile.md)

***

### require()

> **require**(`tileId`): [`Tile`](Tile.md)

Defined in: [packages/core/src/repository/TileRepository.ts:43](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/repository/TileRepository.ts#L43)

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

#### Returns

[`Tile`](Tile.md)

***

### update()

> **update**(`tileId`, `update`): [`Tile`](Tile.md)

Defined in: [packages/core/src/repository/TileRepository.ts:22](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/repository/TileRepository.ts#L22)

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

##### update

(`prev`) => [`Tile`](Tile.md)

#### Returns

[`Tile`](Tile.md)

***

### upsert()

> **upsert**(`tile`): `void`

Defined in: [packages/core/src/repository/TileRepository.ts:17](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/repository/TileRepository.ts#L17)

#### Parameters

##### tile

[`Tile`](Tile.md)

#### Returns

`void`
