import pixelmatch from 'pixelmatch';

export interface DiffResult {
    diffDataUrl: string;
    diffPixels: number;
    totalPixels: number;
    diffPercentage: number;
}

export async function computeImageDiff(img1Url: string, img2Url: string, threshold = 0.1): Promise<DiffResult> {
    const img1 = await loadImage(img1Url);
    const img2 = await loadImage(img2Url);

    const width = Math.max(img1.width, img2.width);
    const height = Math.max(img1.height, img2.height);

    const canvas1 = document.createElement('canvas');
    const canvas2 = document.createElement('canvas');
    const diffCanvas = document.createElement('canvas');

    canvas1.width = width;
    canvas1.height = height;
    canvas2.width = width;
    canvas2.height = height;
    diffCanvas.width = width;
    diffCanvas.height = height;

    const ctx1 = canvas1.getContext('2d') as CanvasRenderingContext2D;
    const ctx2 = canvas2.getContext('2d') as CanvasRenderingContext2D;
    const diffCtx = diffCanvas.getContext('2d') as CanvasRenderingContext2D;

    ctx1.drawImage(img1, 0, 0);
    ctx2.drawImage(img2, 0, 0);

    const imgData1 = ctx1.getImageData(0, 0, width, height);
    const imgData2 = ctx2.getImageData(0, 0, width, height);
    const diffData = diffCtx.createImageData(width, height);

    const numDiffPixels = pixelmatch(
        imgData1.data,
        imgData2.data,
        diffData.data,
        width,
        height,
        { threshold, diffColor: [231, 76, 60] }
    );

    diffCtx.putImageData(diffData, 0, 0);

    const totalPixels = width * height;
    const diffPercentage = (numDiffPixels / totalPixels) * 100;

    return {
        diffDataUrl: diffCanvas.toDataURL(),
        diffPixels: numDiffPixels,
        totalPixels,
        diffPercentage
    };
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}
