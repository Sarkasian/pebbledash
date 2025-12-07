import fs from 'node:fs';
import path from 'node:path';
import { DashboardModel } from '../packages/core/src/model/DashboardModel.js';
import {
  ConditionNode,
  SequenceNode,
  SelectorNode,
  ActionNode,
  type Node,
} from '../packages/core/src/decision-engine/nodes.js';

// Helper to safely get class name
function getTypeName(node: Node): string {
  const name = node.constructor.name;
  return name || 'AnonymousNode';
}

function getActionName(node: ActionNode): string {
  if (node.run && node.run.name) {
    return node.run.name;
  }
  return 'Action';
}

function renderNode(node: Node, depth: number = 0): string[] {
  const indent = '  '.repeat(depth);
  const lines: string[] = [];

  if (node instanceof SequenceNode) {
    lines.push(`${indent}- **Sequence** (All must pass)`);
    for (const child of node.children) {
      lines.push(...renderNode(child, depth + 1));
    }
  } else if (node instanceof SelectorNode) {
    lines.push(`${indent}- **Selector** (First to pass)`);
    for (const child of node.children) {
      lines.push(...renderNode(child, depth + 1));
    }
  } else if (node instanceof ConditionNode) {
    lines.push(`${indent}- 🔍 Condition: \`${node.label}\``);
  } else if (node instanceof ActionNode) {
    lines.push(`${indent}- ⚡ ${getActionName(node)}`);
  } else {
    // Handle anonymous or custom nodes
    if ((node as any).children && Array.isArray((node as any).children)) {
      lines.push(`${indent}- **${getTypeName(node)}**`);
      for (const child of (node as any).children) {
        lines.push(...renderNode(child, depth + 1));
      }
    } else {
      lines.push(`${indent}- *${getTypeName(node)}*`);
    }
  }
  return lines;
}

function generateMermaid(op: string, node: Node): string {
  let edges: string[] = [];
  let nodeIdCounter = 0;

  function traverse(n: Node, parentId: string | null) {
    const id = `node_${nodeIdCounter++}`;
    let label = '';
    let shapeStart = '[';
    let shapeEnd = ']';

    if (n instanceof SequenceNode) {
      label = 'Sequence\\n(AND)';
      shapeStart = '{{';
      shapeEnd = '}}';
    } else if (n instanceof SelectorNode) {
      label = 'Selector\\n(OR)';
      shapeStart = '{{';
      shapeEnd = '}}';
    } else if (n instanceof ConditionNode) {
      label = `? ${n.label}`;
      shapeStart = '(';
      shapeEnd = ')';
    } else if (n instanceof ActionNode) {
      label = getActionName(n);
      shapeStart = '>';
      shapeEnd = ']';
    } else {
      label = getTypeName(n);
    }

    // Sanitize label
    label = label.replace(/"/g, "'");

    const nodeDef = `${id}${shapeStart}"${label}"${shapeEnd}`;
    edges.push(`${nodeDef}`);
    if (parentId) {
      edges.push(`${parentId} --> ${id}`);
    }

    if (n instanceof SequenceNode || n instanceof SelectorNode) {
      for (const child of n.children) {
        traverse(child, id);
      }
    } else if ((n as any).children && Array.isArray((n as any).children)) {
      for (const child of (n as any).children) {
        traverse(child, id);
      }
    }
  }

  traverse(node, null);
  return `\`\`\`mermaid\ngraph TD\n${edges.join('\n')}\n\`\`\``;
}

async function main() {
  console.log('Initializing DashboardModel...');
  const model = new DashboardModel();
  const constraints = model.constraints;

  const entries = constraints.getEntries();
  console.log(`Found ${entries.length} registered operations.`);

  let output = '# Decision Engine Logic Tree\n\n';
  output += 'Auto-generated report of decision engine constraints and logic flow.\n\n';

  for (const [op, root] of entries) {
    console.log(`Processing ${op}...`);
    output += `## Operation: \`${op}\`\n\n`;

    output += '### Logic Flow\n';
    output += renderNode(root).join('\n');
    output += '\n\n';

    output += '### Visual Graph\n';
    output += generateMermaid(op, root);
    output += '\n\n---\n\n';
  }

  const outFile = path.join(process.cwd(), 'docs', 'decision_engine_tree.md');
  fs.writeFileSync(outFile, output);
  console.log(`Wrote report to ${outFile}`);
}

main().catch(console.error);
