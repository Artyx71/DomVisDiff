import type { DomTreeNode, DiffStatus } from './parseHtmlToTree';

export function diffTrees(
    before: DomTreeNode | null,
    after: DomTreeNode | null
): { before: DomTreeNode | null; after: DomTreeNode | null } {
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

    if (b.tag !== a.tag) {
        markSubTree(b, 'removed');
        markSubTree(a, 'added');
        return { before: b, after: a };
    }

    const attrsChanged = attributesChanged(b.attributes, a.attributes);
    const textChanged = b.textContent !== a.textContent;

    const { pairedBefore, pairedAfter, childrenChanged } = diffChildren(b.children, a.children);

    const isModified = attrsChanged || textChanged || childrenChanged;
    b.status = isModified ? 'modified' : 'unchanged';
    a.status = isModified ? 'modified' : 'unchanged';

    b.children = pairedBefore;
    a.children = pairedAfter;

    return { before: b, after: a };
}

// LCS-based children matching by tag similarity score
function diffChildren(
    bChildren: DomTreeNode[],
    aChildren: DomTreeNode[]
): { pairedBefore: DomTreeNode[]; pairedAfter: DomTreeNode[]; childrenChanged: boolean } {
    if (bChildren.length === 0 && aChildren.length === 0) {
        return { pairedBefore: [], pairedAfter: [], childrenChanged: false };
    }

    // Build LCS table using tag equality as match criterion
    const m = bChildren.length;
    const n = aChildren.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = bChildren[i - 1].tag === aChildren[j - 1].tag
                ? dp[i - 1][j - 1] + 1
                : Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
    }

    // Backtrack to get pairs
    type Pair = { b: number | null; a: number | null };
    const pairs: Pair[] = [];
    let i = m, j = n;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && bChildren[i - 1].tag === aChildren[j - 1].tag) {
            pairs.push({ b: i - 1, a: j - 1 });
            i--; j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            pairs.push({ b: null, a: j - 1 });
            j--;
        } else {
            pairs.push({ b: i - 1, a: null });
            i--;
        }
    }

    pairs.reverse();

    const pairedBefore: DomTreeNode[] = [];
    const pairedAfter: DomTreeNode[] = [];
    let childrenChanged = false;

    for (const pair of pairs) {
        if (pair.b !== null && pair.a !== null) {
            const { before: rb, after: ra } = diffTrees(bChildren[pair.b], aChildren[pair.a]);
            if (rb) pairedBefore.push(rb);
            if (ra) pairedAfter.push(ra);
            if ((rb && rb.status !== 'unchanged') || (ra && ra.status !== 'unchanged')) {
                childrenChanged = true;
            }
        } else if (pair.b !== null) {
            markSubTree(bChildren[pair.b], 'removed');
            pairedBefore.push(bChildren[pair.b]);
            childrenChanged = true;
        } else if (pair.a !== null) {
            markSubTree(aChildren[pair.a], 'added');
            pairedAfter.push(aChildren[pair.a]);
            childrenChanged = true;
        }
    }

    return { pairedBefore, pairedAfter, childrenChanged };
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
