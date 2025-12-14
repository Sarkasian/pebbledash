[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [renderer-dom/src](../README.md) / BaseDashboardOptions

# Interface: BaseDashboardOptions

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:14](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L14)

## Properties

### container

> **container**: `string` \| `HTMLElement`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:15](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L15)

***

### defaults?

> `optional` **defaults**: `object`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:16](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L16)

#### epsilon?

> `optional` **epsilon**: `number`

#### maxTiles?

> `optional` **maxTiles**: `number`

#### minTile?

> `optional` **minTile**: `object`

##### minTile.height

> **height**: `number`

##### minTile.width

> **width**: `number`

***

### features?

> `optional` **features**: `object`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:34](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L34)

#### keyboard?

> `optional` **keyboard**: `boolean`

#### keyboardDelete?

> `optional` **keyboardDelete**: `boolean`

Enable Delete/Backspace to delete hovered tile (default: false)

#### keyboardUndoRedo?

> `optional` **keyboardUndoRedo**: `boolean`

Enable Ctrl+Z / Ctrl+Shift+Z keyboard shortcuts (default: false)

#### overlays?

> `optional` **overlays**: `boolean`

#### startMode?

> `optional` **startMode**: `"resize"` \| `"insert"`

***

### initialLayout?

> `optional` **initialLayout**: [`SnapshotV1`](../../../core/src/interfaces/SnapshotV1.md) \| \{ `tiles`: `object`[]; \}

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:21](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L21)

***

### onContainerResize()?

> `optional` **onContainerResize**: (`width`, `height`) => `void`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:68](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L68)

Called when container is resized

#### Parameters

##### width

`number`

##### height

`number`

#### Returns

`void`

***

### onHistoryChange()?

> `optional` **onHistoryChange**: (`canUndo`, `canRedo`) => `void`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:60](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L60)

Called when undo/redo availability changes

#### Parameters

##### canUndo

`boolean`

##### canRedo

`boolean`

#### Returns

`void`

***

### onModeChange()?

> `optional` **onModeChange**: (`newMode`, `previousMode`) => `void`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:64](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L64)

Called when interaction mode changes

#### Parameters

##### newMode

`"resize"` | `"insert"`

##### previousMode

`"resize"` | `"insert"`

#### Returns

`void`

***

### onResizeEnd()?

> `optional` **onResizeEnd**: (`tileId`, `edge`, `committed`) => `void`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:76](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L76)

Called when resize drag ends

#### Parameters

##### tileId

`TileId`

##### edge

`ResizeEdge`

##### committed

`boolean`

#### Returns

`void`

***

### onResizeMove()?

> `optional` **onResizeMove**: (`tileId`, `edge`, `delta`, `clamped`) => `void`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:74](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L74)

Called during resize with live delta (for preview UI)

#### Parameters

##### tileId

`TileId`

##### edge

`ResizeEdge`

##### delta

`number`

##### clamped

`boolean`

#### Returns

`void`

***

### onResizeStart()?

> `optional` **onResizeStart**: (`tileId`, `edge`) => `void`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:72](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L72)

Called when resize drag starts

#### Parameters

##### tileId

`TileId`

##### edge

`ResizeEdge`

#### Returns

`void`

***

### onTileClick()?

> `optional` **onTileClick**: (`tileId`, `event`) => `void`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:48](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L48)

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

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:56](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L56)

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

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:50](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L50)

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

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:54](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L54)

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

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:52](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L52)

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

### resizeConfig?

> `optional` **resizeConfig**: `object`

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:79](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L79)

#### clampDeadbandPx?

> `optional` **clampDeadbandPx**: `number`

Deadband for clamp feedback in pixels (default: 1)

#### dragThreshold?

> `optional` **dragThreshold**: `number`

Minimum pixels to drag before resize starts (default: 3)

#### minResizeRangePx?

> `optional` **minResizeRangePx**: `number`

Minimum pixel range for resize to be enabled (default: 2)

#### redistributeEqually?

> `optional` **redistributeEqually**: `boolean`

When using Shift+drag redistribute, shrink all tiles equally (default: false)

***

### widgets?

> `optional` **widgets**: [`WidgetRegistry`](../type-aliases/WidgetRegistry.md)

Defined in: [packages/renderer-dom/src/BaseDashboard.ts:44](https://github.com/Sarkasian/pebbledash/blob/d184e4b7b58802ec6202eac8e1a4bff4e89fc278/packages/renderer-dom/src/BaseDashboard.ts#L44)

Registry of widget factories keyed by widget type
