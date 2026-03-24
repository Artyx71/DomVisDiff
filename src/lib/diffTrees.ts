import { DomTreeNode, DiffStatus } from './parseHtmlToTree';

export function diffTrees(before: DomTreeNode | null, after: DomTreeNode | null): { before: DomTreeNode | null, after: DomTreeNode | null } {
    if (!before && !after) return { before: null, after: null };

    if (before && !after) {
        markSubTree(before, 'removed');
        return { before, after: null };
    }

    if (!before && after) {
        markSubTree(after, 'added');
        return { before: null, after };
    }

    const b = before!;
    const a = after!;

    const isTagSame = b.tag === a.tag;
    const isTextSame = b.textContent === a.textContent;
    const attrsChanged = attributesChanged(b.attributes, a.attributes);

    let isModified = !isTagSame || !isTextSame || attrsChanged;

    const bChildren = b.children || [];
    const aChildren = a.children || [];

    const maxLen = Math.max(bChildren.length, aChildren.length);
    const diffedBChildren: DomTreeNode[] = [];
    const diffedAChildren: DomTreeNode[] = [];

    let childrenChanged = false;

    for (let i = 0; i < maxLen; i++) {
        const bNode = i < bChildren.length ? bChildren[i] : null;
        const aNode = i < aChildren.length ? aChildren[i] : null;

        const { before: resB, after: resA } = diffTrees(bNode, aNode);
        if (resB) diffedBChildren.push(resB);
        if (resA) diffedAChildren.push(resA);

        if ((resB && resB.status !== 'unchanged') || (resA && resA.status !== 'unchanged')) {
            childrenChanged = true;
        }
    }

    if (childrenChanged) {
        isModified = true;
    }

    const finalStatus = isModified ? 'modified' : 'unchanged';
    b.status = isTagSame ? finalStatus : 'removed';
    a.status = isTagSame ? finalStatus : 'added';

    b.children = diffedBChildren;
    a.children = diffedAChildren;

    return { before: b, after: a };
}

function attributesChanged(attr1: Record<string, string>, attr2: Record<string, string>): boolean {
    const keys1 = Object.keys(attr1);
    const keys2 = Object.keys(attr2);
    if (keys1.length !== keys2.length) return true;
    for (const k of keys1) {
        if (attr1[k] !== attr2[k]) return true;
    }
    return false;
}

function markSubTree(node: DomTreeNode, status: DiffStatus) {
    node.status = status;
    for (let i = 0; i < node.children.length; i++) {
        markSubTree(node.children[i], status);
    }
}
