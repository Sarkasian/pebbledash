[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / migrateConfig

# Function: migrateConfig()

> **migrateConfig**(`config`): `unknown`

Defined in: [packages/core/src/config/migrations.ts:30](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/migrations.ts#L30)

Migrate a config object to the current version.
Applies all necessary migrations in sequence.

## Parameters

### config

`unknown`

The config to migrate (may be any version)

## Returns

`unknown`

The migrated config at the current version
