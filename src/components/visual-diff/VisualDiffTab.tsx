import { useState, useCallback } from 'react';
import ImageUploader from './ImageUploader';
import DiffViewer from './DiffViewer';
import DiffStats from './DiffStats';
import { computeImageDiff } from '../../lib/imagePixelDiff';
import type { DiffResult } from '../../lib/imagePixelDiff';
import { Loader2, SlidersHorizontal, Layers, SplitSquareHorizontal, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

type ViewMode = 'slider' | 'overlay' | 'side-by-side';

export default function VisualDiffTab() {
    const [beforeImg, setBeforeImg] = useState<string | null>(null);
    const [afterImg, setAfterImg] = useState<string | null>(null);
    const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('slider');
    const [error, setError] = useState<string | null>(null);
    const [threshold, setThreshold] = useState(0.1);

    const handleCompare = useCallback(async () => {
        if (!beforeImg || !afterImg) return;

        setIsProcessing(true);
        setError(null);
        try {
            const result = await computeImageDiff(beforeImg, afterImg, threshold);
            setDiffResult(result);
        } catch (err: any) {
            setError(err.message || 'Failed to compute diff. Make sure images are valid.');
        } finally {
            setIsProcessing(false);
        }
    }, [beforeImg, afterImg, threshold]);

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

            {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                    <AlertCircle size={18} className="shrink-0" />
                    {error}
                </div>
            )}

            {/* Sensitivity slider — shown when images loaded but no result yet */}
            {beforeImg && afterImg && !diffResult && (
                <div className="flex flex-col items-center gap-6 mt-4">
                    <div className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800 px-6 py-3 rounded-xl w-full max-w-md">
                        <label className="text-zinc-400 text-sm font-medium whitespace-nowrap">Sensitivity</label>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={threshold}
                            onChange={e => { setThreshold(parseFloat(e.target.value)); }}
                            className="flex-1 accent-accent"
                        />
                        <span className="text-zinc-300 text-sm font-mono w-10 text-right">{threshold.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-zinc-600 -mt-3">Lower = more sensitive to subtle changes</p>

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

                        <div className="flex items-center gap-3">
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

                            <button
                                onClick={() => { setDiffResult(null); }}
                                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            >
                                Re-compare
                            </button>

                            {diffResult?.diffDataUrl && (
                                <a
                                    href={diffResult.diffDataUrl}
                                    download="diff-result.png"
                                    className="bg-accent/10 hover:bg-accent text-accent hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all border border-accent/20"
                                >
                                    Download Diff
                                </a>
                            )}
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
