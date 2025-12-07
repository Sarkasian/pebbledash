// Advanced/unstable/internal surface - subject to change without notice
export { GraphRegistry, DecisionEngine } from './decision-engine/DecisionEngine.js';
export { ConditionNode, ActionNode, SequenceNode, SelectorNode } from './decision-engine/nodes.js';
export { TileExists } from './decision-engine/conditions/TileExists.js';
export { NotLocked } from './decision-engine/conditions/NotLocked.js';
export { MinTileSize } from './decision-engine/conditions/MinTileSize.js';
export { MaxTileCount } from './decision-engine/conditions/MaxTileCount.js';
export { BoundsValid } from './decision-engine/conditions/BoundsValid.js';
export { CoverageTight } from './decision-engine/conditions/CoverageTight.js';
export { MinTileSizeAll } from './decision-engine/conditions/MinTileSizeAll.js';
export { GroupPolicyAllowsDelete } from './decision-engine/conditions/GroupPolicyAllowsDelete.js';
export { ResizableNeighborAvailable } from './decision-engine/conditions/ResizableNeighborAvailable.js';
export { FullSpanSeamAvailable } from './decision-engine/conditions/FullSpanSeamAvailable.js';
export { SeamChainCovered } from './decision-engine/conditions/SeamChainCovered.js';
export { InsertionNavigator } from './interaction/InsertionNavigator.js';
export type {
  HoverEdge,
  InsertionBoundary,
  BoundaryGroup,
} from './interaction/InsertionNavigator.js';
export { clampSeamDelta, applySeamDelta } from './seams/index.js';
export {
  seamIdForEdge,
  resolveEdgeToSeamId,
  coversSpan,
  coversFullSpanVertical,
  coversFullSpanHorizontal,
} from './seams/index.js';
export { StrategyRegistry } from './strategies/StrategyRegistry.js';
export { LinearResizeStrategy } from './strategies/resize/LinearResizeStrategy.js';
export { AutomaticResizeStrategy } from './strategies/resize/AutomaticResizeStrategy.js';
export { EqualSplitStrategy } from './strategies/split/EqualSplitStrategy.js';
export { RatioSplitStrategy } from './strategies/split/RatioSplitStrategy.js';
