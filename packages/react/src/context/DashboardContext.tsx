import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { DashboardModel, Tile } from '@pebbledash/core';
import type { DashboardApi, DashboardContextValue, DashboardState } from '../types.js';

/**
 * Initial state for the dashboard context.
 */
const initialState: DashboardState = {
  dashboard: null,
  model: null,
  mode: 'insert',
  canUndo: false,
  canRedo: false,
  isReady: false,
  tiles: [],
};

/**
 * Context for sharing dashboard state across components.
 */
export const DashboardContext = createContext<DashboardContextValue | null>(null);

/**
 * Props for the DashboardProvider component.
 */
export interface DashboardProviderProps {
  children: ReactNode;
}

/**
 * Provider component for dashboard state.
 * Use this to wrap components that need access to the dashboard via hooks.
 */
export function DashboardProvider({ children }: DashboardProviderProps) {
  const [state, setState] = useState<DashboardState>(initialState);

  const setMode = useCallback((mode: 'insert' | 'resize') => {
    setState(prev => {
      if (prev.dashboard) {
        prev.dashboard.setMode(mode);
      }
      return { ...prev, mode };
    });
  }, []);

  const value = useMemo<DashboardContextValue>(() => ({
    ...state,
    setMode,
  }), [state, setMode]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

/**
 * Internal hook to update dashboard state.
 * Used by the Dashboard component to sync state with the provider.
 */
export function useDashboardStateUpdater() {
  const context = useContext(DashboardContext);
  
  const updateState = useCallback((_updates: Partial<DashboardState>) => {
    if (context) {
      // Context exists - this is a controlled scenario
      // The Dashboard component will call this but we can't update context from here
      // Instead, we rely on the Dashboard component managing its own state
    }
  }, [context]);

  return { context, updateState };
}

/**
 * Hook to access dashboard context.
 * Throws if used outside of a DashboardProvider.
 */
export function useDashboardContext(): DashboardContextValue {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
}

/**
 * Hook to optionally access dashboard context.
 * Returns null if used outside of a DashboardProvider.
 */
export function useDashboardContextOptional(): DashboardContextValue | null {
  return useContext(DashboardContext);
}

/**
 * Internal context for the Dashboard component to provide state to hooks
 * without requiring a separate Provider wrapper.
 */
export const InternalDashboardContext = createContext<{
  dashboard: DashboardApi | null;
  model: DashboardModel | null;
  mode: 'insert' | 'resize';
  canUndo: boolean;
  canRedo: boolean;
  isReady: boolean;
  tiles: Tile[];
  setMode: (mode: 'insert' | 'resize') => void;
} | null>(null);

/**
 * Hook to access the internal dashboard context (from Dashboard component).
 */
export function useInternalDashboardContext() {
  return useContext(InternalDashboardContext);
}

