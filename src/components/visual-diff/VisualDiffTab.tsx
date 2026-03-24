import React, { useState, useCallback } from 'react';
import ImageUploader from './ImageUploader';
import DiffViewer from './DiffViewer';
import DiffStats from './DiffStats';
import { computeImageDiff, DiffResult } from '../../lib/imagePixelDiff';
import { Loader2, SlidersHorizontal, Layers, SplitSquareHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

type ViewMode = 'slider' | 'overlay' | 'side-by-side';

export default function VisualDiffTab() {
    const [beforeImg, setBeforeImg] = useState<string | null>(null);
    const [afterImg, setAfterImg] = useState<string | null>(null);
    const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('slider');

    const handleCompare = useCallback(async () => {
        if (!beforeImg || !afterImg) return;

        setIsProcessing(true);
        try {
            const result = await computeImageDiff(beforeImg, afterImg);
            setDiffResult(result);
        } catch (error) {
            console.error("Failed to compute diff", error);
            alert("Error computing diff. Make sure images are valid.");
        } finally {
            setIsProcessing(false);
        }
    }, [beforeImg, afterImg]);

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Upload Zone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    {beforeImg ? (
                        <div className="relative rounded-xl overflow-hidden border border-zinc-800 group">
                            <img src={beforeImg} alt="Before" className="w-full h-64 object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <button
                                    onClick={() => { setBeforeImg(null); setDiffResult(null); }}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-medium"
                                >
                                    Change Before Image
                                </button>
                            </div>
                        </div>
                    ) : (
                        <ImageUploader label="Before Image" onImageSelected={setBeforeImg} />
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    {afterImg ? (
                        <div className="relative rounded-xl overflow-hidden border border-zinc-800 group">
                            <img src={afterImg} alt="After" className="w-full h-64 object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <button
                                    onClick={() => { setAfterImg(null); setDiffResult(null); }}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-medium"
                                >
                                    Change After Image
                                </button>
                            </div>
                        </div>
                    ) : (
                        <ImageUploader label="After Image" onImageSelected={setAfterImg} />
                    )}
                </div>
            </div>

            {/* Compare Action */}
            {beforeImg && afterImg && !diffResult && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={handleCompare}
                        disabled={isProcessing}
                        className="flex items-center gap-2 bg-accent hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" /> : <Layers />}
                        Compare Images
                    </button>
                </div>
            )}

            {/* Results Region */}
            {diffResult && beforeImg && afterImg && (
                <div className="flex flex-col gap-6 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl shadow-md">
                        <DiffStats result={diffResult} />

                        <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                            <button
                                onClick={() => setViewMode('slider')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                    viewMode === 'slider' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                                )}
                            >
                                <SlidersHorizontal size={16} /> Slider
                            </button>
                            <button
                                onClick={() => setViewMode('overlay')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                    viewMode === 'overlay' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                                )}
                            >
                                <Layers size={16} /> Overlay
                            </button>
                            <button
                                onClick={() => setViewMode('side-by-side')}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                    viewMode === 'side-by-side' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                                )}
                            >
                                <SplitSquareHorizontal size={16} /> Side-by-side
                            </button>
                        </div>
                    </div>

                    <DiffViewer
                        beforeImg={beforeImg}
                        afterImg={afterImg}
                        diffImg={diffResult.diffDataUrl}
                        mode={viewMode}
                    />
                </div>
            )}
        </div>
    );
}
