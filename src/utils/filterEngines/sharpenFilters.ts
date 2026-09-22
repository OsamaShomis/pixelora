/**
 * Sharpening Filters
 * 24. Sharpen (Spatial 3x3 convolution)
 * 25. Unsharp Mask
 * 26. High Boost
 * 27. Laplacian Sharpen
 * 28. Detail Enhance
 */

import { applyGaussianBlur } from './spatialFilters';

export interface SharpenFilterParams {
  strength?: number;
  amount?: number;
  radius?: number;
  threshold?: number;
  boost?: number;
}

/**
 * Standard 3x3 Convolution Sharpen with strength blending
 */
export function applySpatialSharpen(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  strength: number = 50
) {
  const factor = (strength / 100) * 1.5;
  const src = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    const ym = Math.max(0, y - 1);
    const yp = Math.min(height - 1, y + 1);
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      if (src[p + 3] === 0) continue;

      const xm = Math.max(0, x - 1);
      const xp = Math.min(width - 1, x + 1);

      // 4-connected discrete Laplacian
      for (let c = 0; c < 3; c++) {
        const center = src[p + c];
        const up = src[(ym * width + x) * 4 + c];
        const down = src[(yp * width + x) * 4 + c];
        const left = src[(y * width + xm) * 4 + c];
        const right = src[(y * width + xp) * 4 + c];

        const laplacian = 4 * center - up - down - left - right;
        const sharpened = Math.min(255, Math.max(0, center + laplacian * factor));
        data[p + c] = Math.round(data[p + c] + (sharpened - data[p + c]) * k);
      }
    }
  }
}

/**
 * Optical Unsharp Mask
 * I_sharp = I + amount * (I - I_blur) if |I - I_blur| > threshold
 */
export function applyUnsharpMask(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  amount: number = 100,
  radius: number = 2,
  threshold: number = 0
) {
  const blurred = new Uint8ClampedArray(data);
  applyGaussianBlur(blurred, width, height, 1.0, radius, radius / 2);

  const amt = amount / 100;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;

    for (let c = 0; c < 3; c++) {
      const orig = data[i + c];
      const blur = blurred[i + c];
      const diff = orig - blur;

      if (Math.abs(diff) >= threshold) {
        const sharp = Math.min(255, Math.max(0, Math.round(orig + diff * amt)));
        data[i + c] = Math.round(orig + (sharp - orig) * k);
      }
    }
  }
}

/**
 * High Boost Filtering:
 * I_hb = A * I - I_blur = (A - 1) * I + (I - I_blur)
 */
export function applyHighBoost(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  boost: number = 1.5,
  radius: number = 2
) {
  const blurred = new Uint8ClampedArray(data);
  applyGaussianBlur(blurred, width, height, 1.0, radius, radius / 2);

  const A = Math.max(1.0, Math.min(3.0, boost));
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;

    for (let c = 0; c < 3; c++) {
      const orig = data[i + c];
      const blur = blurred[i + c];
      // High boost equation
      const val = Math.min(255, Math.max(0, Math.round(A * orig - blur)));
      data[i + c] = Math.round(orig + (val - orig) * k);
    }
  }
}

/**
 * Laplacian Sharpen: 8-connected discrete negative Laplacian subtraction
 */
export function applyLaplacianSharpen(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  strength: number = 50
) {
  const factor = (strength / 100) * 0.8;
  const src = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    const ym = Math.max(0, y - 1);
    const yp = Math.min(height - 1, y + 1);
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      if (src[p + 3] === 0) continue;

      const xm = Math.max(0, x - 1);
      const xp = Math.min(width - 1, x + 1);

      for (let c = 0; c < 3; c++) {
        const center = src[p + c];
        const sumNeighbors =
          src[(ym * width + xm) * 4 + c] +
          src[(ym * width + x) * 4 + c] +
          src[(ym * width + xp) * 4 + c] +
          src[(y * width + xm) * 4 + c] +
          src[(y * width + xp) * 4 + c] +
          src[(yp * width + xm) * 4 + c] +
          src[(yp * width + x) * 4 + c] +
          src[(yp * width + xp) * 4 + c];

        const lap = 8 * center - sumNeighbors;
        const outVal = Math.min(255, Math.max(0, center + lap * factor * 0.5));
        data[p + c] = Math.round(data[p + c] + (outVal - data[p + c]) * k);
      }
    }
  }
}

/**
 * Detail Enhance: Multi-scale frequency band separation and micro-contrast boost
 */
export function applyDetailEnhance(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  amount: number = 50,
  radius: number = 3
) {
  const fineBlur = new Uint8ClampedArray(data);
  const coarseBlur = new Uint8ClampedArray(data);

  applyGaussianBlur(fineBlur, width, height, 1.0, Math.max(1, Math.round(radius * 0.5)), 1.0);
  applyGaussianBlur(coarseBlur, width, height, 1.0, Math.max(2, Math.round(radius * 1.5)), 2.5);

  const amt = (amount / 100) * 1.2;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;

    for (let c = 0; c < 3; c++) {
      const orig = data[i + c];
      const fine = fineBlur[i + c];
      const coarse = coarseBlur[i + c];

      const microDetail = orig - fine;
      const mediumDetail = fine - coarse;

      const enhanced = Math.min(
        255,
        Math.max(0, Math.round(orig + microDetail * amt * 1.2 + mediumDetail * amt * 0.8))
      );
      data[i + c] = Math.round(orig + (enhanced - orig) * k);
    }
  }
}
