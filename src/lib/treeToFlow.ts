import type { Node, Edge } from '@xyflow/react';
import type { DomTreeNode } from './parseHtmlToTree';

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;
const X_GAP = 40;
const Y_GAP = 100;

export function treeToFlow(root: DomTreeNode | null, startX = 0, startY = 0): { nodes: Node[], edges: Edge[] } {
    if (!root) return { nodes: [], edges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Recursive function that returns the total width of the subtree
    function traverse(node: DomTreeNode, depth: number, currentX: number): number {
        const y = startY + depth * (NODE_HEIGHT + Y_GAP);

        if (!node.children || node.children.length === 0) {
            nodes.push({
                id: node.id,
                type: 'domNode',
                position: { x: currentX, y },
                data: { node }
            });
            return NODE_WIDTH;
        }

        let nextX = currentX;
        let totalChildrenWidth = 0;
        const childPositions: number[] = [];

        for (const child of node.children) {
            const childWidth = traverse(child, depth + 1, nextX);
            childPositions.push(nextX + childWidth / 2);

            edges.push({
                id: `e-${node.id}-${child.id}`,
                source: node.id,
                target: child.id,
                type: 'smoothstep',
                animated: node.status === 'modified' || child.status === 'modified' || child.status === 'added' || child.status === 'removed',
                style: { stroke: getEdgeColor(child.status) }
            });

            nextX += childWidth + X_GAP;
            totalChildrenWidth += childWidth + X_GAP;
        }

        totalChildrenWidth -= X_GAP;

        const startChildX = childPositions[0] - NODE_WIDTH / 2;
        const endChildX = childPositions[childPositions.length - 1] + NODE_WIDTH / 2;
        const parentX = startChildX + (endChildX - startChildX) / 2 - NODE_WIDTH / 2;

        nodes.push({
            id: node.id,
            type: 'domNode',
            position: { x: parentX, y },
            data: { node }
        });

        return Math.max(NODE_WIDTH, totalChildrenWidth);
    }

    traverse(root, 0, startX);
    return { nodes, edges };
}

function getEdgeColor(status?: string) {
    switch (status) {
        case 'added': return '#2ecc71';
        case 'removed': return '#e74c3c';
        case 'modified': return '#f39c12';
        default: return '#3f3f46';
    }
}
