[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / PartialExtendedConfig

# Type Alias: PartialExtendedConfig

> **PartialExtendedConfig** = `Partial`\<`Omit`\<[`ExtendedConfig`](../interfaces/ExtendedConfig.md), `"version"`\>\> & `object`

Defined in: [packages/core/src/config/types.ts:119](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L119)

Partial config for updates - all fields optional except version.

## Type Declaration

### version?

> `optional` **version**: [`ExtendedConfig`](../interfaces/ExtendedConfig.md)\[`"version"`\]
