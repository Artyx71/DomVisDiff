import React from 'react';
import { DomTreeNode } from '../../lib/parseHtmlToTree';
import { X } from 'lucide-react';

interface SidebarProps {
    node: DomTreeNode | null;
    onClose: () => void;
}

export default function NodeSidebar({ node, onClose }: SidebarProps) {
    if (!node) return null;

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
                    <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider ${node.status === 'added' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                            node.status === 'removed' ? 'bg-red-500/20 text-red-500 border border-red-500/20' :
                                node.status === 'modified' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20' :
                                    'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}>
                        {node.status || 'unchanged'}
                    </span>
                </div>

                <div>
                    <h4 className="text-[10px] tracking-wider uppercase text-zinc-500 font-bold mb-3">Attributes</h4>
                    {Object.keys(node.attributes).length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {Object.entries(node.attributes).map(([key, value]) => (
                                <div key={key} className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50 break-all group hover:border-zinc-700 transition-colors">
                                    <div className="text-accent text-xs mb-1 font-mono font-semibold">{key}</div>
                                    <div className="text-zinc-300 text-sm font-mono leading-relaxed">"{value}"</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-500 italic bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">No attributes</p>
                    )}
                </div>

                {node.textContent && (
                    <div>
                        <h4 className="text-[10px] tracking-wider uppercase text-zinc-500 font-bold mb-3">Text Content</h4>
                        <div className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50 text-sm text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto relative">
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
