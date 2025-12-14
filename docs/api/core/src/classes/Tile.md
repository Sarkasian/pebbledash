[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / Tile

# Class: Tile

Defined in: [packages/core/src/entities/Tile.ts:72](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L72)

Represents a single tile in the dashboard layout.

Tiles are immutable - all modification methods return new Tile instances.
Coordinates and dimensions are expressed as percentages (0-100) of the container.

## Example

```typescript
const tile = new Tile({
  id: 'tile-1' as TileId,
  x: 0,
  y: 0,
  width: 50,
  height: 100
});

// Create a modified copy
const moved = tile.move(10, 0);
```

## Constructors

### Constructor

> **new Tile**(`init`): `Tile`

Defined in: [packages/core/src/entities/Tile.ts:89](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L89)

Creates a new Tile instance.

#### Parameters

##### init

`TileInit`

Initialization options for the tile

#### Returns

`Tile`

#### Throws

Error if coordinates are not finite numbers

#### Throws

Error if width/height is not positive

#### Throws

Error if tile is outside [0,100] bounds

## Properties

### constraints?

> `readonly` `optional` **constraints**: [`TileConstraints`](../interfaces/TileConstraints.md)

Defined in: [packages/core/src/entities/Tile.ts:80](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L80)

***

### height

> `readonly` **height**: `number`

Defined in: [packages/core/src/entities/Tile.ts:77](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L77)

***

### id

> `readonly` **id**: [`TileId`](../type-aliases/TileId.md)

Defined in: [packages/core/src/entities/Tile.ts:73](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L73)

***

### locked

> `readonly` **locked**: `boolean`

Defined in: [packages/core/src/entities/Tile.ts:78](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L78)

***

### meta?

> `readonly` `optional` **meta**: `Record`\<`string`, `unknown`\>

Defined in: [packages/core/src/entities/Tile.ts:79](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L79)

***

### width

> `readonly` **width**: `number`

Defined in: [packages/core/src/entities/Tile.ts:76](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L76)

***

### x

> `readonly` **x**: `number`

Defined in: [packages/core/src/entities/Tile.ts:74](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L74)

***

### y

> `readonly` **y**: `number`

Defined in: [packages/core/src/entities/Tile.ts:75](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L75)

## Accessors

### area

#### Get Signature

> **get** **area**(): `number`

Defined in: [packages/core/src/entities/Tile.ts:113](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L113)

Area of the tile (width * height)

##### Returns

`number`

***

### bottom

#### Get Signature

> **get** **bottom**(): `number`

Defined in: [packages/core/src/entities/Tile.ts:108](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L108)

Bottom edge position (y + height)

##### Returns

`number`

***

### right

#### Get Signature

> **get** **right**(): `number`

Defined in: [packages/core/src/entities/Tile.ts:103](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L103)

Right edge position (x + width)

##### Returns

`number`

## Methods

### isAdjacentTo()

> **isAdjacentTo**(`other`): `boolean`

Defined in: [packages/core/src/entities/Tile.ts:169](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L169)

Checks if this tile is adjacent to another tile (shares an edge).

#### Parameters

##### other

`Tile`

The other tile to check against

#### Returns

`boolean`

True if the tiles share an edge

***

### move()

> **move**(`dx`, `dy`): `Tile`

Defined in: [packages/core/src/entities/Tile.ts:141](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L141)

Creates a new Tile moved by the specified delta.

#### Parameters

##### dx

`number`

Change in x position

##### dy

`number`

Change in y position

#### Returns

`Tile`

A new Tile at the new position

***

### overlaps()

> **overlaps**(`other`): `boolean`

Defined in: [packages/core/src/entities/Tile.ts:160](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L160)

Checks if this tile overlaps with another tile.

#### Parameters

##### other

`Tile`

The other tile to check against

#### Returns

`boolean`

True if the tiles overlap

***

### resize()

> **resize**(`width`, `height`): `Tile`

Defined in: [packages/core/src/entities/Tile.ts:151](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L151)

Creates a new Tile with the specified dimensions.

#### Parameters

##### width

`number`

New width

##### height

`number`

New height

#### Returns

`Tile`

A new Tile with the new dimensions

***

### with()

> **with**(`patch`): `Tile`

Defined in: [packages/core/src/entities/Tile.ts:122](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/entities/Tile.ts#L122)

Creates a new Tile with the specified properties changed.

#### Parameters

##### patch

`Partial`\<`Omit`\<`TileInit`, `"id"`\>\>

Properties to change

#### Returns

`Tile`

A new Tile instance with the changes applied
