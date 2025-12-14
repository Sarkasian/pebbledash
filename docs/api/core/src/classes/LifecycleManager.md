[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / LifecycleManager

# Class: LifecycleManager

Defined in: [packages/core/src/lifecycle/LifecycleManager.ts:3](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/lifecycle/LifecycleManager.ts#L3)

## Constructors

### Constructor

> **new LifecycleManager**(): `LifecycleManager`

#### Returns

`LifecycleManager`

## Methods

### emit()

> **emit**(`event`, `ctx`): `Promise`\<`boolean`\>

Defined in: [packages/core/src/lifecycle/LifecycleManager.ts:11](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/lifecycle/LifecycleManager.ts#L11)

#### Parameters

##### event

`string`

##### ctx

`unknown`

#### Returns

`Promise`\<`boolean`\>

***

### on()

> **on**(`event`, `cb`): () => `void`

Defined in: [packages/core/src/lifecycle/LifecycleManager.ts:5](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/lifecycle/LifecycleManager.ts#L5)

#### Parameters

##### event

`string`

##### cb

`Hook`

#### Returns

> (): `void`

##### Returns

`void`
