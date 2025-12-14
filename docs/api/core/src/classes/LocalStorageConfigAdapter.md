[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / LocalStorageConfigAdapter

# Class: LocalStorageConfigAdapter

Defined in: [packages/core/src/config/ConfigPersistence.ts:34](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigPersistence.ts#L34)

Browser localStorage adapter with namespaced keys.
Supports automatic migration of old config versions.

## Implements

- [`ConfigPersistenceAdapter`](../interfaces/ConfigPersistenceAdapter.md)

## Constructors

### Constructor

> **new LocalStorageConfigAdapter**(`options`): `LocalStorageConfigAdapter`

Defined in: [packages/core/src/config/ConfigPersistence.ts:37](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigPersistence.ts#L37)

#### Parameters

##### options

`LocalStorageConfigAdapterOptions`

#### Returns

`LocalStorageConfigAdapter`

## Methods

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [packages/core/src/config/ConfigPersistence.ts:90](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigPersistence.ts#L90)

Clear stored configuration.
Optional - not all adapters may support this.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ConfigPersistenceAdapter`](../interfaces/ConfigPersistenceAdapter.md).[`clear`](../interfaces/ConfigPersistenceAdapter.md#clear)

***

### getStorageKey()

> **getStorageKey**(): `string`

Defined in: [packages/core/src/config/ConfigPersistence.ts:105](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigPersistence.ts#L105)

Get the storage key being used.

#### Returns

`string`

***

### load()

> **load**(): `Promise`\<[`ExtendedConfig`](../interfaces/ExtendedConfig.md)\>

Defined in: [packages/core/src/config/ConfigPersistence.ts:42](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigPersistence.ts#L42)

Load configuration from storage.

#### Returns

`Promise`\<[`ExtendedConfig`](../interfaces/ExtendedConfig.md)\>

The loaded config, or null if no config exists

#### Implementation of

[`ConfigPersistenceAdapter`](../interfaces/ConfigPersistenceAdapter.md).[`load`](../interfaces/ConfigPersistenceAdapter.md#load)

***

### save()

> **save**(`config`): `Promise`\<`void`\>

Defined in: [packages/core/src/config/ConfigPersistence.ts:76](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/ConfigPersistence.ts#L76)

Save configuration to storage.

#### Parameters

##### config

[`ExtendedConfig`](../interfaces/ExtendedConfig.md)

The config to save

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ConfigPersistenceAdapter`](../interfaces/ConfigPersistenceAdapter.md).[`save`](../interfaces/ConfigPersistenceAdapter.md#save)
