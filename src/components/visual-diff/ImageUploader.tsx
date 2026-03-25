import { useCallback, useState } from 'react';
import { UploadCloud, Camera, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
    label: string;
    onImageSelected: (url: string) => void;
}

export default function ImageUploader({ label, onImageSelected }: ImageUploaderProps) {
    const [isHovering, setIsHovering] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [isCapturing, setIsCapturing] = useState(false);

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

    const handleCapture = async () => {
        if (!urlInput) return;
        setIsCapturing(true);
        try {
            // In a real extension, we might open a temporary tab, wait, and capture
            // For now, let's assume the user wants to capture their current active tab if no URL provided,
            // or we can use a service if it's not a real extension context.
            // But here it IS an extension context.

            // We'll send a message to background to capture
            // @ts-ignore
            chrome.runtime.sendMessage({ action: 'capture_tab' }, (response: any) => {
                if (response && response.dataUrl) {
                    onImageSelected(response.dataUrl);
                } else {
                    alert("Failed to capture tab. Make sure you are on a webpage.");
                }
                setIsCapturing(false);
            });
        } catch (err) {
            console.error(err);
            setIsCapturing(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full">
            <h3 className="text-xl font-bold bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent mb-4 self-start">{label}</h3>

            <div className={`relative flex flex-col items-center justify-center w-full min-h-64 glass-dark rounded-2xl cursor-pointer transition-all duration-500 group ${isHovering ? 'border-accent bg-accent/5 ring-4 ring-accent/10' : 'border-zinc-800 hover:border-zinc-600'
                }`}>
                <label
                    onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                    onDragLeave={() => setIsHovering(false)}
                    onDrop={handleDrop}
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <UploadCloud className="w-8 h-8 text-accent" />
                        </div>
                        <p className="mb-2 text-sm text-zinc-300">
                            <span className="font-semibold text-white">Upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Image Files</p>
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleChange}
                    />
                </label>
            </div>

            <div className="mt-4 w-full flex gap-2">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Or capture from active tab..."
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-all pl-10"
                    />
                    <Camera className="absolute left-3 top-3.5 text-zinc-500" size={18} />
                </div>
                <button
                    onClick={handleCapture}
                    disabled={isCapturing}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-3 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                    {isCapturing ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                    Capture
                </button>
            </div>
        </div>
    );
}
