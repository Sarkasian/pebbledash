# Redistribute Mode Specification

## Overview

Redistribute mode is activated by holding **Shift** while dragging a tile edge. It allows a tile to expand into a neighbor's space, with the neighbor shrinking orthogonally to make room.

## Layout Example

```
+-------+-------+
|       |   B   |
|   A   +-------+
|       |   C   |
+-------+-------+
```

- A: Full-height left column (x=0-50, y=0-100)
- B: Top-right tile (x=50-100, y=0-50)
- C: Bottom-right tile (x=50-100, y=50-100)

When Shift+dragging the edge between A and B (with cursor over B's portion):

## The Four Scenarios

### Direction 1: EXPANDING (drag edge LEFT, B grows into A's space)

When B expands left:
- B grows horizontally (takes A's horizontal space)
- A shrinks orthogonally (vertically) to make room
- B also expands vertically to fill the gap A left

**Scenario 1: Expand + Gap Too Small**
- B has expanded far enough that the remaining gap is smaller than minimum tile size
- **Behavior**: B **SNAPS** to full expansion (auto-completes)
- Ghost tile: None (gap eliminated)
- On release: Commit the full layout

**Scenario 2: Expand + Valid Gap**
- B has partially expanded, gap is large enough for a new tile
- **Behavior**: Show valid ghost tile in the gap
- Ghost tile: Semi-transparent, normal color
- On release: Create new tile at ghost position

```
Scenario 2 Result:
+---------------+
|       B       |  ← B expanded to full width
+-------+-------+
|   A   | ghost |  ← A shrunk, ghost in gap
+-------+-------+
        ↑ gap where new tile will be created
```

### Direction 2: SHRINKING (drag edge RIGHT, B gets smaller)

When B shrinks (edge moves right, B loses space on its left side):
- B shrinks horizontally
- A gap opens up on B's left side (where B used to be)

**Scenario 3: Shrink + Gap Too Small**
- B has shrunk, but the gap created is smaller than minimum tile size
- **Behavior**: Show **RED ghost** tile (invalid)
- Ghost tile: Red/invalid color indicating it's too small
- On release: **REVERT** to original layout (no changes committed)

**Scenario 4: Shrink + Valid Gap**
- B has shrunk, gap is large enough for a new tile
- **Behavior**: Show valid ghost tile in the gap
- Ghost tile: Semi-transparent, normal color
- On release: Create new tile at ghost position

```
Scenario 4 Result:
+-------+-------+-------+
|       | ghost |   B   |  ← B shrunk, ghost in vacated space
|   A   +-------+-------+
|       |       C       |
+-------+---------------+
```

## Key Behavioral Difference

| Direction | Invalid Gap Behavior |
|-----------|---------------------|
| Expanding | **SNAP** to full (auto-complete forward) |
| Shrinking | **REVERT** (don't auto-complete backward) |

This asymmetry exists because:
- When expanding, the user's intent is to make the tile bigger - snapping helps complete the action
- When shrinking, the user might not intend to create a tile - reverting is safer

## Implementation Notes

### Detecting Direction

- **Expanding**: Cursor has moved past the original edge position toward the neighbor
- **Shrinking**: Cursor has moved past the original edge position away from the neighbor

### Ghost Tile Position

- **Expanding**: Ghost is in the gap between current tile edge and full-snap position (in neighbor's vacated space)
- **Shrinking**: Ghost is in the gap between current tile edge and original position (in the tile's own vacated space)

### Role Locking

Once redistribute activates:
- The expanding tile ID is locked
- The shrinking tile ID is locked  
- The grow direction is locked
- These don't change even when cursor direction reverses

This ensures consistent behavior when the user drags back and forth.

