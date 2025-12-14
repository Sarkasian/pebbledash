[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / ValidationError

# Interface: ValidationError

Defined in: [packages/core/src/config/types.ts:142](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L142)

Single validation error.

## Properties

### message

> **message**: `string`

Defined in: [packages/core/src/config/types.ts:146](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L146)

Error message

***

### path

> **path**: `string`

Defined in: [packages/core/src/config/types.ts:144](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L144)

Path to the invalid field (e.g., 'minTile.width')

***

### value

> **value**: `unknown`

Defined in: [packages/core/src/config/types.ts:148](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L148)

The invalid value
