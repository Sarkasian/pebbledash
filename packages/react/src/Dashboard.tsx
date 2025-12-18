import { 
  useEffect, 
  useRef, 
  useState, 
  useCallback, 
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import type { DashboardModel, Tile, PartialExtendedConfig } from '@pebbledash/core';
import type { BaseDashboard as BaseDashboardType } from '@pebbledash/renderer-dom';
import { InternalDashboardContext } from './context/DashboardContext.js';
import type { DashboardProps, DashboardApi } from './types.js';

/**
 * A fully-featured React component for rendering pebbledash dashboards.
 * 
 * Supports all BaseDashboard features including:
 * - Tile interactions (click, double-click, hover, focus, context menu)
 * - History management (undo/redo)
 * - Mode switching (insert/resize)
 * - Config preview
 * - Accessibility (ARIA live region for announcements)
 * 
 * @example
 * ```tsx
 * function App() {
 *   const dashboardRef = useRef<DashboardApi>(null);
 *   
 *   return (
 *     <Dashboard
 *       ref={dashboardRef}
 *       widgets={{ default: createDefaultWidget }}
 *       defaults={{ minTile: { width: 10, height: 10 } }}
 *       features={{ overlays: true, keyboard: true }}
 *       onTileClick={(tileId) => console.log('Clicked:', tileId)}
 *       onReady={(api) => console.log('Dashboard ready!')}
 *     />
 *   );
 * }
 * ```
 */
export const Dashboard = forwardRef<DashboardApi, DashboardProps>(function Dashboard(
  {
    className,
    style,
    widgets,
    defaults,
    initialLayout,
    features = { overlays: true, keyboard: true },
    resizeConfig,
    onTileClick,
    onTileDoubleClick,
    onTileHover,
    onTileFocus,
    onTileContextMenu,
    onHistoryChange,
    onModeChange,
    onContainerResize,
    onResizeStart,
    onResizeMove,
    onResizeEnd,
    onTilesChange,
    onReady,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<BaseDashboardType | null>(null);
  const modelRef = useRef<DashboardModel | null>(null);
  
  // Track current values for callbacks without re-mounting
  const callbacksRef = useRef({
    onTileClick,
    onTileDoubleClick,
    onTileHover,
    onTileFocus,
    onTileContextMenu,
    onHistoryChange,
    onModeChange,
    onContainerResize,
    onResizeStart,
    onResizeMove,
    onResizeEnd,
    onTilesChange,
    onReady,
  });
  
  // Update callbacks ref when props change
  useEffect(() => {
    callbacksRef.current = {
      onTileClick,
      onTileDoubleClick,
      onTileHover,
      onTileFocus,
      onTileContextMenu,
      onHistoryChange,
      onModeChange,
      onContainerResize,
      onResizeStart,
      onResizeMove,
      onResizeEnd,
      onTilesChange,
      onReady,
    };
  });

  // State for context
  const [mode, setModeState] = useState<'insert' | 'resize'>(features.startMode ?? 'insert');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [tiles, setTiles] = useState<Tile[]>([]);

  // Create the API object
  const api = useMemo<DashboardApi>(() => ({
    getModel: () => modelRef.current!,
    setMode: (newMode: 'insert' | 'resize') => {
      dashboardRef.current?.setMode(newMode);
      setModeState(newMode);
    },
    getMode: () => mode,
    undo: () => modelRef.current?.undo(),
    redo: () => modelRef.current?.redo(),
    canUndo: () => modelRef.current?.canUndo() ?? false,
    canRedo: () => modelRef.current?.canRedo() ?? false,
    announce: (message: string) => dashboardRef.current?.announce(message),
    startConfigPreview: (config: PartialExtendedConfig) => {
      dashboardRef.current?.startConfigPreview(config);
    },
    endConfigPreview: () => dashboardRef.current?.endConfigPreview(),
    isConfigPreviewActive: () => dashboardRef.current?.isConfigPreviewActive() ?? false,
    getPreviewAffectedTiles: () => dashboardRef.current?.getPreviewAffectedTiles() ?? [],
    render: () => {
      // Trigger re-render by updating tiles
      if (modelRef.current) {
        setTiles(modelRef.current.getState().toArray());
      }
    },
  }), [mode]);

  // Expose API via ref
  useImperativeHandle(ref, () => api, [api]);

  // Mount dashboard
  useEffect(() => {
    if (!containerRef.current) return;
    
    let disposed = false;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const { BaseDashboard } = await import('@pebbledash/renderer-dom');
      if (disposed) return;

      const dashboard = new BaseDashboard({
        container: containerRef.current!,
        defaults,
        initialLayout,
        features,
        resizeConfig,
        widgets,
        onTileClick: (tileId, event) => callbacksRef.current.onTileClick?.(tileId, event),
        onTileDoubleClick: (tileId, event) => callbacksRef.current.onTileDoubleClick?.(tileId, event),
        onTileHover: (tileId, entering, event) => callbacksRef.current.onTileHover?.(tileId, entering, event),
        onTileFocus: (tileId, focused) => callbacksRef.current.onTileFocus?.(tileId, focused),
        onTileContextMenu: (tileId, event) => callbacksRef.current.onTileContextMenu?.(tileId, event),
        onHistoryChange: (undo, redo) => {
          setCanUndo(undo);
          setCanRedo(redo);
          callbacksRef.current.onHistoryChange?.(undo, redo);
        },
        onModeChange: (newMode, prevMode) => {
          setModeState(newMode);
          callbacksRef.current.onModeChange?.(newMode, prevMode);
        },
        onContainerResize: (width, height) => {
          callbacksRef.current.onContainerResize?.(width, height);
        },
        onResizeStart: (tileId, edge) => callbacksRef.current.onResizeStart?.(tileId, edge),
        onResizeMove: (tileId, edge, delta, clamped) => callbacksRef.current.onResizeMove?.(tileId, edge, delta, clamped),
        onResizeEnd: (tileId, edge, committed) => callbacksRef.current.onResizeEnd?.(tileId, edge, committed),
      });

      await dashboard.mount();
      if (disposed) {
        dashboard.unmount();
        return;
      }

      dashboardRef.current = dashboard;
      modelRef.current = dashboard.getModel();

      // Set up model subscription for tile changes
      const model = dashboard.getModel();
      unsubscribe = model.subscribe(() => {
        const newTiles = model.getState().toArray();
        setTiles(newTiles);
        callbacksRef.current.onTilesChange?.(newTiles);
      });

      // Initial state
      setTiles(model.getState().toArray());
      setCanUndo(model.canUndo());
      setCanRedo(model.canRedo());
      setIsReady(true);

      // Notify ready
      callbacksRef.current.onReady?.(api);
    })();

    return () => {
      disposed = true;
      unsubscribe?.();
      dashboardRef.current?.unmount();
      dashboardRef.current = null;
      modelRef.current = null;
      setIsReady(false);
    };
  }, []); // Empty deps - only mount once

  // Update widgets when they change
  useEffect(() => {
    // Widgets are passed during mount, can't hot-swap easily
    // This would require re-mounting which we avoid for stability
  }, [widgets]);

  // Set mode handler for context
  const setMode = useCallback((newMode: 'insert' | 'resize') => {
    dashboardRef.current?.setMode(newMode);
    setModeState(newMode);
  }, []);

  // Context value
  const contextValue = useMemo(() => ({
    dashboard: isReady ? api : null,
    model: modelRef.current,
    mode,
    canUndo,
    canRedo,
    isReady,
    tiles,
    setMode,
  }), [api, mode, canUndo, canRedo, isReady, tiles, setMode]);

  const mergedStyle = useMemo(() => ({
    width: '100%',
    height: '100%',
    ...style,
  }), [style]);

  return (
    <InternalDashboardContext.Provider value={contextValue}>
      <div ref={containerRef} className={className} style={mergedStyle} />
    </InternalDashboardContext.Provider>
  );
});

