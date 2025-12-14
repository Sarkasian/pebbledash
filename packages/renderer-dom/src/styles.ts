/**
 * CSS custom property definitions for theming pebbledash dashboards.
 * Consumers can override these by setting CSS variables on the .ud-root element.
 */

export const CSS_VARIABLES = `
  /* Background colors */
  --ud-bg: #ffffff;
  --ud-tile-bg: #f8f8f8;
  --ud-tile-bg-hover: #f0f0f0;
  
  /* Border colors */
  --ud-border-color: #e0e0e0;
  --ud-border-color-focus: var(--ud-accent-color, #005fcc);
  
  /* Text colors */
  --ud-text-color: #1a1a1a;
  --ud-text-muted: #666666;
  
  /* Interactive colors */
  --ud-accent-color: #005fcc;
  --ud-accent-color-hover: #0047a3;
  --ud-focus-color: var(--ud-accent-color, #005fcc);
  --ud-focus-offset: -3px;
  
  /* Overlay colors */
  --ud-overlay-bg: rgba(0, 0, 0, 0.05);
  --ud-resize-handle-color: var(--ud-accent-color, #005fcc);
  
  /* Config preview colors */
  --ud-preview-affected-bg: rgba(255, 100, 100, 0.2);
  --ud-preview-affected-border: #ff4444;
  --ud-preview-compliant: #4CAF50;
  --ud-preview-violating: #f44336;
  --ud-preview-indicator-bg: #ff4444;
  --ud-preview-indicator-color: white;
  
  /* Spacing */
  --ud-tile-gap: 0px;
  --ud-tile-padding: 0px;
  --ud-tile-border-radius: 0px;
  --ud-overlay-padding: 4px;
  
  /* Animation */
  --ud-transition-duration: 200ms;
  --ud-transition-easing: ease-out;
  
  /* Shadows */
  --ud-tile-shadow: none;
  --ud-tile-shadow-hover: 0 2px 8px rgba(0, 0, 0, 0.1);

  /* Edge overlay */
  --ud-edge-width: 8px;
  --ud-edge-color: transparent;
  --ud-edge-color-hover: var(--ud-accent-color, #005fcc);
  --ud-edge-color-disabled: #999999;
`;

/**
 * Get the complete base styles for the dashboard including CSS variables.
 * @param rootClass - The CSS class name prefix (default: 'ud')
 */
export function getBaseStyles(rootClass: string = 'ud'): string {
  return `
    .${rootClass}-root {
      ${CSS_VARIABLES}
      background: var(--ud-bg);
      color: var(--ud-text-color);
    }

    .${rootClass}-tile {
      background: var(--ud-tile-bg);
      border-radius: var(--ud-tile-border-radius);
      box-shadow: var(--ud-tile-shadow);
      transition: box-shadow var(--ud-transition-duration) var(--ud-transition-easing);
    }

    .${rootClass}-tile:hover {
      box-shadow: var(--ud-tile-shadow-hover);
    }

    /* Focus styles - WCAG 2.1 AA compliant */
    .${rootClass}-root:focus {
      outline: 3px solid var(--ud-focus-color);
      outline-offset: 2px;
    }
    .${rootClass}-root:focus:not(:focus-visible) {
      outline: none;
    }
    .${rootClass}-root:focus-visible {
      outline: 3px solid var(--ud-focus-color);
      outline-offset: 2px;
    }

    .${rootClass}-tile:focus {
      outline: 3px solid var(--ud-focus-color);
      outline-offset: var(--ud-focus-offset);
      z-index: 10;
    }
    .${rootClass}-tile:focus:not(:focus-visible) {
      outline: none;
    }
    .${rootClass}-tile:focus-visible {
      outline: 3px solid var(--ud-focus-color);
      outline-offset: var(--ud-focus-offset);
      z-index: 10;
    }

    .${rootClass}-edge:focus,
    .${rootClass}-edge.active {
      outline: 2px solid var(--ud-focus-color);
      outline-offset: 1px;
    }

    /* Reduced motion: disable transitions and animations */
    .${rootClass}-reduced-motion .${rootClass}-tile,
    .${rootClass}-reduced-motion .${rootClass}-edge {
      transition: none !important;
      animation: none !important;
    }

    /* ARIA live region - visually hidden but accessible */
    .${rootClass}-live-region {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* Tile header container */
    .${rootClass}-tile-header {
      background: var(--ud-tile-bg);
      border-bottom: 1px solid var(--ud-border-color);
    }

    /* Out of bounds indicator (edge at limit) - animated shimmer */
    .${rootClass}-edge.edge--oob {
      background: linear-gradient(90deg, #f44336 25%, #ff6b6b 50%, #f44336 75%) !important;
      background-size: 200% 100%;
      animation: oobShimmer 0.8s ease-in-out infinite;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Ghost tile appearance animation */
    @keyframes ghostAppear {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Ghost tile pulse glow effect */
    @keyframes ghostPulse {
      0%, 100% { box-shadow: 0 0 8px 2px rgba(0, 150, 255, 0.3); }
      50% { box-shadow: 0 0 16px 4px rgba(0, 150, 255, 0.5); }
    }

    /* Ghost tile pulse for invalid state */
    @keyframes ghostPulseInvalid {
      0%, 100% { box-shadow: 0 0 8px 2px rgba(255, 68, 68, 0.3); }
      50% { box-shadow: 0 0 16px 4px rgba(255, 68, 68, 0.5); }
    }

    /* OOB indicator shimmer animation */
    @keyframes oobShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* New tile creation success flash */
    @keyframes tileCreated {
      0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.6); }
      50% { box-shadow: 0 0 20px 5px rgba(76, 175, 80, 0.4); }
      100% { box-shadow: var(--ud-tile-shadow, none); }
    }

    /* Redistribute mode (Shift key held) */
    .${rootClass}-root.redistribute-mode {
      outline: 2px solid var(--ud-accent-color, #005fcc);
      outline-offset: -2px;
    }

    .${rootClass}-root.redistribute-mode::after {
      content: 'Shift: Redistribute (Tab to cycle)';
      position: absolute;
      top: 8px;
      right: 8px;
      background: var(--ud-accent-color, #005fcc);
      color: white;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      z-index: 1001;
      pointer-events: none;
      animation: fadeIn 100ms ease-out;
    }

    /* Redistribute animation - smooth tile position transitions */
    .${rootClass}-tile.redistribute-animating {
      transition: 
        left 200ms cubic-bezier(0.4, 0, 0.2, 1),
        top 200ms cubic-bezier(0.4, 0, 0.2, 1),
        width 200ms cubic-bezier(0.4, 0, 0.2, 1),
        height 200ms cubic-bezier(0.4, 0, 0.2, 1),
        box-shadow var(--ud-transition-duration) var(--ud-transition-easing);
    }

    /* Reduced motion: disable redistribute animations too */
    .${rootClass}-reduced-motion .${rootClass}-tile.redistribute-animating {
      transition: none !important;
    }

    /* Tiles being actively resized in redistribute mode - subtle elevation */
    .${rootClass}-tile.redistribute-expanding,
    .${rootClass}-tile.redistribute-shrinking {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      z-index: 50;
      /* Only transition shadow, not position */
      transition: box-shadow 150ms ease-out;
    }

    /* Commit animation - smooth settle with subtle bounce */
    .${rootClass}-tile.redistribute-committing {
      transition: 
        left 250ms cubic-bezier(0.34, 1.56, 0.64, 1),
        top 250ms cubic-bezier(0.34, 1.56, 0.64, 1),
        width 250ms cubic-bezier(0.34, 1.56, 0.64, 1),
        height 250ms cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow var(--ud-transition-duration) var(--ud-transition-easing);
    }

    /* New tile success flash animation */
    .${rootClass}-tile.redistribute-new-tile {
      animation: tileCreated 400ms ease-out forwards;
    }

    /* Ghost tile for partial redistribute */
    .redistribute-ghost {
      position: absolute;
      background: rgba(0, 150, 255, 0.25);
      border: 2px dashed rgba(0, 150, 255, 0.8);
      border-radius: var(--ud-tile-border-radius, 0);
      pointer-events: none;
      z-index: 100;
      box-sizing: border-box;
      /* Appearance animation + pulse glow */
      animation: ghostAppear 150ms ease-out forwards, ghostPulse 2s ease-in-out infinite 150ms;
      transform-origin: center;
      /* Transition colors for valid/invalid state changes */
      transition: background 150ms ease-out, border-color 150ms ease-out;
    }

    /* Ghost tile label */
    .redistribute-ghost::after {
      content: 'New Tile';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 12px;
      font-weight: 600;
      color: rgba(0, 95, 204, 0.9);
      white-space: nowrap;
      pointer-events: none;
    }

    /* Invalid ghost tile (too small) - shown in red with red pulse */
    .redistribute-ghost.invalid {
      background: rgba(255, 68, 68, 0.25);
      border-color: rgba(255, 68, 68, 0.8);
      animation: ghostAppear 150ms ease-out forwards, ghostPulseInvalid 2s ease-in-out infinite 150ms;
    }

    .redistribute-ghost.invalid::after {
      content: 'Too Small';
      color: rgba(255, 68, 68, 0.9);
    }

    /* Reduced motion: disable ghost tile animations and transitions */
    .${rootClass}-reduced-motion .redistribute-ghost {
      transition: none !important;
      animation: none !important;
    }
  `;
}

/**
 * Get the config preview overlay styles.
 * @param rootClass - The CSS class name prefix (default: 'ud')
 */
export function getConfigPreviewStyles(rootClass: string = 'ud'): string {
  return `
    .${rootClass}-config-preview-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 100;
    }

    .${rootClass}-config-preview-tile {
      position: absolute;
      box-sizing: border-box;
      overflow: visible;
    }

    .${rootClass}-config-preview-highlight {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--ud-preview-affected-bg);
      border: 2px dashed var(--ud-preview-affected-border);
      box-sizing: border-box;
    }

    .${rootClass}-config-preview-indicator {
      position: absolute;
      top: var(--ud-overlay-padding);
      right: var(--ud-overlay-padding);
      width: 20px;
      height: 20px;
      background: var(--ud-preview-indicator-bg);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ud-preview-indicator-color);
      font-size: 14px;
      font-weight: bold;
    }

    .${rootClass}-config-preview-boundary {
      position: absolute;
      border-width: 2px;
      border-style: dashed;
      box-sizing: border-box;
      pointer-events: none;
    }

    .${rootClass}-min-size-rect {
      border-color: var(--ud-preview-compliant);
    }

    .${rootClass}-min-size-rect.violating {
      border-color: var(--ud-preview-violating);
    }

    .${rootClass}-max-size-rect {
      border-color: var(--ud-preview-violating);
    }
  `;
}

