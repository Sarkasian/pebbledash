[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / SnapshotV2

# Interface: SnapshotV2

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:23](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L23)

V2 snapshot with optional settings and per-tile constraints

## Properties

### settings?

> `optional` **settings**: [`PartialExtendedConfig`](../type-aliases/PartialExtendedConfig.md)

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:27](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L27)

Optional dashboard-level settings

***

### tiles

> **tiles**: [`TileSnapshot`](TileSnapshot.md)[]

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:25](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L25)

***

### version

> **version**: `2`

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:24](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L24)
