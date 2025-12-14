[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [renderer-dom/src](../README.md) / DomRendererOptions

# Interface: DomRendererOptions

Defined in: [packages/renderer-dom/src/index.ts:5](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L5)

## Properties

### classNameRoot?

> `optional` **classNameRoot**: `string`

Defined in: [packages/renderer-dom/src/index.ts:7](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L7)

***

### container

> **container**: `HTMLElement`

Defined in: [packages/renderer-dom/src/index.ts:6](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L6)

***

### hoverDebounceMs?

> `optional` **hoverDebounceMs**: `number`

Defined in: [packages/renderer-dom/src/index.ts:24](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L24)

Hover debounce time in ms (default: 50)

***

### onTileClick()?

> `optional` **onTileClick**: (`tileId`, `event`) => `void`

Defined in: [packages/renderer-dom/src/index.ts:13](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L13)

Called when a tile is clicked (not on resize edges or during drag)

#### Parameters

##### tileId

`TileId`

##### event

`MouseEvent`

#### Returns

`void`

***

### onTileContextMenu()?

> `optional` **onTileContextMenu**: (`tileId`, `event`) => `void`

Defined in: [packages/renderer-dom/src/index.ts:21](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L21)

Called on right-click for custom context menus

#### Parameters

##### tileId

`TileId`

##### event

`MouseEvent`

#### Returns

`void`

***

### onTileDoubleClick()?

> `optional` **onTileDoubleClick**: (`tileId`, `event`) => `void`

Defined in: [packages/renderer-dom/src/index.ts:15](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L15)

Called when a tile is double-clicked

#### Parameters

##### tileId

`TileId`

##### event

`MouseEvent`

#### Returns

`void`

***

### onTileFocus()?

> `optional` **onTileFocus**: (`tileId`, `focused`) => `void`

Defined in: [packages/renderer-dom/src/index.ts:19](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L19)

Called when a tile receives/loses focus

#### Parameters

##### tileId

`TileId`

##### focused

`boolean`

#### Returns

`void`

***

### onTileHover()?

> `optional` **onTileHover**: (`tileId`, `entering`, `event`) => `void`

Defined in: [packages/renderer-dom/src/index.ts:17](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L17)

Called when pointer enters/leaves a tile

#### Parameters

##### tileId

`TileId`

##### entering

`boolean`

##### event

`MouseEvent`

#### Returns

`void`

***

### widgets?

> `optional` **widgets**: [`WidgetRegistry`](../type-aliases/WidgetRegistry.md)

Defined in: [packages/renderer-dom/src/index.ts:9](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/index.ts#L9)

Registry of widget factories keyed by widget type
