/**
 * Morphological Image Filters
 * 43. Erosion
 * 44. Dilation
 * 45. Opening
 * 46. Closing
 * 47. Morphological Gradient
 * 48. Top Hat
 * 49. Black Hat
 * 50. Boundary Extraction
 */

export interface MorphologyFilterParams {
  kernelSize?: number;
  shape?: 'square' | 'cross' | 'disk';
  iterations?: number;
}

/**
 * Creates structural element mask
 */
function getStructuringElement(
  radius: number,
  shape: 'square' | 'cross' | 'disk' = 'square'
): { dx: number; dy: number }[] {
  const points: { dx: number; dy: number }[] = [];
  const rSq = radius * radius;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (shape === 'square') {
        points.push({ dx, dy });
      } else if (shape === 'cross') {
        if (dx === 0 || dy === 0) points.push({ dx, dy });
      } else if (shape === 'disk') {
        if (dx * dx + dy * dy <= rSq) points.push({ dx, dy });
      }
    }
  }
  return points;
}

/**
 * Greyscale erosion on RGB channels
 */
function erodeBuffer(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  width: number,
  height: number,
  se: { dx: number; dy: number }[]
) {
  const seLen = se.length;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      if (src[p + 3] === 0) {
        dst[p] = 0;
        dst[p + 1] = 0;
        dst[p + 2] = 0;
        dst[p + 3] = 0;
        continue;
      }

      let minR = 255, minG = 255, minB = 255;
      for (let i = 0; i < seLen; i++) {
        const nx = Math.max(0, Math.min(width - 1, x + se[i].dx));
        const ny = Math.max(0, Math.min(height - 1, y + se[i].dy));
        const np = (ny * width + nx) * 4;

        if (src[np] < minR) minR = src[np];
        if (src[np + 1] < minG) minG = src[np + 1];
        if (src[np + 2] < minB) minB = src[np + 2];
      }

      dst[p] = minR;
      dst[p + 1] = minG;
      dst[p + 2] = minB;
      dst[p + 3] = src[p + 3];
    }
  }
}

/**
 * Greyscale dilation on RGB channels
 */
function dilateBuffer(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  width: number,
  height: number,
  se: { dx: number; dy: number }[]
) {
  const seLen = se.length;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      if (src[p + 3] === 0) {
        dst[p] = 0;
        dst[p + 1] = 0;
        dst[p + 2] = 0;
        dst[p + 3] = 0;
        continue;
      }

      let maxR = 0, maxG = 0, maxB = 0;
      for (let i = 0; i < seLen; i++) {
        const nx = Math.max(0, Math.min(width - 1, x + se[i].dx));
        const ny = Math.max(0, Math.min(height - 1, y + se[i].dy));
        const np = (ny * width + nx) * 4;

        if (src[np] > maxR) maxR = src[np];
        if (src[np + 1] > maxG) maxG = src[np + 1];
        if (src[np + 2] > maxB) maxB = src[np + 2];
      }

      dst[p] = maxR;
      dst[p + 1] = maxG;
      dst[p + 2] = maxB;
      dst[p + 3] = src[p + 3];
    }
  }
}

export function applyErosion(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  kernelSize: number = 3,
  shape: 'square' | 'cross' | 'disk' = 'square'
) {
  const radius = Math.max(1, Math.min(5, Math.floor(kernelSize / 2)));
  const se = getStructuringElement(radius, shape);
  const src = new Uint8ClampedArray(data);
  const dst = new Uint8ClampedArray(data.length);

  erodeBuffer(src, dst, width, height, se);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    data[i] = Math.round(data[i] + (dst[i] - data[i]) * k);
    data[i + 1] = Math.round(data[i + 1] + (dst[i + 1] - data[i + 1]) * k);
    data[i + 2] = Math.round(data[i + 2] + (dst[i + 2] - data[i + 2]) * k);
  }
}

export function applyDilation(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  kernelSize: number = 3,
  shape: 'square' | 'cross' | 'disk' = 'square'
) {
  const radius = Math.max(1, Math.min(5, Math.floor(kernelSize / 2)));
  const se = getStructuringElement(radius, shape);
  const src = new Uint8ClampedArray(data);
  const dst = new Uint8ClampedArray(data.length);

  dilateBuffer(src, dst, width, height, se);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    data[i] = Math.round(data[i] + (dst[i] - data[i]) * k);
    data[i + 1] = Math.round(data[i + 1] + (dst[i + 1] - data[i + 1]) * k);
    data[i + 2] = Math.round(data[i + 2] + (dst[i + 2] - data[i + 2]) * k);
  }
}

export function applyOpening(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  kernelSize: number = 3,
  shape: 'square' | 'cross' | 'disk' = 'square'
) {
  const radius = Math.max(1, Math.min(5, Math.floor(kernelSize / 2)));
  const se = getStructuringElement(radius, shape);
  const src = new Uint8ClampedArray(data);
  const eroded = new Uint8ClampedArray(data.length);
  const opened = new Uint8ClampedArray(data.length);

  erodeBuffer(src, eroded, width, height, se);
  dilateBuffer(eroded, opened, width, height, se);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    data[i] = Math.round(data[i] + (opened[i] - data[i]) * k);
    data[i + 1] = Math.round(data[i + 1] + (opened[i + 1] - data[i + 1]) * k);
    data[i + 2] = Math.round(data[i + 2] + (opened[i + 2] - data[i + 2]) * k);
  }
}

export function applyClosing(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  kernelSize: number = 3,
  shape: 'square' | 'cross' | 'disk' = 'square'
) {
  const radius = Math.max(1, Math.min(5, Math.floor(kernelSize / 2)));
  const se = getStructuringElement(radius, shape);
  const src = new Uint8ClampedArray(data);
  const dilated = new Uint8ClampedArray(data.length);
  const closed = new Uint8ClampedArray(data.length);

  dilateBuffer(src, dilated, width, height, se);
  erodeBuffer(dilated, closed, width, height, se);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    data[i] = Math.round(data[i] + (closed[i] - data[i]) * k);
    data[i + 1] = Math.round(data[i + 1] + (closed[i + 1] - data[i + 1]) * k);
    data[i + 2] = Math.round(data[i + 2] + (closed[i + 2] - data[i + 2]) * k);
  }
}

export function applyMorphologicalGradient(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  kernelSize: number = 3,
  shape: 'square' | 'cross' | 'disk' = 'square'
) {
  const radius = Math.max(1, Math.min(5, Math.floor(kernelSize / 2)));
  const se = getStructuringElement(radius, shape);
  const src = new Uint8ClampedArray(data);
  const dilated = new Uint8ClampedArray(data.length);
  const eroded = new Uint8ClampedArray(data.length);

  dilateBuffer(src, dilated, width, height, se);
  erodeBuffer(src, eroded, width, height, se);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    for (let c = 0; c < 3; c++) {
      const grad = Math.min(255, Math.max(0, dilated[i + c] - eroded[i + c]));
      data[i + c] = Math.round(data[i + c] + (grad - data[i + c]) * k);
    }
  }
}

export function applyTopHat(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  kernelSize: number = 3,
  shape: 'square' | 'cross' | 'disk' = 'square'
) {
  const radius = Math.max(1, Math.min(5, Math.floor(kernelSize / 2)));
  const se = getStructuringElement(radius, shape);
  const src = new Uint8ClampedArray(data);
  const eroded = new Uint8ClampedArray(data.length);
  const opened = new Uint8ClampedArray(data.length);

  erodeBuffer(src, eroded, width, height, se);
  dilateBuffer(eroded, opened, width, height, se);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    for (let c = 0; c < 3; c++) {
      const tophat = Math.min(255, Math.max(0, src[i + c] - opened[i + c]));
      data[i + c] = Math.round(data[i + c] + (tophat - data[i + c]) * k);
    }
  }
}

export function applyBlackHat(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  kernelSize: number = 3,
  shape: 'square' | 'cross' | 'disk' = 'square'
) {
  const radius = Math.max(1, Math.min(5, Math.floor(kernelSize / 2)));
  const se = getStructuringElement(radius, shape);
  const src = new Uint8ClampedArray(data);
  const dilated = new Uint8ClampedArray(data.length);
  const closed = new Uint8ClampedArray(data.length);

  dilateBuffer(src, dilated, width, height, se);
  erodeBuffer(dilated, closed, width, height, se);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    for (let c = 0; c < 3; c++) {
      const blackhat = Math.min(255, Math.max(0, closed[i + c] - src[i + c]));
      data[i + c] = Math.round(data[i + c] + (blackhat - data[i + c]) * k);
    }
  }
}

export function applyBoundaryExtraction(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  kernelSize: number = 3,
  shape: 'square' | 'cross' | 'disk' = 'square'
) {
  const radius = Math.max(1, Math.min(5, Math.floor(kernelSize / 2)));
  const se = getStructuringElement(radius, shape);
  const src = new Uint8ClampedArray(data);
  const eroded = new Uint8ClampedArray(data.length);

  erodeBuffer(src, eroded, width, height, se);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    for (let c = 0; c < 3; c++) {
      const bound = Math.min(255, Math.max(0, src[i + c] - eroded[i + c]));
      data[i + c] = Math.round(data[i + c] + (bound - data[i + c]) * k);
    }
  }
}
