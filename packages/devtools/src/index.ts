import type { Tile, DecisionResult } from '@pebbledash/core';

/**
 * Sample of dashboard state at a point in time.
 */
export interface StateSample {
  /** Operation that triggered this sample */
  op: string;
  /** Current state version */
  version: number;
  /** Array of tiles */
  tiles: Tile[];
  /** Timestamp when sample was taken */
  timestamp?: number;
}

/**
 * Adapter interface for instrumentation and debugging.
 * Implement this interface to create custom adapters for logging,
 * telemetry, or debugging tools.
 */
export interface DevToolsAdapter {
  /** Called on each state change */
  onStateSample(sample: StateSample): void;
  
  /** Called when a decision is made by the engine */
  onDecisionSpan(result: DecisionResult): void;
  
  /** Called on errors (optional) */
  onError?(error: Error, context?: Record<string, unknown>): void;
}

/**
 * Log level for console adapter output.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Options for the console adapter.
 */
export interface ConsoleAdapterOptions {
  /** Enable logging output. Defaults to true in development, false in production. */
  enabled?: boolean;
  /** Prefix for log messages. Defaults to '[dashboard]'. */
  prefix?: string;
  /** Log level for output. Defaults to 'debug'. */
  logLevel?: LogLevel;
}

/**
 * Get the appropriate console method for a log level.
 */
function getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
  switch (level) {
    case 'debug':
      return console.debug.bind(console);
    case 'info':
      return console.info.bind(console);
    case 'warn':
      return console.warn.bind(console);
    case 'error':
      return console.error.bind(console);
    default:
      return console.log.bind(console);
  }
}

/**
 * Format a decision result for console output.
 */
function formatDecision(result: DecisionResult): string {
  const status = result.valid ? 'allowed' : 'blocked';
  const violations = result.violations?.length
    ? ` (${result.violations.map(v => v.code).join(', ')})`
    : '';
  return `decision → ${status}${violations}`;
}

/**
 * Create a console adapter for development debugging.
 * Logs state samples and decisions to the browser/Node console.
 * 
 * @param options - Configuration options
 * @returns DevToolsAdapter implementation
 * 
 * @example
 * ```ts
 * const dev = createConsoleAdapter({ prefix: '[my-app]' });
 * 
 * model.subscribe(({ op, state, version }) => {
 *   dev.onStateSample({ op, version, tiles: state.toArray() });
 * });
 * 
 * model.lifecycle.on('interaction:committed', ({ result }) => {
 *   dev.onDecisionSpan(result);
 * });
 * ```
 */
export function createConsoleAdapter(options?: ConsoleAdapterOptions): DevToolsAdapter {
  const enabled = options?.enabled ?? (
    typeof process !== 'undefined' 
      ? process.env.NODE_ENV !== 'production'
      : true
  );
  const prefix = options?.prefix ?? '[dashboard]';
  const logLevel = options?.logLevel ?? 'debug';
  const log = getConsoleMethod(logLevel);

  return {
    onStateSample(sample: StateSample): void {
      if (!enabled) return;
      const timestamp = sample.timestamp ? new Date(sample.timestamp).toISOString() : '';
      log(
        `${prefix} State sample: op=${sample.op}, version=${sample.version}, tiles=${sample.tiles.length}`,
        timestamp ? `@ ${timestamp}` : ''
      );
    },

    onDecisionSpan(result: DecisionResult): void {
      if (!enabled) return;
      log(`${prefix} Decision: ${formatDecision(result)}`);
    },

    onError(error: Error, context?: Record<string, unknown>): void {
      if (!enabled) return;
      console.error(`${prefix} Error:`, error.message, context ?? '');
    },
  };
}

/**
 * Create a no-op adapter that discards all events.
 * Useful for production builds or when instrumentation is disabled.
 * 
 * @returns DevToolsAdapter that does nothing
 */
export function createNoopAdapter(): DevToolsAdapter {
  return {
    onStateSample(): void {},
    onDecisionSpan(): void {},
    onError(): void {},
  };
}

/**
 * Create an adapter that buffers events and flushes them periodically.
 * Useful for batching events before sending to a backend.
 * 
 * @param options - Configuration options
 * @returns DevToolsAdapter with flush capability
 * 
 * @example
 * ```ts
 * const adapter = createBufferedAdapter({
 *   onFlush: (samples, decisions) => {
 *     fetch('/api/telemetry', {
 *       method: 'POST',
 *       body: JSON.stringify({ samples, decisions }),
 *     });
 *   },
 *   flushIntervalMs: 5000,
 *   maxBufferSize: 100,
 * });
 * ```
 */
export function createBufferedAdapter(options: {
  /** Called when buffer is flushed */
  onFlush: (samples: StateSample[], decisions: DecisionResult[]) => void;
  /** Interval between flushes in milliseconds. Default: 5000 */
  flushIntervalMs?: number;
  /** Maximum buffer size before forced flush. Default: 100 */
  maxBufferSize?: number;
  /** Called on errors */
  onError?: (error: Error, context?: Record<string, unknown>) => void;
}): DevToolsAdapter & { flush: () => void; cleanup: () => void } {
  const flushInterval = options.flushIntervalMs ?? 5000;
  const maxSize = options.maxBufferSize ?? 100;
  
  let sampleBuffer: StateSample[] = [];
  let decisionBuffer: DecisionResult[] = [];
  
  const flush = (): void => {
    if (sampleBuffer.length === 0 && decisionBuffer.length === 0) return;
    options.onFlush([...sampleBuffer], [...decisionBuffer]);
    sampleBuffer = [];
    decisionBuffer = [];
  };
  
  const intervalId = setInterval(flush, flushInterval);
  
  return {
    onStateSample(sample: StateSample): void {
      sampleBuffer.push({ ...sample, timestamp: sample.timestamp ?? Date.now() });
      if (sampleBuffer.length >= maxSize) {
        flush();
      }
    },
    
    onDecisionSpan(result: DecisionResult): void {
      decisionBuffer.push(result);
      if (decisionBuffer.length >= maxSize) {
        flush();
      }
    },
    
    onError(error: Error, context?: Record<string, unknown>): void {
      options.onError?.(error, context);
    },
    
    flush,
    
    cleanup(): void {
      clearInterval(intervalId);
      flush();
    },
  };
}

// Legacy alias for backwards compatibility
export { DevToolsAdapter as InstrumentationAdapter };
