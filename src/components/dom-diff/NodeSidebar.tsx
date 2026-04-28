import type { DomTreeNode } from '../../lib/parseHtmlToTree';
import { X } from 'lucide-react';

interface SidebarProps {
    before: DomTreeNode | null;
    after: DomTreeNode | null;
    onClose: () => void;
}

const statusStyle: Record<string, string> = {
    added: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20',
    removed: 'bg-red-500/20 text-red-500 border border-red-500/20',
    modified: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20',
    unchanged: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
};

function AttrTable({ attrs, changedKeys, side }: {
    attrs: Record<string, string>;
    changedKeys: Set<string>;
    side: 'before' | 'after';
}) {
    const keys = Object.keys(attrs);
    if (keys.length === 0) return <p className="text-sm text-zinc-500 italic bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">No attributes</p>;

    return (
        <div className="flex flex-col gap-1.5">
            {keys.map(key => {
                const changed = changedKeys.has(key);
                return (
                    <div key={key} className={`bg-zinc-950/50 p-2.5 rounded-lg border break-all ${changed
                        ? side === 'before' ? 'border-red-500/30 bg-red-500/5' : 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-zinc-800/50'
                        }`}>
                        <div className="text-accent text-xs mb-1 font-mono font-semibold">{key}</div>
                        <div className={`text-sm font-mono leading-relaxed ${changed
                            ? side === 'before' ? 'text-red-400' : 'text-emerald-400'
                            : 'text-zinc-300'
                            }`}>"{attrs[key]}"</div>
                    </div>
                );
            })}
        </div>
    );
}

export default function NodeSidebar({ before, after, onClose }: SidebarProps) {
    const node = after ?? before;
    if (!node) return null;

    const isModified = node.status === 'modified' && before && after;

    const changedKeys = new Set<string>();
    if (isModified && before && after) {
        const allKeys = new Set([...Object.keys(before.attributes), ...Object.keys(after.attributes)]);
        allKeys.forEach(k => {
            if (before.attributes[k] !== after.attributes[k]) changedKeys.add(k);
        });
    }

    return (
        <div className="absolute top-0 right-0 h-full w-80 bg-zinc-900/95 backdrop-blur border-l border-zinc-800 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right-8 duration-300">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
                <h3 className="font-bold text-xl font-mono text-accent">&lt;{node.tag}&gt;</h3>
                <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-zinc-800">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
                <div>
                    <h4 className="text-[10px] tracking-wider uppercase text-zinc-500 font-bold mb-3">Status</h4>
                    <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider ${statusStyle[node.status ?? 'unchanged']}`}>
                        {node.status ?? 'unchanged'}
                    </span>
                </div>

                <div>
                    <h4 className="text-[10px] tracking-wider uppercase text-zinc-500 font-bold mb-3">
                        Attributes{isModified && changedKeys.size > 0 && <span className="ml-2 normal-case text-yellow-500/80">{changedKeys.size} changed</span>}
                    </h4>

                    {isModified && before && after ? (
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <div className="text-[9px] uppercase tracking-wider text-red-400/70 font-bold mb-1.5">Before</div>
                                <AttrTable attrs={before.attributes} changedKeys={changedKeys} side="before" />
                            </div>
                            <div>
                                <div className="text-[9px] uppercase tracking-wider text-emerald-400/70 font-bold mb-1.5">After</div>
                                <AttrTable attrs={after.attributes} changedKeys={changedKeys} side="after" />
                            </div>
                        </div>
                    ) : (
                        <AttrTable attrs={node.attributes} changedKeys={new Set()} side="after" />
                    )}
                </div>

                {isModified && before && after && before.textContent !== after.textContent && (
                    <div>
                        <h4 className="text-[10px] tracking-wider uppercase text-zinc-500 font-bold mb-3">Text Content</h4>
                        <div className="flex flex-col gap-1.5">
                            {before.textContent && (
                                <div className="bg-red-500/5 p-2.5 rounded-lg border border-red-500/20 text-sm text-red-400 font-mono whitespace-pre-wrap leading-relaxed max-h-28 overflow-y-auto">
                                    <div className="text-[9px] uppercase tracking-wider text-red-400/60 font-bold mb-1">Before</div>
                                    {before.textContent}
                                </div>
                            )}
                            {after.textContent && (
                                <div className="bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/20 text-sm text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed max-h-28 overflow-y-auto">
                                    <div className="text-[9px] uppercase tracking-wider text-emerald-400/60 font-bold mb-1">After</div>
                                    {after.textContent}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!isModified && node.textContent && (
                    <div>
                        <h4 className="text-[10px] tracking-wider uppercase text-zinc-500 font-bold mb-3">Text Content</h4>
                        <div className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50 text-sm text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                            {node.textContent}
                        </div>
                    </div>
                )}

                <div>
                    <h4 className="text-[10px] tracking-wider uppercase text-zinc-500 font-bold mb-3">Internal Path</h4>
                    <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-800/50 text-xs text-zinc-400 font-mono select-all">
                        {node.path}
                    </div>
                </div>
            </div>
        </div>
    );
}
