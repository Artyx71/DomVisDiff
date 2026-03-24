import { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface ImageUploaderProps {
    label: string;
    onImageSelected: (url: string) => void;
}

export default function ImageUploader({ label, onImageSelected }: ImageUploaderProps) {
    const [isHovering, setIsHovering] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsHovering(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                onImageSelected(url);
            }
        }
    }, [onImageSelected]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                onImageSelected(url);
            }
        }
    }, [onImageSelected]);

    return (
        <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium text-zinc-200 mb-3">{label}</h3>
            <label
                onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                onDragLeave={() => setIsHovering(false)}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isHovering ? 'border-accent bg-accent/5' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/30'
                    }`}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-zinc-400" />
                    <p className="mb-2 text-sm text-zinc-400">
                        <span className="font-semibold text-zinc-200">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-zinc-500">PNG, JPG, WebP</p>
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                />
            </label>
        </div>
    );
}
