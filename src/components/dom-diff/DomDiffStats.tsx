import type { DomTreeNode } from '../../lib/parseHtmlToTree';

interface DomDiffStatsProps {
    before: DomTreeNode | null;
    after: DomTreeNode | null;
}

interface Counts {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
}

function countNodes(node: DomTreeNode | null, counts: Counts) {
    if (!node) return;
    const s = node.status ?? 'unchanged';
    counts[s as keyof Counts]++;
    node.children.forEach(c => countNodes(c, counts));
}

export default function DomDiffStats({ before, after }: DomDiffStatsProps) {
    const counts: Counts = { added: 0, removed: 0, modified: 0, unchanged: 0 };
    countNodes(before, counts);
    countNodes(after, counts);
    // added/removed appear in only one tree, modified+unchanged appear in both — dedupe
    counts.modified = Math.round(counts.modified / 2);
    counts.unchanged = Math.round(counts.unchanged / 2);

    const total = counts.added + counts.removed + counts.modified + counts.unchanged;

    const items = [
        { label: 'Added', count: counts.added, color: 'text-emerald-400', dot: 'bg-emerald-500' },
        { label: 'Removed', count: counts.removed, color: 'text-red-400', dot: 'bg-red-500' },
        { label: 'Modified', count: counts.modified, color: 'text-yellow-400', dot: 'bg-yellow-500' },
        { label: 'Unchanged', count: counts.unchanged, color: 'text-zinc-400', dot: 'bg-zinc-600' },
    ];

    return (
        <div className="flex items-center gap-5 px-4 py-2.5 bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl text-xs font-bold shadow-2xl">
            {items.map(({ label, count, color, dot }) => (
                <div key={label} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    <span className={color}>{count}</span>
                    <span className="text-zinc-600">{label}</span>
                </div>
            ))}
            <div className="w-px h-4 bg-zinc-800 mx-1" />
            <span className="text-zinc-500">{total} nodes</span>
        </div>
    );
}
