[**Pebbledash API Reference v0.0.0**](../../README.md)

***

[Pebbledash API Reference](../../modules.md) / core/src

# core/src

## Classes

- [APIAdapter](classes/APIAdapter.md)
- [CallbackConfigAdapter](classes/CallbackConfigAdapter.md)
- [ConfigError](classes/ConfigError.md)
- [ConfigManager](classes/ConfigManager.md)
- [DashboardError](classes/DashboardError.md)
- [DashboardModel](classes/DashboardModel.md)
- [DashboardState](classes/DashboardState.md)
- [HistoryManager](classes/HistoryManager.md)
- [LifecycleManager](classes/LifecycleManager.md)
- [LocalStorageAdapter](classes/LocalStorageAdapter.md)
- [LocalStorageConfigAdapter](classes/LocalStorageConfigAdapter.md)
- [MemoryAdapter](classes/MemoryAdapter.md)
- [MemoryConfigAdapter](classes/MemoryConfigAdapter.md)
- [OperationError](classes/OperationError.md)
- [PersistenceError](classes/PersistenceError.md)
- [PersistenceManager](classes/PersistenceManager.md)
- [Plugin](classes/Plugin.md)
- [PluginManager](classes/PluginManager.md)
- [StateValidationError](classes/StateValidationError.md)
- [StrategyRegistry](classes/StrategyRegistry.md)
- [Tile](classes/Tile.md)
- [TileGroup](classes/TileGroup.md)
- [TileRepository](classes/TileRepository.md)
- [TileState](classes/TileState.md)
- [TileValidationError](classes/TileValidationError.md)

## Interfaces

- [AnimationConfig](interfaces/AnimationConfig.md)
- [BorderConfig](interfaces/BorderConfig.md)
- [ConfigChangeResult](interfaces/ConfigChangeResult.md)
- [ConfigManagerOptions](interfaces/ConfigManagerOptions.md)
- [ConfigPersistenceAdapter](interfaces/ConfigPersistenceAdapter.md)
- [DecisionContext](interfaces/DecisionContext.md)
- [DecisionResult](interfaces/DecisionResult.md)
- [ExtendedConfig](interfaces/ExtendedConfig.md)
- [PersistenceAdapter](interfaces/PersistenceAdapter.md)
- [Seam](interfaces/Seam.md)
- [SnapshotV1](interfaces/SnapshotV1.md)
- [SnapshotV2](interfaces/SnapshotV2.md)
- [SnapThresholdsConfig](interfaces/SnapThresholdsConfig.md)
- [TileConstraints](interfaces/TileConstraints.md)
- [TileDefaultsConfig](interfaces/TileDefaultsConfig.md)
- [TileRect](interfaces/TileRect.md)
- [TileSnapshot](interfaces/TileSnapshot.md)
- [ValidationError](interfaces/ValidationError.md)
- [ValidationResult](interfaces/ValidationResult.md)
- [Violation](interfaces/Violation.md)

## Type Aliases

- [ConfigEvent](type-aliases/ConfigEvent.md)
- [ConfigEventHandler](type-aliases/ConfigEventHandler.md)
- [ErrorCodeType](type-aliases/ErrorCodeType.md)
- [Operation](type-aliases/Operation.md)
- [PartialExtendedConfig](type-aliases/PartialExtendedConfig.md)
- [ResizeEdge](type-aliases/ResizeEdge.md)
- [Snapshot](type-aliases/Snapshot.md)
- [TileId](type-aliases/TileId.md)

## Variables

- [CURRENT\_CONFIG\_VERSION](variables/CURRENT_CONFIG_VERSION.md)
- [DEFAULT\_CONFIG](variables/DEFAULT_CONFIG.md)
- [ErrorCode](variables/ErrorCode.md)

## Functions

- [applySeamDelta](functions/applySeamDelta.md)
- [autoAdjustLayout](functions/autoAdjustLayout.md)
- [clampSeamDelta](functions/clampSeamDelta.md)
- [coversFullSpanHorizontal](functions/coversFullSpanHorizontal.md)
- [coversFullSpanVertical](functions/coversFullSpanVertical.md)
- [coversSpan](functions/coversSpan.md)
- [createConfig](functions/createConfig.md)
- [getAffectedTiles](functions/getAffectedTiles.md)
- [getEffectiveMaxHeight](functions/getEffectiveMaxHeight.md)
- [getEffectiveMaxWidth](functions/getEffectiveMaxWidth.md)
- [getEffectiveMinHeight](functions/getEffectiveMinHeight.md)
- [getEffectiveMinWidth](functions/getEffectiveMinWidth.md)
- [hasErrorCode](functions/hasErrorCode.md)
- [isDashboardError](functions/isDashboardError.md)
- [isSnapshotV2](functions/isSnapshotV2.md)
- [migrateConfig](functions/migrateConfig.md)
- [migrateSnapshotToV2](functions/migrateSnapshotToV2.md)
- [resolveEdgeToSeamId](functions/resolveEdgeToSeamId.md)
- [seamIdForEdge](functions/seamIdForEdge.md)
- [validateConfig](functions/validateConfig.md)
- [validatePartialConfig](functions/validatePartialConfig.md)
- [validateTile](functions/validateTile.md)
