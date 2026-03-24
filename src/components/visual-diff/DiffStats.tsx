import type { DiffResult } from '../../lib/imagePixelDiff';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface DiffStatsProps {
    result: DiffResult;
}

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export default function DiffStats({ result }: DiffStatsProps) {
    const isGreen = result.diffPercentage < 5;
    const isYellow = result.diffPercentage >= 5 && result.diffPercentage <= 20;
    const isRed = result.diffPercentage > 20;

    return (
        <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg border",
            isGreen && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
            isYellow && "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
            isRed && "bg-red-500/10 border-red-500/20 text-red-500"
        )}>
            {isGreen && <CheckCircle size={24} />}
            {isYellow && <AlertTriangle size={24} />}
            {isRed && <XCircle size={24} />}
            <div>
                <p className="font-semibold text-lg">
                    {result.diffPercentage.toFixed(2)}% Difference
                </p>
                <p className="text-sm opacity-80">
                    {result.diffPixels.toLocaleString()} out of {result.totalPixels.toLocaleString()} pixels changed.
                </p>
            </div>
        </div>
    );
}
