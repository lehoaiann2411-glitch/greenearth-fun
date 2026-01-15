// Image Processing Utilities using HTML5 Canvas

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StickerOverlay {
  id: string;
  emoji: string;
  x: number; // percentage
  y: number; // percentage
  scale: number;
  text?: string;
}

export interface ImageEditOptions {
  cropArea?: CropArea;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
  filter?: string;
  stickers?: StickerOverlay[];
}

// CSS Filter presets
export const FILTER_PRESETS = [
  { id: 'original', name: 'Original', name_vi: 'Gốc', css: 'none' },
  { id: 'vivid', name: 'Vivid', name_vi: 'Rực rỡ', css: 'brightness(1.1) saturate(1.3)' },
  { id: 'cool', name: 'Cool', name_vi: 'Mát mẻ', css: 'brightness(1.05) sepia(0.1) hue-rotate(-10deg)' },
  { id: 'warm', name: 'Warm', name_vi: 'Ấm áp', css: 'brightness(1.05) sepia(0.15)' },
  { id: 'bw', name: 'B&W', name_vi: 'Đen trắng', css: 'grayscale(1)' },
  { id: 'vintage', name: 'Vintage', name_vi: 'Cổ điển', css: 'sepia(0.4) contrast(0.9)' },
  { id: 'fade', name: 'Fade', name_vi: 'Mờ nhạt', css: 'brightness(1.1) contrast(0.85)' },
  { id: 'drama', name: 'Drama', name_vi: 'Kịch tính', css: 'contrast(1.2) brightness(0.95)' },
  { id: 'eco', name: 'Eco', name_vi: 'Sinh thái', css: 'saturate(1.2) hue-rotate(15deg) brightness(1.05)' },
];

// Crop aspect ratio presets
export const CROP_RATIOS = [
  { id: 'free', name: 'Free', name_vi: 'Tự do', ratio: null },
  { id: '1:1', name: '1:1', name_vi: '1:1', ratio: 1 },
  { id: '4:3', name: '4:3', name_vi: '4:3', ratio: 4 / 3 },
  { id: '16:9', name: '16:9', name_vi: '16:9', ratio: 16 / 9 },
  { id: '9:16', name: '9:16', name_vi: '9:16', ratio: 9 / 16 },
];

/**
 * Create cropped image from crop area
 */
export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: CropArea,
  rotation = 0,
  flipH = false,
  flipV = false
): Promise<HTMLCanvasElement> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('No 2d context');

  const rotRad = (rotation * Math.PI) / 180;

  // Calculate bounding box of rotated image
  const { width: bBoxWidth, height: bBoxHeight } = getRotatedSize(
    image.width,
    image.height,
    rotation
  );

  // Set canvas size to match bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Translate and rotate context
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw rotated/flipped image
  ctx.drawImage(image, 0, 0);

  // Extract cropped area
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) throw new Error('No 2d context');

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return croppedCanvas;
}

/**
 * Apply CSS filter to canvas
 */
export function applyFilter(
  canvas: HTMLCanvasElement,
  filterCss: string
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Create a temp canvas with filter
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx) return canvas;

  tempCtx.filter = filterCss;
  tempCtx.drawImage(canvas, 0, 0);

  return tempCanvas;
}

/**
 * Render stickers on canvas
 */
export async function renderStickers(
  canvas: HTMLCanvasElement,
  stickers: StickerOverlay[]
): Promise<HTMLCanvasElement> {
  const ctx = canvas.getContext('2d');
  if (!ctx || stickers.length === 0) return canvas;

  for (const sticker of stickers) {
    const x = (sticker.x / 100) * canvas.width;
    const y = (sticker.y / 100) * canvas.height;
    const fontSize = 48 * sticker.scale;

    ctx.save();
    ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (sticker.text) {
      // Draw badge style
      const text = `${sticker.emoji} ${sticker.text}`;
      const metrics = ctx.measureText(text);
      const padding = 12;
      const bgWidth = metrics.width + padding * 2;
      const bgHeight = fontSize + padding;

      ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
      ctx.beginPath();
      ctx.roundRect(x - bgWidth / 2, y - bgHeight / 2, bgWidth, bgHeight, bgHeight / 2);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = `bold ${fontSize * 0.6}px sans-serif`;
      ctx.fillText(text, x, y);
    } else {
      // Draw emoji
      ctx.fillText(sticker.emoji, x, y);
    }

    ctx.restore();
  }

  return canvas;
}

/**
 * Process image with all edits and return as File
 */
export async function processEditedImage(
  imageSrc: string,
  options: ImageEditOptions
): Promise<{ file: File; previewUrl: string }> {
  const {
    cropArea,
    rotation = 0,
    flipH = false,
    flipV = false,
    filter = 'none',
    stickers = [],
  } = options;

  // Start with cropping and transformations
  let canvas: HTMLCanvasElement;
  
  if (cropArea) {
    canvas = await getCroppedImage(imageSrc, cropArea, rotation, flipH, flipV);
  } else {
    // Just apply rotation/flip without crop
    const image = await createImage(imageSrc);
    canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('No 2d context');

    const { width, height } = getRotatedSize(image.width, image.height, rotation);
    canvas.width = width;
    canvas.height = height;

    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);
  }

  // Apply filter
  if (filter && filter !== 'none') {
    canvas = applyFilter(canvas, filter);
  }

  // Render stickers
  if (stickers.length > 0) {
    canvas = await renderStickers(canvas, stickers);
  }

  // Convert to blob/file
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      },
      'image/jpeg',
      0.92
    );
  });

  const file = new File([blob], `edited-${Date.now()}.jpg`, { type: 'image/jpeg' });
  const previewUrl = URL.createObjectURL(blob);

  return { file, previewUrl };
}

// Helper functions
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function getRotatedSize(
  width: number,
  height: number,
  rotation: number
): { width: number; height: number } {
  const rotRad = Math.abs((rotation * Math.PI) / 180);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}
