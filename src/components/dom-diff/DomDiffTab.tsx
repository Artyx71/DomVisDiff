import React, { useState, useCallback } from 'react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, BackgroundVariant, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { parseHtmlToTree, DomTreeNode } from '../../lib/parseHtmlToTree';
import { diffTrees } from '../../lib/diffTrees';
import { treeToFlow } from '../../lib/treeToFlow';
import CustomNode from './CustomNode';
import NodeSidebar from './NodeSidebar';
import { FileCode2, GitCompare, Code2 } from 'lucide-react';

const nodeTypes = {
    domNode: CustomNode,
};

export default function DomDiffTab() {
    const [beforeHtml, setBeforeHtml] = useState('<div class="header" id="main">\n  <h1 class="title">Hello</h1>\n</div>');
    const [afterHtml, setAfterHtml] = useState('<div class="header dark" id="main">\n  <h1 class="title">Hello World</h1>\n  <p class="subtitle">New intro</p>\n</div>');

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState<DomTreeNode | null>(null);

    const [hasCompared, setHasCompared] = useState(false);

    const handleCompare = useCallback(() => {
        try {
            const beforeTree = parseHtmlToTree(beforeHtml);
            const afterTree = parseHtmlToTree(afterHtml);

            const { before: diffedBefore, after: diffedAfter } = diffTrees(beforeTree, afterTree);

            // Layout both trees. Left tree at X=0
            const { nodes: bNodes, edges: bEdges } = treeToFlow(diffedBefore, 0, 0);

            // Calculate max X of left tree to offset right tree
            let maxX = 0;
            bNodes.forEach(n => { if (n.position.x > maxX) maxX = n.position.x; });
            const rightXOffset = Math.max(maxX + 600, 800); // give plenty of space

            const { nodes: aNodes, edges: aEdges } = treeToFlow(diffedAfter, rightXOffset, 0);

            setNodes([...bNodes, ...aNodes]);
            setEdges([...bEdges, ...aEdges]);
            setHasCompared(true);
            setSelectedNode(null);
        } catch (e) {
            console.error(e);
            alert("Failed to parse HTML or compare trees.");
        }
    }, [beforeHtml, afterHtml, setNodes, setEdges]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node.data.node as DomTreeNode);
    }, []);

    return (
        <div className="flex flex-col gap-6 w-full grow min-h-[600px] h-[70vh]">
            {!hasCompared ? (
                <div className="flex flex-col gap-6 h-full animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px] grow">
                        <div className="flex flex-col gap-3 h-full">
                            <label className="text-zinc-300 font-bold flex items-center gap-2 text-lg">
                                <FileCode2 size={20} className="text-zinc-400" /> Raw HTML (Before)
                            </label>
                            <textarea
                                value={beforeHtml}
                                onChange={(e) => setBeforeHtml(e.target.value)}
                                className="w-full h-full bg-[#0d0d12] border border-zinc-800 rounded-xl p-4 font-mono text-sm leading-relaxed text-zinc-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none shadow-inner"
                                placeholder="Paste original HTML here..."
                            />
                        </div>

                        <div className="flex flex-col gap-3 h-full">
                            <label className="text-zinc-300 font-bold flex items-center gap-2 text-lg">
                                <Code2 size={20} className="text-zinc-400" /> Raw HTML (After)
                            </label>
                            <textarea
                                value={afterHtml}
                                onChange={(e) => setAfterHtml(e.target.value)}
                                className="w-full h-full bg-[#0d0d12] border border-zinc-800 rounded-xl p-4 font-mono text-sm leading-relaxed text-zinc-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none shadow-inner"
                                placeholder="Paste modified HTML here..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-center mt-2 mb-8">
                        <button
                            onClick={handleCompare}
                            className="flex items-center gap-3 bg-accent hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-accent/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <GitCompare size={22} />
                            Compare DOM Trees
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative w-full h-full border border-zinc-800 rounded-xl overflow-hidden bg-[#0d0d14] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="absolute top-5 left-5 z-10 flex gap-5 bg-zinc-900/90 backdrop-blur-md border border-zinc-700/50 p-3 px-5 rounded-full items-center text-sm font-medium shadow-lg">
                        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(46,204,113,0.6)]"></span> Added</div>
                        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(231,76,60,0.6)]"></span> Removed</div>
                        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(243,156,18,0.6)]"></span> Modified</div>
                        <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-zinc-500"></span> Unchanged</div>

                        <div className="w-px h-5 bg-zinc-700 mx-2"></div>

                        <button
                            onClick={() => setHasCompared(false)}
                            className="text-accent hover:text-indigo-400 font-bold transition-colors"
                        >
                            Edit HTML
                        </button>
                    </div>

                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        fitView
                        className="react-flow-dark"
                        minZoom={0.1}
                    >
                        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} className="opacity-50" />
                        <Controls className="!bg-zinc-900 border-zinc-800 !fill-white shadow-xl" />
                        <MiniMap
                            nodeColor={(node) => {
                                const status = (node.data?.node as DomTreeNode)?.status;
                                if (status === 'added') return '#2ecc71';
                                if (status === 'removed') return '#e74c3c';
                                if (status === 'modified') return '#f39c12';
                                return '#3f3f46';
                            }}
                            maskColor="rgba(0, 0, 0, 0.5)"
                            className="!bg-zinc-900 border border-zinc-800 shadow-xl rounded-lg overflow-hidden"
                        />
                    </ReactFlow>

                    {selectedNode && (
                        <NodeSidebar node={selectedNode} onClose={() => setSelectedNode(null)} />
                    )}
                </div>
            )}
        </div>
    );
}
