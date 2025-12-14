[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [renderer-dom/src](../README.md) / BaseDashboard

# Class: BaseDashboard

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:91](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L91)

## Constructors

### Constructor

> **new BaseDashboard**(`opts`): `BaseDashboard`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:106](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L106)

#### Parameters

##### opts

[`BaseDashboardOptions`](../interfaces/BaseDashboardOptions.md)

#### Returns

`BaseDashboard`

## Methods

### announce()

> **announce**(`message`): `void`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:215](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L215)

Announce a message to screen readers via the ARIA live region.
Consumers can use this to announce custom messages for accessibility.

#### Parameters

##### message

`string`

The message to announce

#### Returns

`void`

***

### endConfigPreview()

> **endConfigPreview**(): `void`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:259](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L259)

End the configuration preview and remove overlays.

#### Returns

`void`

***

### getModel()

> **getModel**(): `DashboardModel`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:221](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L221)

#### Returns

`DashboardModel`

***

### getPreviewAffectedTiles()

> **getPreviewAffectedTiles**(): `TileId`[]

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:276](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L276)

Get tiles that would be affected by the current preview config.

#### Returns

`TileId`[]

***

### isConfigPreviewActive()

> **isConfigPreviewActive**(): `boolean`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:269](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L269)

Check if config preview is currently active.

#### Returns

`boolean`

***

### mount()

> **mount**(): `Promise`\<`void`\>

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:111](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L111)

#### Returns

`Promise`\<`void`\>

***

### setMode()

> **setMode**(`mode`): `void`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:225](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L225)

#### Parameters

##### mode

`"resize"` | `"insert"`

#### Returns

`void`

***

### startConfigPreview()

> **startConfigPreview**(`config`): `void`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:248](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L248)

Start a configuration preview with proposed changes.
Shows a ghost overlay indicating which tiles would be affected
and visualizes constraint boundaries.

#### Parameters

##### config

`PartialExtendedConfig`

Proposed configuration changes

#### Returns

`void`

***

### unmount()

> **unmount**(): `void`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:198](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L198)

#### Returns

`void`

***

### updateConfigPreview()

> **updateConfigPreview**(`config`): `void`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:283](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L283)

Update the preview with new proposed config.

#### Parameters

##### config

`PartialExtendedConfig`

#### Returns

`void`

***

### updateDefaults()

> **updateDefaults**(`partial`): `Promise`\<`void`\>

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:289](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L289)

#### Parameters

##### partial

###### epsilon?

`number`

###### maxTiles?

`number`

###### minTile?

\{ `height`: `number`; `width`: `number`; \}

###### minTile.height

`number`

###### minTile.width

`number`

#### Returns

`Promise`\<`void`\>
