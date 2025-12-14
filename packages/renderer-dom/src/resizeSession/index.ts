/**
 * Resize session module - handles drag-based tile resizing.
 * 
 * This module has been refactored into smaller sub-modules:
 * - visualFeedback.ts - Ghost tiles and DOM preview
 * - keyboardHandlers.ts - Shift/Tab key handling for redistribute
 * - redistributeMode.ts - Shift+drag redistribute logic
 * - normalResize.ts - Standard seam-based resize logic
 * 
 * The main startResizeSession function orchestrates these components.
 */

export { startResizeSession } from '../resizeSession.js';
export type { ResizeConfig, RedistributeConfig, ResizeSessionHooks } from '../resizeTypes.js';

// Re-export sub-module utilities for advanced use cases
export {
  createVisualFeedbackState,
  updateGhostTileElement,
  applyVisualPreview,
  setTileTransitions,
  cleanupVisualFeedback,
  type VisualFeedbackState,
} from './visualFeedback.js';

export {
  createKeyboardState,
  createKeyboardHandlers,
  resetKeyboardState,
  type KeyboardState,
} from './keyboardHandlers.js';

export {
  createRedistributeModeState,
  processRedistributeMode,
  commitRedistribute,
  type RedistributeModeState,
  type RedistributeModeContext,
} from './redistributeMode.js';

export {
  createNormalResizeState,
  processNormalResize,
  resetEdgeElement,
  type NormalResizeState,
  type NormalResizeContext,
} from './normalResize.js';

