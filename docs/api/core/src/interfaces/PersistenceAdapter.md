[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / PersistenceAdapter

# Interface: PersistenceAdapter

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:58](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L58)

## Methods

### list()

> **list**(`prefix?`): `Promise`\<`string`[]\>

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:61](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L61)

#### Parameters

##### prefix?

`string`

#### Returns

`Promise`\<`string`[]\>

***

### load()

> **load**(`key`): `Promise`\<[`Snapshot`](../type-aliases/Snapshot.md)\>

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:60](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L60)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<[`Snapshot`](../type-aliases/Snapshot.md)\>

***

### save()

> **save**(`key`, `snapshot`): `Promise`\<`void`\>

Defined in: [packages/core/src/persistence/PersistenceAdapter.ts:59](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/persistence/PersistenceAdapter.ts#L59)

#### Parameters

##### key

`string`

##### snapshot

[`Snapshot`](../type-aliases/Snapshot.md)

#### Returns

`Promise`\<`void`\>
