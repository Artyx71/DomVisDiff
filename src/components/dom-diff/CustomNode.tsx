import { Handle, Position } from '@xyflow/react';
import type { DomTreeNode } from '../../lib/parseHtmlToTree';
import { cn } from '../../lib/cn';

export default function CustomNode({ data }: { data: { node: DomTreeNode } }) {
    const { node } = data;
    const statusColors: Record<string, string> = {
        added: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400',
        removed: 'bg-red-500/10 border-red-500/50 text-red-500',
        modified: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500',
        unchanged: 'bg-zinc-800 border-zinc-700 text-zinc-300'
    };

    const statusColor = node.status ? statusColors[node.status] : statusColors.unchanged;

    return (
        <div className={cn("px-4 py-3 rounded-lg border-2 shadow-lg min-w-[200px] backdrop-blur-sm transition-all hover:shadow-xl", statusColor)}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-zinc-500 !border-2 !border-zinc-900" />

            <div className="flex flex-col">
                <div className="font-mono font-bold text-base tracking-wide flex items-center justify-between">
                    <span>&lt;{node.tag}&gt;</span>
                    {node.children && node.children.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 opacity-70">
                            {node.children.length} kids
                        </span>
                    )}
                </div>
                {node.attributes['class'] && (
                    <div className="text-xs opacity-90 mt-2 truncate w-full" title={node.attributes['class']}>
                        <span className="opacity-50">.</span>{node.attributes['class'].split(' ').join('.')}
                    </div>
                )}
                {node.attributes['id'] && (
                    <div className="text-xs opacity-90 mt-1 truncate w-full">
                        <span className="opacity-50">#</span>{node.attributes['id']}
                    </div>
                )}
                {node.textContent && node.textContent.length > 0 && (
                    <div className="text-xs opacity-70 mt-2 truncate w-full italic border-t border-white/10 pt-1">
                        "{node.textContent}"
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-zinc-500 !border-2 !border-zinc-900" />
        </div>
    );
}
