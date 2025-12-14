[**pebbledash API Reference v0.0.0**](../../../README.md)

***

[pebbledash API Reference](../../../modules.md) / [renderer-dom/src](../README.md) / RedistributeOption

# Interface: RedistributeOption

Defined in: packages/renderer-dom/src/resizeTypes.ts:51

A redistribute option describing how tiles will be rearranged

## Properties

### description

> **description**: `string`

Defined in: packages/renderer-dom/src/resizeTypes.ts:53

Description of the option (e.g., "Shrink A from top")

***

### neighborRetainedArea

> **neighborRetainedArea**: `number`

Defined in: packages/renderer-dom/src/resizeTypes.ts:59

Area retained by the shrinking tile (for sorting)

***

### shrinkDirection

> **shrinkDirection**: `"top"` \| `"bottom"` \| `"left"` \| `"right"`

Defined in: packages/renderer-dom/src/resizeTypes.ts:55

Direction the neighbor shrinks from ('top', 'bottom', 'left', 'right')

***

### tiles

> **tiles**: `TileRect`[]

Defined in: packages/renderer-dom/src/resizeTypes.ts:57

The resulting tile positions
