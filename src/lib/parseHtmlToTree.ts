export type DiffStatus = 'added' | 'removed' | 'modified' | 'unchanged';

export interface DomTreeNode {
    id: string; // unique ID for React Flow
    tag: string; // e.g., 'div'
    attributes: Record<string, string>;
    children: DomTreeNode[];
    status?: DiffStatus;
    textContent?: string;
    path: string; // Structural path
}

let idCounter = 0;

export function parseHtmlToTree(html: string): DomTreeNode | null {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    idCounter = 0;

    if (!doc.body || doc.body.children.length === 0) {
        return null;
    }

    return buildTree(doc.body, "root");
}

function buildTree(node: Element, currentPath: string): DomTreeNode {
    const attributes: Record<string, string> = {};
    for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        attributes[attr.name] = attr.value;
    }

    const children: DomTreeNode[] = [];
    let childIndex = 0;
    let textContent = "";

    for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (child.nodeType === Node.ELEMENT_NODE) {
            children.push(buildTree(child as Element, `${currentPath}/${childIndex}`));
            childIndex++;
        } else if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent?.trim();
            if (text) {
                textContent += text + " ";
            }
        }
    }

    return {
        id: `node-${++idCounter}`,
        tag: node.tagName.toLowerCase(),
        attributes,
        children,
        textContent: textContent.trim() || undefined,
        path: currentPath,
        status: 'unchanged' // Default status
    };
}
