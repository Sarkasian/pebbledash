# Decision Engine Logic Tree

Auto-generated report of decision engine constraints and logic flow.

## Operation: `split`

### Logic Flow
- **Sequence** (All must pass)
  - 🔍 Condition: `TileExists`
  - 🔍 Condition: `NotLocked`

### Visual Graph
```mermaid
graph TD
node_0{{"Sequence\n(AND)"}}
node_1("? TileExists")
node_0 --> node_1
node_2("? NotLocked")
node_0 --> node_2
```

---

## Operation: `delete`

### Logic Flow
- **Sequence** (All must pass)
  - 🔍 Condition: `TileExists`
  - 🔍 Condition: `NotLocked`
  - 🔍 Condition: `NotOnlyTile`
  - 🔍 Condition: `GroupPolicyAllowsDelete`
  - 🔍 Condition: `FullSpanSeamAvailable`
  - 🔍 Condition: `ResizableNeighborAvailable`

### Visual Graph
```mermaid
graph TD
node_0{{"Sequence\n(AND)"}}
node_1("? TileExists")
node_0 --> node_1
node_2("? NotLocked")
node_0 --> node_2
node_3("? NotOnlyTile")
node_0 --> node_3
node_4("? GroupPolicyAllowsDelete")
node_0 --> node_4
node_5("? FullSpanSeamAvailable")
node_0 --> node_5
node_6("? ResizableNeighborAvailable")
node_0 --> node_6
```

---

## Operation: `insert`

### Logic Flow
- **Sequence** (All must pass)
  - 🔍 Condition: `TileExists`
  - 🔍 Condition: `NotLocked`

### Visual Graph
```mermaid
graph TD
node_0{{"Sequence\n(AND)"}}
node_1("? TileExists")
node_0 --> node_1
node_2("? NotLocked")
node_0 --> node_2
```

---

## Operation: `resize`

### Logic Flow
- **Sequence** (All must pass)
  - 🔍 Condition: `TileExists`
  - 🔍 Condition: `NotLocked`

### Visual Graph
```mermaid
graph TD
node_0{{"Sequence\n(AND)"}}
node_1("? TileExists")
node_0 --> node_1
node_2("? NotLocked")
node_0 --> node_2
```

---

## Operation: `validate`

### Logic Flow
- **Sequence** (All must pass)
  - 🔍 Condition: `BoundsValid`
  - 🔍 Condition: `CoverageTight`
  - 🔍 Condition: `MinTileSizeAll`

### Visual Graph
```mermaid
graph TD
node_0{{"Sequence\n(AND)"}}
node_1("? BoundsValid")
node_0 --> node_1
node_2("? CoverageTight")
node_0 --> node_2
node_3("? MinTileSizeAll")
node_0 --> node_3
```

---

## Operation: `seam:resize`

### Logic Flow
- **Sequence** (All must pass)
  - 🔍 Condition: `SeamChainCovered`

### Visual Graph
```mermaid
graph TD
node_0{{"Sequence\n(AND)"}}
node_1("? SeamChainCovered")
node_0 --> node_1
```

---

## Operation: `interaction:hoverEdge`

### Logic Flow
- **Sequence** (All must pass)
  - *AnonymousNode*
  - ⚡ Action

### Visual Graph
```mermaid
graph TD
node_0{{"Sequence\n(AND)"}}
node_1["AnonymousNode"]
node_0 --> node_1
node_2>"Action"]
node_0 --> node_2
```

---

## Operation: `interaction:keyTab`

### Logic Flow
- **Sequence** (All must pass)
  - ⚡ Action

### Visual Graph
```mermaid
graph TD
node_0{{"Sequence\n(AND)"}}
node_1>"Action"]
node_0 --> node_1
```

---

## Operation: `interaction:commit`

### Logic Flow
- **Sequence** (All must pass)
  - ⚡ Action

### Visual Graph
```mermaid
graph TD
node_0{{"Sequence\n(AND)"}}
node_1>"Action"]
node_0 --> node_1
```

---

## Operation: `interaction:hoverEnd`

### Logic Flow
- **Sequence** (All must pass)
  - ⚡ Action

### Visual Graph
```mermaid
graph TD
node_0{{"Sequence\n(AND)"}}
node_1>"Action"]
node_0 --> node_1
```

---

