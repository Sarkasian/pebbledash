[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / Plugin

# Abstract Class: Plugin

Defined in: [packages/core/src/plugins/Plugin.ts:1](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/plugins/Plugin.ts#L1)

## Constructors

### Constructor

> **new Plugin**(`name`, `version`): `Plugin`

Defined in: [packages/core/src/plugins/Plugin.ts:2](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/plugins/Plugin.ts#L2)

#### Parameters

##### name

`string`

##### version

`string`

#### Returns

`Plugin`

## Properties

### name

> `readonly` **name**: `string`

Defined in: [packages/core/src/plugins/Plugin.ts:3](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/plugins/Plugin.ts#L3)

***

### version

> `readonly` **version**: `string`

Defined in: [packages/core/src/plugins/Plugin.ts:4](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/plugins/Plugin.ts#L4)

## Methods

### cleanup()

> **cleanup**(): `void`

Defined in: [packages/core/src/plugins/Plugin.ts:7](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/plugins/Plugin.ts#L7)

#### Returns

`void`

***

### initialize()

> **initialize**(`_model`): `void`

Defined in: [packages/core/src/plugins/Plugin.ts:6](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/plugins/Plugin.ts#L6)

#### Parameters

##### \_model

`unknown`

#### Returns

`void`
