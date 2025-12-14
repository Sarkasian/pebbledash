[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / TileGroup

# Class: TileGroup

Defined in: [packages/core/src/entities/TileGroup.ts:3](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/TileGroup.ts#L3)

## Constructors

### Constructor

> **new TileGroup**(`id`, `tiles`): `TileGroup`

Defined in: [packages/core/src/entities/TileGroup.ts:7](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/TileGroup.ts#L7)

#### Parameters

##### id

`string`

##### tiles

`Iterable`\<[`TileId`](../type-aliases/TileId.md)\> = `[]`

#### Returns

`TileGroup`

## Properties

### id

> `readonly` **id**: `string`

Defined in: [packages/core/src/entities/TileGroup.ts:4](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/TileGroup.ts#L4)

***

### tiles

> `readonly` **tiles**: `ReadonlySet`\<[`TileId`](../type-aliases/TileId.md)\>

Defined in: [packages/core/src/entities/TileGroup.ts:5](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/TileGroup.ts#L5)

## Methods

### add()

> **add**(`tileId`): `TileGroup`

Defined in: [packages/core/src/entities/TileGroup.ts:13](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/TileGroup.ts#L13)

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

#### Returns

`TileGroup`

***

### remove()

> **remove**(`tileId`): `TileGroup`

Defined in: [packages/core/src/entities/TileGroup.ts:19](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/TileGroup.ts#L19)

#### Parameters

##### tileId

[`TileId`](../type-aliases/TileId.md)

#### Returns

`TileGroup`
