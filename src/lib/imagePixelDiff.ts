import pixelmatch from 'pixelmatch';

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface DiffResult {
    diffDataUrl: string;
    diffPixels: number;
    totalPixels: number;
    diffPercentage: number;
    boundingBoxes: BoundingBox[];
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

    const boundingBoxes = detectBoundingBoxes(diffData.data, width, height);

    // Draw bounding boxes on the diff canvas
    if (boundingBoxes.length > 0) {
        diffCtx.strokeStyle = 'rgba(231, 76, 60, 0.9)';
        diffCtx.lineWidth = 2;
        for (const box of boundingBoxes) {
            diffCtx.strokeRect(box.x - 2, box.y - 2, box.width + 4, box.height + 4);
        }
    }

    const totalPixels = width * height;
    const diffPercentage = (numDiffPixels / totalPixels) * 100;

    return {
        diffDataUrl: diffCanvas.toDataURL(),
        diffPixels: numDiffPixels,
        totalPixels,
        diffPercentage,
        boundingBoxes,
    };
}

// Scan diff pixel data for changed pixels and merge into non-overlapping bounding boxes
function detectBoundingBoxes(data: Uint8ClampedArray, width: number, height: number): BoundingBox[] {
    const PADDING = 8;
    const MIN_AREA = 16;

    // Collect all changed pixel coords as rough row-scan boxes, then merge
    const rawBoxes: BoundingBox[] = [];
    let inRun = false;
    let runStart = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const isDiff = data[idx + 3] > 0 && (data[idx] > 100 || data[idx + 1] < 50);

            if (isDiff && !inRun) {
                inRun = true;
                runStart = x;
            } else if (!isDiff && inRun) {
                rawBoxes.push({ x: runStart, y, width: x - runStart, height: 1 });
                inRun = false;
            }
        }
        if (inRun) {
            rawBoxes.push({ x: runStart, y, width: width - runStart, height: 1 });
            inRun = false;
        }
    }

    if (rawBoxes.length === 0) return [];

    // Merge overlapping / nearby boxes with padding
    const merged: BoundingBox[] = [];

    for (const box of rawBoxes) {
        const px1 = box.x - PADDING;
        const py1 = box.y - PADDING;
        const px2 = box.x + box.width + PADDING;
        const py2 = box.y + box.height + PADDING;

        let found = false;
        for (const m of merged) {
            const mx2 = m.x + m.width;
            const my2 = m.y + m.height;

            if (px1 <= mx2 && px2 >= m.x && py1 <= my2 && py2 >= m.y) {
                const newX = Math.min(m.x, box.x);
                const newY = Math.min(m.y, box.y);
                m.width = Math.max(mx2, box.x + box.width) - newX;
                m.height = Math.max(my2, box.y + box.height) - newY;
                m.x = newX;
                m.y = newY;
                found = true;
                break;
            }
        }

        if (!found) {
            merged.push({ x: box.x, y: box.y, width: box.width, height: box.height });
        }
    }

    return merged.filter(b => b.width * b.height >= MIN_AREA);
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
