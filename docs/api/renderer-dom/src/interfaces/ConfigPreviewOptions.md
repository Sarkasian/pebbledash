[**Pebbledash API Reference v0.0.0**](../../../README.md)

***

[Pebbledash API Reference](../../../modules.md) / [renderer-dom/src](../README.md) / ConfigPreviewOptions

# Interface: ConfigPreviewOptions

Defined in: [packages/renderer-dom/src/ConfigPreviewOverlay.ts:17](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/ConfigPreviewOverlay.ts#L17)

## Properties

### onRenderTilePreview()?

> `optional` **onRenderTilePreview**: (`tileId`, `tileElement`, `status`) => () => `void`

Defined in: [packages/renderer-dom/src/ConfigPreviewOverlay.ts:19](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/ConfigPreviewOverlay.ts#L19)

Custom render function for tile preview (return cleanup function)

#### Parameters

##### tileId

`TileId`

##### tileElement

`HTMLElement`

##### status

###### isAffected

`boolean`

###### violatesMax

`boolean`

###### violatesMin

`boolean`

#### Returns

> (): `void`

##### Returns

`void`

***

### previewColors?

> `optional` **previewColors**: `object`

Defined in: [packages/renderer-dom/src/ConfigPreviewOverlay.ts:25](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/ConfigPreviewOverlay.ts#L25)

Custom colors for the built-in preview

#### affected?

> `optional` **affected**: `string`

#### compliant?

> `optional` **compliant**: `string`

#### violating?

> `optional` **violating**: `string`
