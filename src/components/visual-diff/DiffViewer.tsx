import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/cn';

interface DiffViewerProps {
    beforeImg: string;
    afterImg: string;
    diffImg?: string;
    mode: 'slider' | 'overlay' | 'side-by-side';
}

export default function DiffViewer({ beforeImg, afterImg, diffImg, mode }: DiffViewerProps) {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging || !containerRef.current) return;

        let clientX = 0;
        if (e instanceof MouseEvent) {
            clientX = e.clientX;
        } else if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
        }

        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = (x / rect.width) * 100;

        setSliderPos(percentage);
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('touchend', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);

    if (mode === 'side-by-side') {
        return (
            <div className="grid grid-cols-2 gap-4 w-full">
                <div>
                    <h4 className="text-center text-zinc-400 mb-2 text-sm font-medium">Before</h4>
                    <img src={beforeImg} className="w-full rounded-lg border border-zinc-800" alt="Before" />
                </div>
                <div>
                    <h4 className="text-center text-zinc-400 mb-2 text-sm font-medium">After</h4>
                    <img src={afterImg} className="w-full rounded-lg border border-zinc-800" alt="After" />
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full overflow-hidden select-none rounded-xl border border-zinc-800 bg-zinc-900",
                mode === 'slider' && "cursor-ew-resize"
            )}
            onMouseDown={mode === 'slider' ? handleMouseDown : undefined}
            onTouchStart={mode === 'slider' ? handleMouseDown : undefined}
        >
            <img src={beforeImg} alt="Before" className="w-[100%] block select-none pointer-events-none" draggable="false" />

            {mode === 'slider' && (
                <>
                    <img
                        src={afterImg}
                        alt="After"
                        className="absolute top-0 left-0 w-[100%] h-full object-fill select-none pointer-events-none"
                        draggable="false"
                        style={{ clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)` }}
                    />
                    <div
                        className="absolute top-0 bottom-0 w-1 bg-white flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10"
                        style={{ left: `calc(${sliderPos}% - 2px)` }}
                    >
                        <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-zinc-200">
                            <div className="w-3 flex justify-between">
                                <div className="w-[2px] h-3 bg-zinc-400 rounded-full" />
                                <div className="w-[2px] h-3 bg-zinc-400 rounded-full" />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {mode === 'overlay' && diffImg && (
                <img
                    src={diffImg}
                    alt="Diff Highlight"
                    className="absolute top-0 left-0 w-[100%] h-full mix-blend-normal opacity-90 select-none pointer-events-none"
                    draggable="false"
                />
            )}
        </div>
    );
}
