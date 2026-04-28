import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, BackgroundVariant } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { parseHtmlToTree } from '../../lib/parseHtmlToTree';
import type { DomTreeNode } from '../../lib/parseHtmlToTree';
import { diffTrees } from '../../lib/diffTrees';
import { treeToFlow } from '../../lib/treeToFlow';
import CustomNode from './CustomNode';
import NodeSidebar from './NodeSidebar';
import { FileCode2, GitCompare, Code2, AlertCircle } from 'lucide-react';

const nodeTypes = {
    domNode: CustomNode,
};

export default function DomDiffTab() {
    const [beforeInput, setBeforeInput] = useState('<div class="header" id="main">\n  <h1 class="title">Hello</h1>\n</div>');
    const [afterInput, setAfterInput] = useState('<div class="header dark" id="main">\n  <h1 class="title">Hello World</h1>\n  <p class="subtitle">New intro</p>\n</div>');

    const [beforeMode, setBeforeMode] = useState<'html' | 'url'>('html');
    const [afterMode, setAfterMode] = useState<'html' | 'url'>('html');

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [selectedNode, setSelectedNode] = useState<{ before: DomTreeNode | null; after: DomTreeNode | null } | null>(null);

    const [hasCompared, setHasCompared] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showOnlyChanges, setShowOnlyChanges] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [rawDiffedBefore, setRawDiffedBefore] = useState<DomTreeNode | null>(null);
    const [rawDiffedAfter, setRawDiffedAfter] = useState<DomTreeNode | null>(null);

    // Build a path → node map for looking up counterpart nodes
    const buildPathMap = useCallback((root: DomTreeNode | null): Map<string, DomTreeNode> => {
        const map = new Map<string, DomTreeNode>();
        function walk(n: DomTreeNode) {
            map.set(n.path, n);
            n.children.forEach(walk);
        }
        if (root) walk(root);
        return map;
    }, []);

    const filterTree = useCallback((node: DomTreeNode | null): DomTreeNode | null => {
        if (!node) return null;
        if (node.status !== 'unchanged') return node;
        const filteredChildren = (node.children || [])
            .map(child => filterTree(child))
            .filter((child): child is DomTreeNode => child !== null);
        if (filteredChildren.length > 0) return { ...node, children: filteredChildren };
        return null;
    }, []);

    // Reactively rebuild flow graph when raw trees or filter toggle changes
    useEffect(() => {
        if (!rawDiffedBefore && !rawDiffedAfter) return;

        const displayBefore = showOnlyChanges ? filterTree(rawDiffedBefore) : rawDiffedBefore;
        const displayAfter = showOnlyChanges ? filterTree(rawDiffedAfter) : rawDiffedAfter;

        const { nodes: bNodes, edges: bEdges } = treeToFlow(displayBefore, 0, 0);
        let maxX = 0;
        bNodes.forEach(n => { if (n.position.x > maxX) maxX = n.position.x; });
        const rightXOffset = Math.max(maxX + 600, 800);
        const { nodes: aNodes, edges: aEdges } = treeToFlow(displayAfter, rightXOffset, 0);

        setNodes([...bNodes, ...aNodes]);
        setEdges([...bEdges, ...aEdges]);
    }, [rawDiffedBefore, rawDiffedAfter, showOnlyChanges, filterTree, setNodes, setEdges]);

    const handleCompare = useCallback(async () => {
        setIsProcessing(true);
        setError(null);
        try {
            let finalBeforeHtml = beforeInput;
            let finalAfterHtml = afterInput;

            if (beforeMode === 'url') {
                const res = await new Promise<{ html?: string; error?: string }>((resolve) => {
                    // @ts-ignore
                    chrome.runtime.sendMessage({ action: 'fetch_html', url: beforeInput }, resolve);
                });
                if (res.error) throw new Error(res.error);
                finalBeforeHtml = res.html!;
            }
            if (afterMode === 'url') {
                const res = await new Promise<{ html?: string; error?: string }>((resolve) => {
                    // @ts-ignore
                    chrome.runtime.sendMessage({ action: 'fetch_html', url: afterInput }, resolve);
                });
                if (res.error) throw new Error(res.error);
                finalAfterHtml = res.html!;
            }

            const beforeTree = parseHtmlToTree(finalBeforeHtml);
            const afterTree = parseHtmlToTree(finalAfterHtml);

            const { before: diffedBefore, after: diffedAfter } = diffTrees(beforeTree, afterTree);

            setRawDiffedBefore(diffedBefore);
            setRawDiffedAfter(diffedAfter);
            setHasCompared(true);
            setSelectedNode(null);
        } catch (e: any) {
            setError(e.message || 'Failed to parse HTML or compare trees');
        } finally {
            setIsProcessing(false);
        }
    }, [beforeInput, afterInput, beforeMode, afterMode]);

    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        const clickedNode = node.data.node as DomTreeNode;
        const beforeMap = buildPathMap(rawDiffedBefore);
        const afterMap = buildPathMap(rawDiffedAfter);
        setSelectedNode({
            before: beforeMap.get(clickedNode.path) ?? null,
            after: afterMap.get(clickedNode.path) ?? null,
        });
    }, [rawDiffedBefore, rawDiffedAfter, buildPathMap]);

    return (
        <div className="flex flex-col gap-6 w-full grow min-h-[600px] h-[70vh]">
            {!hasCompared ? (
                <div className="flex flex-col gap-6 h-full animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[400px] grow">
                        <div className="flex flex-col gap-4 h-full">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-zinc-300 font-bold flex items-center gap-2 text-xl">
                                    <FileCode2 size={24} className="text-accent" /> Before
                                </label>
                                <div className="flex glass p-1 rounded-xl">
                                    <button onClick={() => setBeforeMode('html')} className={`px-4 py-1.5 text-xs rounded-lg font-bold transition-all ${beforeMode === 'html' ? 'bg-accent text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>HTML</button>
                                    <button onClick={() => setBeforeMode('url')} className={`px-4 py-1.5 text-xs rounded-lg font-bold transition-all ${beforeMode === 'url' ? 'bg-accent text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>URL</button>
                                </div>
                            </div>
                            {beforeMode === 'html' ? (
                                <textarea
                                    value={beforeInput}
                                    onChange={(e) => setBeforeInput(e.target.value)}
                                    className="w-full grow bg-[#0d0d12] border border-zinc-800 rounded-2xl p-6 font-mono text-sm leading-relaxed text-zinc-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none shadow-2xl transition-all"
                                    placeholder="Paste original HTML here..."
                                />
                            ) : (
                                <div className="w-full h-full flex items-start">
                                    <input
                                        type="url"
                                        value={beforeInput}
                                        onChange={(e) => setBeforeInput(e.target.value)}
                                        className="w-full bg-[#0d0d12] border border-zinc-800 rounded-2xl p-6 font-mono text-sm text-zinc-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent shadow-2xl transition-all"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 h-full">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-zinc-300 font-bold flex items-center gap-2 text-xl">
                                    <Code2 size={24} className="text-accent" /> After
                                </label>
                                <div className="flex glass p-1 rounded-xl">
                                    <button onClick={() => setAfterMode('html')} className={`px-4 py-1.5 text-xs rounded-lg font-bold transition-all ${afterMode === 'html' ? 'bg-accent text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>HTML</button>
                                    <button onClick={() => setAfterMode('url')} className={`px-4 py-1.5 text-xs rounded-lg font-bold transition-all ${afterMode === 'url' ? 'bg-accent text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>URL</button>
                                </div>
                            </div>
                            {afterMode === 'html' ? (
                                <textarea
                                    value={afterInput}
                                    onChange={(e) => setAfterInput(e.target.value)}
                                    className="w-full grow bg-[#0d0d12] border border-zinc-800 rounded-2xl p-6 font-mono text-sm leading-relaxed text-zinc-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none shadow-2xl transition-all"
                                    placeholder="Paste modified HTML here..."
                                />
                            ) : (
                                <div className="w-full h-full flex items-start">
                                    <input
                                        type="url"
                                        value={afterInput}
                                        onChange={(e) => setAfterInput(e.target.value)}
                                        className="w-full bg-[#0d0d12] border border-zinc-800 rounded-2xl p-6 font-mono text-sm text-zinc-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent shadow-2xl transition-all"
                                        placeholder="https://example.com/v2"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col items-center mt-4 mb-20 gap-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={showOnlyChanges}
                                    onChange={(e) => setShowOnlyChanges(e.target.checked)}
                                />
                                <div className="w-12 h-6 bg-zinc-800 rounded-full peer-checked:bg-accent transition-colors shadow-inner" />
                                <div className="absolute left-1 top-1 w-4 h-4 bg-zinc-400 rounded-full peer-checked:translate-x-6 peer-checked:bg-white transition-all shadow-md" />
                            </div>
                            <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors font-medium">Show Only Changes</span>
                        </label>

                        <button
                            onClick={handleCompare}
                            disabled={isProcessing}
                            className="flex items-center gap-3 bg-accent hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-2xl hover:shadow-accent/40 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {isProcessing ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <GitCompare size={26} />
                            )}
                            {isProcessing ? 'Analyzing Trees…' : 'Compare DOM Trees'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative w-full h-full border border-white/5 rounded-3xl overflow-hidden glass-dark flex flex-col shadow-[0_32px_64px_-12px_rgba(0,0,0,0.7)] animate-in zoom-in-95 duration-500">
                    <div className="absolute top-6 left-6 z-10 flex gap-6 bg-zinc-950/80 backdrop-blur-2xl border border-white/10 p-4 px-6 rounded-2xl items-center text-sm font-bold shadow-2xl">
                        <div className="flex items-center gap-2.5"><span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(46,204,113,0.8)]"></span> Added</div>
                        <div className="flex items-center gap-2.5"><span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(231,76,60,0.8)]"></span> Removed</div>
                        <div className="flex items-center gap-2.5"><span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_12px_rgba(243,156,18,0.8)]"></span> Modified</div>
                        <div className="flex items-center gap-2.5"><span className="w-3 h-3 rounded-full bg-zinc-600"></span> Unchanged</div>

                        <div className="w-px h-6 bg-zinc-800 mx-2"></div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={showOnlyChanges}
                                    onChange={(e) => setShowOnlyChanges(e.target.checked)}
                                />
                                <div className="w-8 h-4 bg-zinc-700 rounded-full peer-checked:bg-accent transition-colors" />
                                <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-zinc-400 rounded-full peer-checked:translate-x-4 peer-checked:bg-white transition-all" />
                            </div>
                            <span className="text-zinc-400 text-xs font-medium">Changes only</span>
                        </label>

                        <div className="w-px h-6 bg-zinc-800 mx-2"></div>

                        <button
                            onClick={() => { setHasCompared(false); setError(null); }}
                            className="bg-accent/10 hover:bg-accent text-accent hover:text-white px-4 py-2 rounded-xl transition-all"
                        >
                            Edit Inputs
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
                        minZoom={0.05}
                    >
                        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} className="opacity-20" />
                        <Controls className="!bg-zinc-900 !border-white/10 !rounded-xl overflow-hidden !fill-white !shadow-2xl" />
                        <MiniMap
                            nodeColor={(node: Node) => {
                                const status = (node.data?.node as DomTreeNode)?.status;
                                if (status === 'added') return '#2ecc71';
                                if (status === 'removed') return '#e74c3c';
                                if (status === 'modified') return '#f39c12';
                                return '#27272a';
                            }}
                            maskColor="rgba(0, 0, 0, 0.7)"
                            className="!bg-zinc-950 !border-white/10 !shadow-2xl !rounded-2xl !overflow-hidden"
                        />
                    </ReactFlow>

                    {selectedNode && (
                        <NodeSidebar
                            before={selectedNode.before}
                            after={selectedNode.after}
                            onClose={() => setSelectedNode(null)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
