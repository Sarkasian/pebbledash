import type { TileId } from '../index.js';
import {
  EPSILON,
  adjacent,
  area,
  bottom,
  overlaps,
  right,
  withinBounds,
} from '../utils/geometry.js';

/**
 * Per-tile constraint overrides for size and behavior.
 */
export interface TileConstraints {
  /** Minimum tile width as percentage */
  minWidth?: number;
  /** Minimum tile height as percentage */
  minHeight?: number;
  /** Maximum tile width as percentage */
  maxWidth?: number;
  /** Maximum tile height as percentage */
  maxHeight?: number;
  /** Aspect ratio constraint (width/height), null for no constraint */
  aspectRatio?: number | null;
  /** Zones that cannot be resized (edges that are locked) */
  lockedZones?: Array<'top' | 'bottom' | 'left' | 'right'>;
}

/**
 * Initialization options for creating a Tile.
 */
export interface TileInit {
  /** Unique identifier for the tile */
  id: TileId;
  /** X coordinate (0-100 percent) */
  x: number;
  /** Y coordinate (0-100 percent) */
  y: number;
  /** Width (0-100 percent) */
  width: number;
  /** Height (0-100 percent) */
  height: number;
  /** Whether the tile is locked from modifications */
  locked?: boolean;
  /** Custom metadata for the tile */
  meta?: Record<string, unknown>;
  /** Per-tile constraint overrides */
  constraints?: TileConstraints;
}

/**
 * Represents a single tile in the dashboard layout.
 *
 * Tiles are immutable - all modification methods return new Tile instances.
 * Coordinates and dimensions are expressed as percentages (0-100) of the container.
 *
 * @example
 * ```typescript
 * const tile = new Tile({
 *   id: 'tile-1' as TileId,
 *   x: 0,
 *   y: 0,
 *   width: 50,
 *   height: 100
 * });
 *
 * // Create a modified copy
 * const moved = tile.move(10, 0);
 * ```
 */
export class Tile {
  readonly id: TileId;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly locked: boolean;
  readonly meta?: Record<string, unknown>;
  readonly constraints?: TileConstraints;

  /**
   * Creates a new Tile instance.
   * @param init - Initialization options for the tile
   * @throws Error if coordinates are not finite numbers
   * @throws Error if width/height is not positive
   * @throws Error if tile is outside [0,100] bounds
   */
  constructor(init: TileInit) {
    validateTile(init);
    this.id = init.id;
    this.x = init.x;
    this.y = init.y;
    this.width = init.width;
    this.height = init.height;
    this.locked = Boolean(init.locked);
    this.meta = init.meta ? { ...init.meta } : undefined;
    this.constraints = init.constraints ? { ...init.constraints } : undefined;
    Object.freeze(this);
  }

  /** Right edge position (x + width) */
  get right(): number {
    return right(this);
  }

  /** Bottom edge position (y + height) */
  get bottom(): number {
    return bottom(this);
  }

  /** Area of the tile (width * height) */
  get area(): number {
    return area(this);
  }

  /**
   * Creates a new Tile with the specified properties changed.
   * @param patch - Properties to change
   * @returns A new Tile instance with the changes applied
   */
  with(patch: Partial<Omit<TileInit, 'id'>>): Tile {
    return new Tile({
      id: this.id,
      x: patch.x ?? this.x,
      y: patch.y ?? this.y,
      width: patch.width ?? this.width,
      height: patch.height ?? this.height,
      locked: patch.locked ?? this.locked,
      meta: patch.meta ?? this.meta,
      constraints: patch.constraints ?? this.constraints,
    });
  }

  /**
   * Creates a new Tile moved by the specified delta.
   * @param dx - Change in x position
   * @param dy - Change in y position
   * @returns A new Tile at the new position
   */
  move(dx: number, dy: number): Tile {
    return this.with({ x: this.x + dx, y: this.y + dy });
  }

  /**
   * Creates a new Tile with the specified dimensions.
   * @param width - New width
   * @param height - New height
   * @returns A new Tile with the new dimensions
   */
  resize(width: number, height: number): Tile {
    return this.with({ width, height });
  }

  /**
   * Checks if this tile overlaps with another tile.
   * @param other - The other tile to check against
   * @returns True if the tiles overlap
   */
  overlaps(other: Tile): boolean {
    return overlaps(this, other);
  }

  /**
   * Checks if this tile is adjacent to another tile (shares an edge).
   * @param other - The other tile to check against
   * @returns True if the tiles share an edge
   */
  isAdjacentTo(other: Tile): boolean {
    return adjacent(this, other);
  }
}

/**
 * Validates tile initialization parameters.
 * @param init - The tile initialization options to validate
 * @throws Error if validation fails
 */
export function validateTile(init: TileInit): void {
  if (
    !Number.isFinite(init.x) ||
    !Number.isFinite(init.y) ||
    !Number.isFinite(init.width) ||
    !Number.isFinite(init.height)
  ) {
    throw new Error('Tile coordinates must be finite numbers');
  }
  if (init.width <= EPSILON || init.height <= EPSILON) {
    throw new Error('Tile width/height must be positive');
  }
  if (!withinBounds(init)) {
    throw new Error('Tile must be within [0,100] bounds');
  }
}
