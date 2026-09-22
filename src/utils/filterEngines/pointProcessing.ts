/**
 * Point Processing Image Filters
 * 1. Grayscale
 * 2. Invert
 * 3. Binary Threshold
 * 4. Adaptive Threshold
 * 5. Posterize
 * 6. Solarize
 * 7. Gamma
 * 8. Log Transform
 * 9. Power-Law Transform
 * 10. Color Quantization
 */

export interface PointFilterParams {
  threshold?: number;
  blockSize?: number;
  constant?: number;
  levels?: number;
  gamma?: number;
  scale?: number;
  colors?: number;
}

export function applyGrayscale(data: Uint8ClampedArray, k: number) {
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    data[i] = Math.round(r + (gray - r) * k);
    data[i + 1] = Math.round(g + (gray - g) * k);
    data[i + 2] = Math.round(b + (gray - b) * k);
  }
}

export function applyInvert(data: Uint8ClampedArray, k: number) {
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const invR = 255 - r;
    const invG = 255 - g;
    const invB = 255 - b;
    data[i] = Math.round(r + (invR - r) * k);
    data[i + 1] = Math.round(g + (invG - g) * k);
    data[i + 2] = Math.round(b + (invB - b) * k);
  }
}

export function applyBinaryThreshold(
  data: Uint8ClampedArray,
  k: number,
  threshold: number = 128
) {
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const bin = lum >= threshold ? 255 : 0;
    data[i] = Math.round(r + (bin - r) * k);
    data[i + 1] = Math.round(g + (bin - g) * k);
    data[i + 2] = Math.round(b + (bin - b) * k);
  }
}

export function applyAdaptiveThreshold(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  blockSize: number = 15,
  constant: number = 5
) {
  const total = width * height;
  const lum = new Float32Array(total);

  for (let i = 0, p = 0; i < total; i++, p += 4) {
    lum[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  }

  // Compute integral image for fast O(1) box mean
  const integral = new Float64Array((width + 1) * (height + 1));
  const stride = width + 1;

  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      rowSum += lum[y * width + x];
      integral[(y + 1) * stride + (x + 1)] =
        integral[y * stride + (x + 1)] + rowSum;
    }
  }

  const radius = Math.max(1, Math.floor(blockSize / 2));

  for (let y = 0; y < height; y++) {
    const y0 = Math.max(0, y - radius);
    const y1 = Math.min(height - 1, y + radius);
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] === 0) continue;

      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(width - 1, x + radius);
      const count = (x1 - x0 + 1) * (y1 - y0 + 1);

      const sum =
        integral[(y1 + 1) * stride + (x1 + 1)] -
        integral[y0 * stride + (x1 + 1)] -
        integral[(y1 + 1) * stride + x0] +
        integral[y0 * stride + x0];

      const mean = sum / count;
      const targetVal = lum[y * width + x] >= mean - constant ? 255 : 0;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      data[idx] = Math.round(r + (targetVal - r) * k);
      data[idx + 1] = Math.round(g + (targetVal - g) * k);
      data[idx + 2] = Math.round(b + (targetVal - b) * k);
    }
  }
}

export function applyPosterize(
  data: Uint8ClampedArray,
  k: number,
  levels: number = 4
) {
  const numLevels = Math.max(2, Math.min(16, Math.round(levels)));
  const step = 255 / (numLevels - 1);
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const postR = Math.round(Math.round(r / (256 / numLevels)) * step);
    const postG = Math.round(Math.round(g / (256 / numLevels)) * step);
    const postB = Math.round(Math.round(b / (256 / numLevels)) * step);

    data[i] = Math.round(r + (postR - r) * k);
    data[i + 1] = Math.round(g + (postG - g) * k);
    data[i + 2] = Math.round(b + (postB - b) * k);
  }
}

export function applySolarize(
  data: Uint8ClampedArray,
  k: number,
  threshold: number = 128
) {
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const solR = r > threshold ? 255 - r : r;
    const solG = g > threshold ? 255 - g : g;
    const solB = b > threshold ? 255 - b : b;

    data[i] = Math.round(r + (solR - r) * k);
    data[i + 1] = Math.round(g + (solG - g) * k);
    data[i + 2] = Math.round(b + (solB - b) * k);
  }
}

export function applyGamma(
  data: Uint8ClampedArray,
  k: number,
  gamma: number = 1.5
) {
  const gVal = Math.max(0.1, Math.min(4.0, gamma));
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.round(255 * Math.pow(i / 255, gVal));
  }

  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const tr = lut[r];
    const tg = lut[g];
    const tb = lut[b];

    data[i] = Math.round(r + (tr - r) * k);
    data[i + 1] = Math.round(g + (tg - g) * k);
    data[i + 2] = Math.round(b + (tb - b) * k);
  }
}

export function applyLogTransform(
  data: Uint8ClampedArray,
  k: number,
  scale: number = 1.0
) {
  const c = Math.max(0.1, Math.min(3.0, scale));
  const factor = (255 / Math.log(256)) * c;
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.min(255, Math.max(0, Math.round(factor * Math.log(1 + i))));
  }

  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    data[i] = Math.round(r + (lut[r] - r) * k);
    data[i + 1] = Math.round(g + (lut[g] - g) * k);
    data[i + 2] = Math.round(b + (lut[b] - b) * k);
  }
}

export function applyPowerLaw(
  data: Uint8ClampedArray,
  k: number,
  gamma: number = 0.8,
  constant: number = 1.0
) {
  const g = Math.max(0.1, Math.min(3.0, gamma));
  const c = Math.max(0.1, Math.min(2.0, constant));
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.min(255, Math.max(0, Math.round(255 * c * Math.pow(i / 255, g))));
  }

  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    data[i] = Math.round(r + (lut[r] - r) * k);
    data[i + 1] = Math.round(g + (lut[g] - g) * k);
    data[i + 2] = Math.round(b + (lut[b] - b) * k);
  }
}

export function applyColorQuantization(
  data: Uint8ClampedArray,
  k: number,
  colors: number = 16
) {
  // Quantize RGB channels uniformly into clusters
  const levelsPerChannel = Math.max(2, Math.min(8, Math.round(Math.cbrt(colors))));
  const step = 255 / (levelsPerChannel - 1);
  const qFactor = 256 / levelsPerChannel;

  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const qr = Math.min(255, Math.round(Math.floor(r / qFactor) * step));
    const qg = Math.min(255, Math.round(Math.floor(g / qFactor) * step));
    const qb = Math.min(255, Math.round(Math.floor(b / qFactor) * step));

    data[i] = Math.round(r + (qr - r) * k);
    data[i + 1] = Math.round(g + (qg - g) * k);
    data[i + 2] = Math.round(b + (qb - b) * k);
  }
}
