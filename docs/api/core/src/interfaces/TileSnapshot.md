[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / TileSnapshot

# Interface: TileSnapshot

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:5](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L5)

Tile data with optional per-tile constraints

## Properties

### constraints?

> `optional` **constraints**: `TileConstraints`

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:14](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L14)

Per-tile constraints (V2+)

***

### height

> **height**: `number`

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:10](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L10)

***

### id

> **id**: [`TileId`](../type-aliases/TileId.md)

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:6](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L6)

***

### locked?

> `optional` **locked**: `boolean`

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:11](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L11)

***

### meta?

> `optional` **meta**: `Record`\<`string`, `unknown`\>

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:12](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L12)

***

### width

> **width**: `number`

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:9](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L9)

***

### x

> **x**: `number`

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:7](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L7)

***

### y

> **y**: `number`

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:8](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L8)
