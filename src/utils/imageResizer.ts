import { CanvasAnchorPosition, Layer, ResampleAlgorithm, ResampleResult } from '../types';

/**
 * Maximum safe limits to protect against browser crash / out of memory
 */
export const MAX_SAFE_IMAGE_DIMENSION = 8192; // 8K max width or height
export const MAX_SAFE_MEGAPIXELS = 64; // 64 MP max total pixels
export const WARNING_IMAGE_DIMENSION = 4096; // 4K warning threshold
export const WARNING_MEGAPIXELS = 25; // 25 MP warning threshold

export interface ImageBitmapInfo {
  width: number;
  height: number;
  megapixels: number;
  aspectRatio: number;
  aspectRatioStr: string;
  byteSize: number;
  isTransparent?: boolean;
}

export interface PresetResolution {
  id: string;
  nameAr: string;
  nameEn: string;
  width: number;
  height: number;
  category: 'social' | 'standard' | 'pixel_art' | 'print';
}

export const RESOLUTION_PRESETS: PresetResolution[] = [
  { id: 'fhd', nameAr: 'Full HD 1080p (شائع)', nameEn: 'Full HD 1080p', width: 1920, height: 1080, category: 'standard' },
  { id: 'hd', nameAr: 'HD 720p', nameEn: 'HD 720p', width: 1280, height: 720, category: 'standard' },
  { id: '2k', nameAr: '2K QHD (عالي الدقة)', nameEn: '2K QHD 1440p', width: 2560, height: 1440, category: 'standard' },
  { id: '4k', nameAr: '4K UHD (فائق الدقة)', nameEn: '4K Ultra HD', width: 3840, height: 2160, category: 'standard' },
  { id: 'square_lg', nameAr: 'مربع كبير (إنستغرام/منتج)', nameEn: 'Square 1080×1080', width: 1080, height: 1080, category: 'social' },
  { id: 'square_sm', nameAr: 'مربع متوسط (متجر)', nameEn: 'Square 800×800', width: 800, height: 800, category: 'social' },
  { id: 'story', nameAr: 'ستوري / ريلز (عمودي)', nameEn: 'Story / Reel 9:16', width: 1080, height: 1920, category: 'social' },
  { id: 'banner', nameAr: 'بانر ويب / إعلان', nameEn: 'Web Banner 1200×630', width: 1200, height: 630, category: 'social' },
  { id: 'icon_lg', nameAr: 'أيقونة متجر 512px', nameEn: 'App Icon 512×512', width: 512, height: 512, category: 'standard' },
  { id: 'icon_sm', nameAr: 'أيقونة صغيرة 256px', nameEn: 'Favicon / Icon 256', width: 256, height: 256, category: 'standard' },
];

export const PERCENTAGE_PRESETS = [25, 50, 75, 100, 125, 150, 200, 300, 400];

/**
 * Applies unsharp mask convolution to sharpen edges (especially for downsampling)
 */
export function applyUnsharpMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number = 0.28
) {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const copy = new Uint8ClampedArray(data);

    const a = Math.min(0.4, Math.max(0.05, amount));
    const center = 1 + 4 * a;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        if (copy[idx + 3] === 0) continue; // Skip pure transparent pixels

        for (let c = 0; c < 3; c++) {
          const val =
            copy[idx + c] * center -
            (copy[((y - 1) * width + x) * 4 + c] * a +
              copy[((y + 1) * width + x) * 4 + c] * a +
              copy[(y * width + (x - 1)) * 4 + c] * a +
              copy[(y * width + (x + 1)) * 4 + c] * a);
          data[idx + c] = Math.max(0, Math.min(255, Math.round(val)));
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } catch (e) {
    console.warn('Unsharp mask skipped:', e);
  }
}

/**
 * Applies subtle gentle smoothing to minimize harsh pixel edges (especially for enlargement)
 */
export function applyGentleSmoothing(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const copy = new Uint8ClampedArray(data);

    const weightCenter = 0.64;
    const weightEdge = 0.09;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        if (copy[idx + 3] === 0) continue;

        for (let c = 0; c < 3; c++) {
          const val =
            copy[idx + c] * weightCenter +
            (copy[((y - 1) * width + x) * 4 + c] +
              copy[((y + 1) * width + x) * 4 + c] +
              copy[(y * width + (x - 1)) * 4 + c] +
              copy[(y * width + (x + 1)) * 4 + c]) *
              weightEdge;
          data[idx + c] = Math.max(0, Math.min(255, Math.round(val)));
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } catch (e) {
    console.warn('Gentle smoothing skipped:', e);
  }
}

/**
 * Format aspect ratio into standard human readable string like 16:9, 4:3, 1:1, etc.
 */
export function formatAspectRatio(width: number, height: number): string {
  if (!width || !height) return '1:1';
  const ratio = width / height;

  // Check common photographic/screen ratios
  const tolerance = 0.03;
  if (Math.abs(ratio - 1) < tolerance) return '1:1';
  if (Math.abs(ratio - 16 / 9) < tolerance) return '16:9';
  if (Math.abs(ratio - 9 / 16) < tolerance) return '9:16';
  if (Math.abs(ratio - 4 / 3) < tolerance) return '4:3';
  if (Math.abs(ratio - 3 / 4) < tolerance) return '3:4';
  if (Math.abs(ratio - 3 / 2) < tolerance) return '3:2';
  if (Math.abs(ratio - 2 / 3) < tolerance) return '2:3';
  if (Math.abs(ratio - 21 / 9) < tolerance) return '21:9';

  return `${ratio.toFixed(2)}:1`;
}

/**
 * Loads an HTMLImageElement safely from any source (dataURL, blob, URL)
 */
export async function loadImageElement(src: string): Promise<HTMLImageElement> {
  let cleanSrc = src;

  // For remote HTTP URLs, try fetching as a blob first to guarantee canvas won't be tainted
  if (src.startsWith('http://') || src.startsWith('https://')) {
    try {
      const resp = await fetch(src, { mode: 'cors' });
      if (resp.ok) {
        const blob = await resp.blob();
        cleanSrc = URL.createObjectURL(blob);
      }
    } catch {
      // If direct fetch fails, fallback to using the URL directly with crossOrigin
      cleanSrc = src;
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image from source: ' + e));
    img.src = cleanSrc;
  });
}

/**
 * Inspects real intrinsic pixel dimensions of an image source
 */
export async function getImageBitmapDimensions(src: string): Promise<ImageBitmapInfo> {
  const img = await loadImageElement(src);
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  const megapixels = Number(((width * height) / 1_000_000).toFixed(2));
  const aspectRatio = width / (height || 1);
  const aspectRatioStr = formatAspectRatio(width, height);

  // Approximate byte size if dataURL
  let byteSize = 0;
  if (src.startsWith('data:')) {
    const base64Index = src.indexOf(';base64,');
    if (base64Index !== -1) {
      const base64Str = src.substring(base64Index + 8);
      byteSize = Math.round((base64Str.length * 3) / 4);
    }
  } else {
    // Estimate based on uncompressed RGBA or average 2 bytes per pixel compressed
    byteSize = Math.round(width * height * 1.5);
  }

  return {
    width,
    height,
    megapixels,
    aspectRatio,
    aspectRatioStr,
    byteSize,
  };
}

/**
 * Resamples an image bitmap to target dimensions using true pixel-level rasterization.
 *
 * Guarantees:
 * - Modifies the actual underlying pixel bitmap data, returning a newly encoded bitmap.
 * - Supports Bicubic/Smooth, Multi-pass Step-Down (Anti-Aliasing), Nearest-Neighbor (Pixel Art), and Bilinear.
 * - Preserves the full Alpha channel (transparency) without adding black or white borders.
 * - Validates memory safety limits.
 * - Self-verifies the output bitmap dimensions.
 */
export async function resampleImageBitmap(
  src: string,
  options: {
    targetWidth: number;
    targetHeight: number;
    algorithm?: ResampleAlgorithm;
    outputFormat?: 'image/png' | 'image/jpeg' | 'image/webp';
    quality?: number; // 0.1 to 1.0
  }
): Promise<ResampleResult> {
  const {
    targetWidth,
    targetHeight,
    algorithm = 'bicubic',
    outputFormat = 'image/png',
    quality = 0.95,
  } = options;

  // 1. Validation & Memory Safety Checks
  const w = Math.round(targetWidth);
  const h = Math.round(targetHeight);

  if (w <= 0 || h <= 0) {
    throw new Error(`Invalid dimensions: ${w}×${h}. Width and height must be positive integers.`);
  }

  if (w > MAX_SAFE_IMAGE_DIMENSION || h > MAX_SAFE_IMAGE_DIMENSION) {
    throw new Error(
      `Dimensions (${w}×${h}) exceed maximum safe limit of ${MAX_SAFE_IMAGE_DIMENSION}px to prevent browser out-of-memory crashes.`
    );
  }

  const mp = (w * h) / 1_000_000;
  if (mp > MAX_SAFE_MEGAPIXELS) {
    throw new Error(
      `Image size (${mp.toFixed(1)} MP) exceeds maximum safe limit of ${MAX_SAFE_MEGAPIXELS} MP.`
    );
  }

  // 2. Load original image
  const img = await loadImageElement(src);
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  // 3. Multi-Pass Step-Down or Standard Resampling
  let resultCanvas: HTMLCanvasElement;

  const isDownsamplingSignificantly = w < origW * 0.5 || h < origH * 0.5;

  if (
    (algorithm === 'lanczos_step' || algorithm === 'automatic') &&
    isDownsamplingSignificantly
  ) {
    // Multi-pass step-down downsampling:
    // Progressively halves dimensions by 2x until within 2x of target to prevent moiré / aliasing
    resultCanvas = progressiveStepDownResample(img, origW, origH, w, h);
    if (algorithm === 'automatic') {
      const stepCtx = resultCanvas.getContext('2d');
      if (stepCtx) applyUnsharpMask(stepCtx, w, h, 0.25);
    }
  } else {
    // Direct Canvas 2D Resampling with selected filter algorithm
    resultCanvas = document.createElement('canvas');
    resultCanvas.width = w;
    resultCanvas.height = h;
    const ctx = resultCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not obtain Canvas 2D context for image resampling.');

    // Ensure pristine transparency (no default background)
    ctx.clearRect(0, 0, w, h);

    // Configure interpolation algorithm
    if (algorithm === 'nearest') {
      // Nearest Neighbor: ideal for pixel art, crisp logos, sharp retro scaling
      ctx.imageSmoothingEnabled = false;
    } else if (algorithm === 'bilinear') {
      // Standard Bilinear
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';
    } else {
      // High Quality Bicubic / Smooth
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    // Draw the image scaled to the exact destination pixel buffer
    ctx.drawImage(img, 0, 0, w, h);

    // Post-resample edge enhancement/filtering
    if (algorithm === 'bicubic_sharper') {
      applyUnsharpMask(ctx, w, h, 0.32);
    } else if (algorithm === 'bicubic_smoother') {
      applyGentleSmoothing(ctx, w, h);
    }
  }

  // 4. Encode to Data URL and Blob
  const mimeType = outputFormat === 'image/jpeg' ? 'image/jpeg' : 'image/png';
  const dataUrl = resultCanvas.toDataURL(mimeType, quality);

  const blob = await new Promise<Blob>((resolve, reject) => {
    resultCanvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to encode resampled canvas to Blob'));
      },
      mimeType,
      quality
    );
  });

  // 5. Self-verification probe
  // Confirm that loading the resulting dataURL produces the exact target pixel dimensions
  const verifyImg = await loadImageElement(dataUrl);
  if (verifyImg.naturalWidth !== w || verifyImg.naturalHeight !== h) {
    console.warn(
      `Bitmap dimension mismatch in verification: expected ${w}×${h}, got ${verifyImg.naturalWidth}×${verifyImg.naturalHeight}`
    );
  }

  return {
    dataUrl,
    blob,
    width: w,
    height: h,
    megapixels: Number(mp.toFixed(2)),
    aspectRatio: w / (h || 1),
    byteSize: blob.size,
    algorithmUsed: algorithm,
  };
}

/**
 * Progressively scales down an image in halving steps (0.5x) to eliminate aliasing and moiré artifacts
 */
function progressiveStepDownResample(
  source: HTMLImageElement | HTMLCanvasElement,
  srcW: number,
  srcH: number,
  targetW: number,
  targetH: number
): HTMLCanvasElement {
  let curW = srcW;
  let curH = srcH;
  let curSource: HTMLImageElement | HTMLCanvasElement = source;

  // While current size is more than double target size in either dimension, halve it
  while (curW * 0.5 > targetW && curH * 0.5 > targetH) {
    const nextW = Math.max(targetW, Math.floor(curW * 0.5));
    const nextH = Math.max(targetH, Math.floor(curH * 0.5));

    const stepCanvas = document.createElement('canvas');
    stepCanvas.width = nextW;
    stepCanvas.height = nextH;
    const stepCtx = stepCanvas.getContext('2d', { willReadFrequently: true });
    if (!stepCtx) break;

    stepCtx.clearRect(0, 0, nextW, nextH);
    stepCtx.imageSmoothingEnabled = true;
    stepCtx.imageSmoothingQuality = 'high';
    stepCtx.drawImage(curSource, 0, 0, nextW, nextH);

    curSource = stepCanvas;
    curW = nextW;
    curH = nextH;
  }

  // Final step to exact target dimensions
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetW;
  finalCanvas.height = targetH;
  const finalCtx = finalCanvas.getContext('2d', { willReadFrequently: true });
  if (!finalCtx) return curSource as HTMLCanvasElement;

  finalCtx.clearRect(0, 0, targetW, targetH);
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';
  finalCtx.drawImage(curSource, 0, 0, targetW, targetH);

  return finalCanvas;
}

/**
 * Scales all layers and their coordinate systems proportionally when Resample is enabled in Image Size.
 * Document-level operation: transforms the entire document coordinate system consistently.
 */
export async function resampleDocumentLayers(
  layers: Layer[],
  oldWidth: number,
  oldHeight: number,
  newWidth: number,
  newHeight: number,
  algorithm: ResampleAlgorithm = 'automatic',
  scaleLayerStyles: boolean = true
): Promise<Layer[]> {
  const scaleX = newWidth / Math.max(1, oldWidth);
  const scaleY = newHeight / Math.max(1, oldHeight);
  const avgScale = (scaleX + scaleY) / 2;

  const updatedLayers: Layer[] = [];

  for (const layer of layers) {
    const updated: Layer = {
      ...layer,
      x: Math.round(layer.x * scaleX),
      y: Math.round(layer.y * scaleY),
      width: Math.max(1, Math.round(layer.width * scaleX)),
      height: Math.max(1, Math.round(layer.height * scaleY)),
    };

    // If Image Layer, also resample its underlying bitmap so true pixel count changes!
    if (layer.type === 'image' && layer.source) {
      try {
        const targetBitmapW = Math.max(1, Math.round((layer.bitmapWidth || layer.width) * scaleX));
        const targetBitmapH = Math.max(1, Math.round((layer.bitmapHeight || layer.height) * scaleY));
        const resampled = await resampleImageBitmap(layer.source, {
          targetWidth: targetBitmapW,
          targetHeight: targetBitmapH,
          algorithm,
        });
        updated.source = resampled.dataUrl;
        updated.bitmapWidth = resampled.width;
        updated.bitmapHeight = resampled.height;
      } catch (err) {
        console.warn(`Failed to resample bitmap for layer ${layer.id}, preserving existing source:`, err);
        updated.bitmapWidth = Math.max(1, Math.round((layer.bitmapWidth || layer.width) * scaleX));
        updated.bitmapHeight = Math.max(1, Math.round((layer.bitmapHeight || layer.height) * scaleY));
      }
    }

    // If Text Layer, scale fontSize
    if (layer.type === 'text' && layer.textConfig && scaleLayerStyles) {
      updated.textConfig = {
        ...layer.textConfig,
        fontSize: Math.max(8, Math.round(layer.textConfig.fontSize * avgScale)),
      };
    }

    // If Shape Layer, scale strokeWidth and radius
    if (layer.type === 'shape' && layer.shapeConfig && scaleLayerStyles) {
      updated.shapeConfig = {
        ...layer.shapeConfig,
        strokeWidth: Math.max(1, Math.round((layer.shapeConfig.strokeWidth || 1) * avgScale)),
      };
    }

    // If Drawing Layer, scale drawing path points and sizes
    if (layer.type === 'drawing' && layer.drawingPaths) {
      updated.drawingPaths = layer.drawingPaths.map((path) => ({
        ...path,
        size: Math.max(1, Math.round(path.size * avgScale)),
        points: path.points.map((pt) => ({
          x: pt.x * scaleX,
          y: pt.y * scaleY,
        })),
      }));
    }

    // If Vector Path Layer, scale points, handles, and strokeWidth
    if (layer.type === 'path' && layer.pathConfig) {
      updated.pathConfig = {
        ...layer.pathConfig,
        strokeWidth: scaleLayerStyles
          ? Math.max(1, Math.round((layer.pathConfig.strokeWidth || 1) * avgScale))
          : layer.pathConfig.strokeWidth,
        points: layer.pathConfig.points.map((pt) => ({
          ...pt,
          x: pt.x * scaleX,
          y: pt.y * scaleY,
          handleIn: pt.handleIn
            ? { x: pt.handleIn.x * scaleX, y: pt.handleIn.y * scaleY }
            : null,
          handleOut: pt.handleOut
            ? { x: pt.handleOut.x * scaleX, y: pt.handleOut.y * scaleY }
            : null,
        })),
      };
    }

    // If Effect Layer with effectMask (from Smart Eraser), resample mask bitmap to match new document dimensions!
    if (layer.type === 'effect' && layer.effectMask) {
      try {
        const resampledMask = await resampleImageBitmap(layer.effectMask, {
          targetWidth: newWidth,
          targetHeight: newHeight,
          algorithm: 'bilinear',
        });
        updated.effectMask = resampledMask.dataUrl;
        updated.width = newWidth;
        updated.height = newHeight;
        updated.x = 0;
        updated.y = 0;
      } catch (e) {
        console.warn('Failed to resample effectMask:', e);
      }
    }

    updatedLayers.push(updated);
  }

  return updatedLayers;
}

/**
 * Calculates layer coordinate offsets for Canvas Size according to the 9-point Anchor grid.
 * Preserves all image and layer pixel dimensions 100%!
 */
export async function offsetLayersForCanvasResize(
  layers: Layer[],
  oldWidth: number,
  oldHeight: number,
  newWidth: number,
  newHeight: number,
  anchor: CanvasAnchorPosition
): Promise<Layer[]> {
  if (!Array.isArray(layers)) return [];

  const safeOldW = Math.max(1, Math.round(oldWidth));
  const safeOldH = Math.max(1, Math.round(oldHeight));
  const safeNewW = Math.max(1, Math.round(newWidth));
  const safeNewH = Math.max(1, Math.round(newHeight));

  const diffW = safeNewW - safeOldW;
  const diffH = safeNewH - safeOldH;

  let dx = 0;
  let dy = 0;

  switch (anchor) {
    case 'top_left':
      dx = 0;
      dy = 0;
      break;
    case 'top':
      dx = Math.round(diffW / 2);
      dy = 0;
      break;
    case 'top_right':
      dx = diffW;
      dy = 0;
      break;
    case 'left':
      dx = 0;
      dy = Math.round(diffH / 2);
      break;
    case 'center':
      dx = Math.round(diffW / 2);
      dy = Math.round(diffH / 2);
      break;
    case 'right':
      dx = diffW;
      dy = Math.round(diffH / 2);
      break;
    case 'bottom_left':
      dx = 0;
      dy = diffH;
      break;
    case 'bottom':
      dx = Math.round(diffW / 2);
      dy = diffH;
      break;
    case 'bottom_right':
      dx = diffW;
      dy = diffH;
      break;
    default:
      dx = Math.round(diffW / 2);
      dy = Math.round(diffH / 2);
      break;
  }

  // Offset layers:
  // 1. All non-effect layers (image, text, shape, drawing) retain their exact pixel content and dimensions.
  //    Only document coordinate positions (x, y) are updated according to anchor offset (dx, dy).
  // 2. Full-canvas Effect layers span the entire document (0, 0, newWidth, newHeight).
  //    If an effect layer has an effectMask (from Smart Eraser), the mask is positioned by (dx, dy)
  //    on a canvas of size (newWidth, newHeight) preserving erased transparent pixels and filling new areas with white (full effect).
  return Promise.all(
    layers.map(async (layer) => {
      if (layer.type !== 'effect') {
        return {
          ...layer,
          x: Math.round((layer.x || 0) + dx),
          y: Math.round((layer.y || 0) + dy),
        };
      }

      // Effect layer:
      const updatedEffect: Layer = {
        ...layer,
        x: 0,
        y: 0,
        width: safeNewW,
        height: safeNewH,
      };

      if (layer.effectMask) {
        try {
          const img = await loadImageElement(layer.effectMask);
          const canvas = document.createElement('canvas');
          canvas.width = safeNewW;
          canvas.height = safeNewH;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Fill new canvas with white (full effect alpha for new canvas areas)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, safeNewW, safeNewH);
            // Clear the region where the old mask was, to allow erased transparent pixels to remain transparent
            ctx.clearRect(dx, dy, safeOldW, safeOldH);
            // Draw previous mask at offset (dx, dy)
            ctx.drawImage(img, dx, dy);
            updatedEffect.effectMask = canvas.toDataURL('image/png');
          }
        } catch (e) {
          console.warn('Failed to offset effectMask for canvas resize:', e);
        }
      }

      return updatedEffect;
    })
  );
}
