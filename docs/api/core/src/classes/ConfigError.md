[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / ConfigError

# Class: ConfigError

Defined in: [packages/core/src/errors.ts:115](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/errors.ts#L115)

Error thrown when a configuration is invalid.

## Extends

- [`DashboardError`](DashboardError.md)

## Constructors

### Constructor

> **new ConfigError**(`code`, `message`, `context?`): `ConfigError`

Defined in: [packages/core/src/errors.ts:116](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/errors.ts#L116)

#### Parameters

##### code

[`ErrorCodeType`](../type-aliases/ErrorCodeType.md)

##### message

`string`

##### context?

`Record`\<`string`, `unknown`\>

#### Returns

`ConfigError`

#### Overrides

[`DashboardError`](DashboardError.md).[`constructor`](DashboardError.md#constructor)

## Properties

### code

> `readonly` **code**: [`ErrorCodeType`](../type-aliases/ErrorCodeType.md)

Defined in: [packages/core/src/errors.ts:55](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/errors.ts#L55)

Error code for programmatic handling

#### Inherited from

[`DashboardError`](DashboardError.md).[`code`](DashboardError.md#code)

***

### context?

> `readonly` `optional` **context**: `Record`\<`string`, `unknown`\>

Defined in: [packages/core/src/errors.ts:58](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/errors.ts#L58)

Additional context about the error

#### Inherited from

[`DashboardError`](DashboardError.md).[`context`](DashboardError.md#context)

## Methods

### toJSON()

> **toJSON**(): `object`

Defined in: [packages/core/src/errors.ts:73](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/errors.ts#L73)

Convert error to JSON for logging/serialization

#### Returns

`object`

##### code

> **code**: [`ErrorCodeType`](../type-aliases/ErrorCodeType.md)

##### context?

> `optional` **context**: `Record`\<`string`, `unknown`\>

##### message

> **message**: `string`

#### Inherited from

[`DashboardError`](DashboardError.md).[`toJSON`](DashboardError.md#tojson)
