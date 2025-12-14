[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [renderer-dom/src](../README.md) / ConfigPreviewOverlay

# Class: ConfigPreviewOverlay

Defined in: [packages/renderer-dom/src/ConfigPreviewOverlay.ts:40](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/ConfigPreviewOverlay.ts#L40)

Configuration preview overlay that shows:
- Semi-transparent overlay on affected tiles
- Dashed rectangle outline showing min/max size boundaries
  - For tiles meeting constraints: rectangle appears inside the tile (green)
  - For tiles violating constraints: rectangle extends beyond tile bounds (red)
- Warning indicator on affected tiles

## Constructors

### Constructor

> **new ConfigPreviewOverlay**(`container`, `model`, `options`, `rootClass`): `ConfigPreviewOverlay`

Defined in: [packages/renderer-dom/src/ConfigPreviewOverlay.ts:51](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/ConfigPreviewOverlay.ts#L51)

#### Parameters

##### container

`HTMLElement`

##### model

`DashboardModel`

##### options

[`ConfigPreviewOptions`](../interfaces/ConfigPreviewOptions.md) = `{}`

##### rootClass

`string` = `'ud'`

#### Returns

`ConfigPreviewOverlay`

## Methods

### endPreview()

> **endPreview**(): `void`

Defined in: [packages/renderer-dom/src/ConfigPreviewOverlay.ts:118](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/ConfigPreviewOverlay.ts#L118)

End the preview and remove overlays.

#### Returns

`void`

***

### getAffectedTiles()

> **getAffectedTiles**(): `TileId`[]

Defined in: [packages/renderer-dom/src/ConfigPreviewOverlay.ts:135](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/ConfigPreviewOverlay.ts#L135)

Get the list of affected tile IDs.

#### Returns

`TileId`[]

***

### isPreviewActive()

> **isPreviewActive**(): `boolean`

Defined in: [packages/renderer-dom/src/ConfigPreviewOverlay.ts:128](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/ConfigPreviewOverlay.ts#L128)

Check if preview is currently active.

#### Returns

`boolean`

***

### startPreview()

> **startPreview**(`proposedConfig`): `void`

Defined in: [packages/renderer-dom/src/ConfigPreviewOverlay.ts:80](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/ConfigPreviewOverlay.ts#L80)

Start showing the preview overlay for proposed config changes.

#### Parameters

##### proposedConfig

`PartialExtendedConfig`

#### Returns

`void`

***

### updatePreview()

> **updatePreview**(`proposedConfig`): `void`

Defined in: [packages/renderer-dom/src/ConfigPreviewOverlay.ts:142](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/ConfigPreviewOverlay.ts#L142)

Update the preview with new proposed config.

#### Parameters

##### proposedConfig

`PartialExtendedConfig`

#### Returns

`void`
