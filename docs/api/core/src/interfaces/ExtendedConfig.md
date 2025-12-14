[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [core/src](../README.md) / ExtendedConfig

# Interface: ExtendedConfig

Defined in: [packages/core/src/config/types.ts:81](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L81)

Extended configuration for the dashboard.
All options are optional with sensible defaults.

## Properties

### animation

> **animation**: [`AnimationConfig`](AnimationConfig.md)

Defined in: [packages/core/src/config/types.ts:101](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L101)

Animation settings for tile transitions

***

### border

> **border**: [`BorderConfig`](BorderConfig.md)

Defined in: [packages/core/src/config/types.ts:99](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L99)

Border styling for tiles

***

### epsilon?

> `optional` **epsilon**: `number`

Defined in: [packages/core/src/config/types.ts:92](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L92)

Floating point tolerance for coordinate comparisons (default: 1e-6)

***

### gutter

> **gutter**: `number`

Defined in: [packages/core/src/config/types.ts:97](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L97)

CSS gap between tiles in pixels (default: 0)

***

### interactionMode

> **interactionMode**: `"locked"` \| `"resize"` \| `"insert"`

Defined in: [packages/core/src/config/types.ts:108](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L108)

Current interaction mode (default: 'insert')

***

### maxTiles?

> `optional` **maxTiles**: `number`

Defined in: [packages/core/src/config/types.ts:90](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L90)

Maximum number of tiles allowed (default: undefined - no limit)

***

### minTile

> **minTile**: `object`

Defined in: [packages/core/src/config/types.ts:88](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L88)

Minimum tile dimensions in percentage units (default: { width: 5, height: 5 })

#### height

> **height**: `number`

#### width

> **width**: `number`

***

### snapThresholds

> **snapThresholds**: [`SnapThresholdsConfig`](SnapThresholdsConfig.md)

Defined in: [packages/core/src/config/types.ts:106](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L106)

Snap thresholds for resize operations

***

### tileDefaults

> **tileDefaults**: [`TileDefaultsConfig`](TileDefaultsConfig.md)

Defined in: [packages/core/src/config/types.ts:113](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L113)

Default constraints applied to all tiles

***

### version

> **version**: `1`

Defined in: [packages/core/src/config/types.ts:83](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/core/src/config/types.ts#L83)

Config schema version for migration support
