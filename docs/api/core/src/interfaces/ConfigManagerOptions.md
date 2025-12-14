[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / ConfigManagerOptions

# Interface: ConfigManagerOptions

Defined in: [packages/core/src/config/types.ts:269](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L269)

Options for ConfigManager constructor.

## Properties

### adapter?

> `optional` **adapter**: [`ConfigPersistenceAdapter`](ConfigPersistenceAdapter.md)

Defined in: [packages/core/src/config/types.ts:275](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L275)

Persistence adapter (default: MemoryConfigAdapter)

***

### autoSave?

> `optional` **autoSave**: `boolean`

Defined in: [packages/core/src/config/types.ts:277](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L277)

Whether to auto-save on changes (default: false)

***

### dashboardId

> **dashboardId**: `string`

Defined in: [packages/core/src/config/types.ts:271](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L271)

Unique dashboard identifier for namespacing

***

### initialConfig?

> `optional` **initialConfig**: [`PartialExtendedConfig`](../type-aliases/PartialExtendedConfig.md)

Defined in: [packages/core/src/config/types.ts:273](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L273)

Initial configuration (merged with defaults)
