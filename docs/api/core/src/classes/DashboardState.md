[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / DashboardState

# Class: DashboardState

Defined in: [packages/core/src/entities/DashboardState.ts:36](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/DashboardState.ts#L36)

Immutable snapshot of the dashboard layout.

DashboardState represents a valid, complete tiling of the dashboard container.
It enforces invariants: no overlaps, no gaps, all tiles within bounds.

## Example

```typescript
const state = new DashboardState({
  tiles: [
    new Tile({ id: 'left', x: 0, y: 0, width: 50, height: 100 }),
    new Tile({ id: 'right', x: 50, y: 0, width: 50, height: 100 })
  ]
});

console.log(state.toArray().length); // 2
console.log(state.seams.size); // Number of seams
```

## Constructors

### Constructor

> **new DashboardState**(`init`, `adjacencyVersion`): `DashboardState`

Defined in: [packages/core/src/entities/DashboardState.ts:54](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/DashboardState.ts#L54)

Creates a new DashboardState.

#### Parameters

##### init

`DashboardStateInit`

Initialization options

##### adjacencyVersion

`number` = `0`

Version number (default: 0)

#### Returns

`DashboardState`

#### Throws

Error if tiles overlap

#### Throws

Error if tiles are out of bounds

#### Throws

Error if total tile area doesn't equal container area

## Properties

### adjacencyVersion

> `readonly` **adjacencyVersion**: `number`

Defined in: [packages/core/src/entities/DashboardState.ts:42](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/DashboardState.ts#L42)

Version number incremented on each adjacency-changing operation

***

### groups?

> `readonly` `optional` **groups**: `Map`\<`string`, `Set`\<[`TileId`](../type-aliases/TileId.md)\>\>

Defined in: [packages/core/src/entities/DashboardState.ts:40](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/DashboardState.ts#L40)

Optional tile groups for coordinated behavior

***

### seams

> `readonly` **seams**: `Map`\<`string`, [`Seam`](../interfaces/Seam.md)\>

Defined in: [packages/core/src/entities/DashboardState.ts:44](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/DashboardState.ts#L44)

Computed seams (shared edges) between tiles

***

### tiles

> `readonly` **tiles**: `Map`\<[`TileId`](../type-aliases/TileId.md), [`Tile`](Tile.md)\>

Defined in: [packages/core/src/entities/DashboardState.ts:38](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/DashboardState.ts#L38)

Map of tile ID to Tile instance

## Methods

### toArray()

> **toArray**(): [`Tile`](Tile.md)[]

Defined in: [packages/core/src/entities/DashboardState.ts:76](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/DashboardState.ts#L76)

Get all tiles as an array.

#### Returns

[`Tile`](Tile.md)[]

Array of all tiles in the state

***

### withTiles()

> **withTiles**(`tiles`): `DashboardState`

Defined in: [packages/core/src/entities/DashboardState.ts:68](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/DashboardState.ts#L68)

Create a new state with different tiles.

#### Parameters

##### tiles

`Iterable`\<[`Tile`](Tile.md)\>

The new tiles

#### Returns

`DashboardState`

A new DashboardState with incremented adjacency version
