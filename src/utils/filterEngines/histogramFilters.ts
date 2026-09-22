/**
 * Global & Histogram Image Filters
 * 51. Histogram Equalization
 * 52. CLAHE (Contrast Limited Adaptive Histogram Equalization)
 * 53. Histogram Stretching
 * 54. Histogram Matching
 * 55. Global Threshold (Otsu's Method)
 */

export interface HistogramFilterParams {
  clipLimit?: number;
  gridSize?: number;
  lowPercentile?: number;
  highPercentile?: number;
}

/**
 * Global Histogram Equalization on Luminance channel
 */
export function applyHistogramEqualization(
  data: Uint8ClampedArray,
  k: number
) {
  const len = data.length;
  const hist = new Uint32Array(256);
  let validCount = 0;

  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    hist[lum]++;
    validCount++;
  }

  if (validCount === 0) return;

  // Cumulative distribution function (CDF)
  const cdf = new Float32Array(256);
  let accum = 0;
  let minCdf = -1;

  for (let i = 0; i < 256; i++) {
    accum += hist[i];
    cdf[i] = accum / validCount;
    if (cdf[i] > 0 && minCdf === -1) {
      minCdf = cdf[i];
    }
  }

  // Equalization mapping LUT
  const lut = new Uint8Array(256);
  const denom = 1.0 - minCdf || 1;
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.round(Math.min(255, Math.max(0, ((cdf[i] - minCdf) / denom) * 255)));
  }

  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    const newLum = lut[lum];
    const ratio = lum === 0 ? 1 : newLum / lum;

    const eqR = Math.min(255, Math.max(0, Math.round(r * ratio)));
    const eqG = Math.min(255, Math.max(0, Math.round(g * ratio)));
    const eqB = Math.min(255, Math.max(0, Math.round(b * ratio)));

    data[i] = Math.round(r + (eqR - r) * k);
    data[i + 1] = Math.round(g + (eqG - g) * k);
    data[i + 2] = Math.round(b + (eqB - b) * k);
  }
}

/**
 * Contrast Limited Adaptive Histogram Equalization (CLAHE)
 * Divides into grid tiles, clips histogram, computes CDFs, bilinearly interpolates
 */
export function applyCLAHE(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  clipLimit: number = 2.0,
  gridSize: number = 8
) {
  const tilesX = Math.max(2, Math.min(16, gridSize));
  const tilesY = Math.max(2, Math.min(16, gridSize));
  const tileW = width / tilesX;
  const tileH = height / tilesY;

  // Extract luminance
  const total = width * height;
  const lum = new Uint8Array(total);
  for (let i = 0, p = 0; i < total; i++, p += 4) {
    lum[i] = Math.round(0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]);
  }

  // Precompute tile mapping LUTs
  const cdfs: Uint8Array[] = [];
  const actualClip = Math.max(1.0, clipLimit);

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const hist = new Uint32Array(256);
      const startX = Math.floor(tx * tileW);
      const endX = Math.floor((tx + 1) * tileW);
      const startY = Math.floor(ty * tileH);
      const endY = Math.floor((ty + 1) * tileH);
      let count = 0;

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          hist[lum[y * width + x]]++;
          count++;
        }
      }

      // Clip histogram
      const clipVal = Math.round((actualClip * count) / 256);
      let excess = 0;
      for (let i = 0; i < 256; i++) {
        if (hist[i] > clipVal) {
          excess += hist[i] - clipVal;
          hist[i] = clipVal;
        }
      }

      // Redistribute excess
      const addPerBin = Math.floor(excess / 256);
      for (let i = 0; i < 256; i++) hist[i] += addPerBin;

      // Compute CDF
      const lut = new Uint8Array(256);
      let sum = 0;
      for (let i = 0; i < 256; i++) {
        sum += hist[i];
        lut[i] = Math.min(255, Math.round((sum / (count || 1)) * 255));
      }

      cdfs.push(lut);
    }
  }

  // Bilinear interpolation of mapped values
  for (let y = 0; y < height; y++) {
    const normY = (y / tileH) - 0.5;
    const ty1 = Math.max(0, Math.min(tilesY - 1, Math.floor(normY)));
    const ty2 = Math.min(tilesY - 1, ty1 + 1);
    const wy = Math.max(0, Math.min(1, normY - ty1));

    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      if (data[p + 3] === 0) continue;

      const normX = (x / tileW) - 0.5;
      const tx1 = Math.max(0, Math.min(tilesX - 1, Math.floor(normX)));
      const tx2 = Math.min(tilesX - 1, tx1 + 1);
      const wx = Math.max(0, Math.min(1, normX - tx1));

      const v = lum[y * width + x];

      const c11 = cdfs[ty1 * tilesX + tx1][v];
      const c21 = cdfs[ty1 * tilesX + tx2][v];
      const c12 = cdfs[ty2 * tilesX + tx1][v];
      const c22 = cdfs[ty2 * tilesX + tx2][v];

      // Bilinear interpolation formula
      const top = c11 * (1 - wx) + c21 * wx;
      const bottom = c12 * (1 - wx) + c22 * wx;
      const newLum = top * (1 - wy) + bottom * wy;

      const ratio = v === 0 ? 1 : newLum / v;
      const clR = Math.min(255, Math.max(0, Math.round(data[p] * ratio)));
      const clG = Math.min(255, Math.max(0, Math.round(data[p + 1] * ratio)));
      const clB = Math.min(255, Math.max(0, Math.round(data[p + 2] * ratio)));

      data[p] = Math.round(data[p] + (clR - data[p]) * k);
      data[p + 1] = Math.round(data[p + 1] + (clG - data[p + 1]) * k);
      data[p + 2] = Math.round(data[p + 2] + (clB - data[p + 2]) * k);
    }
  }
}

/**
 * Histogram Stretching (Min-Max contrast stretching)
 */
export function applyHistogramStretching(
  data: Uint8ClampedArray,
  k: number,
  lowPercentile: number = 1,
  highPercentile: number = 99
) {
  const len = data.length;
  const hist = new Uint32Array(256);
  let total = 0;

  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    hist[lum]++;
    total++;
  }

  if (total === 0) return;

  const lowCut = (lowPercentile / 100) * total;
  const highCut = (highPercentile / 100) * total;

  let minVal = 0;
  let maxVal = 255;
  let accum = 0;

  for (let i = 0; i < 256; i++) {
    accum += hist[i];
    if (accum >= lowCut) {
      minVal = i;
      break;
    }
  }

  accum = 0;
  for (let i = 0; i < 256; i++) {
    accum += hist[i];
    if (accum >= highCut) {
      maxVal = i;
      break;
    }
  }

  const range = maxVal - minVal || 1;
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.min(255, Math.max(0, Math.round(((i - minVal) / range) * 255)));
  }

  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    const newLum = lut[lum];
    const ratio = lum === 0 ? 1 : newLum / lum;

    const strR = Math.min(255, Math.max(0, Math.round(r * ratio)));
    const strG = Math.min(255, Math.max(0, Math.round(g * ratio)));
    const strB = Math.min(255, Math.max(0, Math.round(b * ratio)));

    data[i] = Math.round(r + (strR - r) * k);
    data[i + 1] = Math.round(g + (strG - g) * k);
    data[i + 2] = Math.round(b + (strB - b) * k);
  }
}

/**
 * Histogram Matching (Specification to a balanced bell curve)
 */
export function applyHistogramMatching(
  data: Uint8ClampedArray,
  k: number
) {
  const len = data.length;
  const hist = new Uint32Array(256);
  let total = 0;

  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    hist[lum]++;
    total++;
  }

  if (total === 0) return;

  const cdfSrc = new Float32Array(256);
  let accum = 0;
  for (let i = 0; i < 256; i++) {
    accum += hist[i];
    cdfSrc[i] = accum / total;
  }

  // Reference CDF: Gaussian bell curve centered at 128
  const cdfRef = new Float32Array(256);
  let refAccum = 0;
  for (let i = 0; i < 256; i++) {
    const diff = (i - 128) / 50;
    const p = Math.exp(-0.5 * diff * diff);
    refAccum += p;
    cdfRef[i] = refAccum;
  }
  for (let i = 0; i < 256; i++) cdfRef[i] /= refAccum;

  // Matching LUT: for each source bin, find closest target CDF
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const targetVal = cdfSrc[i];
    let bestIdx = 0;
    let minDiff = Infinity;
    for (let j = 0; j < 256; j++) {
      const d = Math.abs(cdfRef[j] - targetVal);
      if (d < minDiff) {
        minDiff = d;
        bestIdx = j;
      }
    }
    lut[i] = bestIdx;
  }

  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    const newLum = lut[lum];
    const ratio = lum === 0 ? 1 : newLum / lum;

    const mR = Math.min(255, Math.max(0, Math.round(r * ratio)));
    const mG = Math.min(255, Math.max(0, Math.round(g * ratio)));
    const mB = Math.min(255, Math.max(0, Math.round(b * ratio)));

    data[i] = Math.round(r + (mR - r) * k);
    data[i + 1] = Math.round(g + (mG - g) * k);
    data[i + 2] = Math.round(b + (mB - b) * k);
  }
}

/**
 * Global Threshold using Otsu's Algorithm
 * Computes threshold that maximizes between-class variance
 */
export function applyGlobalThresholdOtsu(
  data: Uint8ClampedArray,
  k: number
) {
  const len = data.length;
  const hist = new Uint32Array(256);
  let total = 0;

  for (let i = 0; i < len; i += 4) {
    if (data[i + 3] === 0) continue;
    const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    hist[lum]++;
    total++;
  }

  if (total === 0) return;

  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let varMax = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    wF = total - wB;
    if (wF === 0) break;

    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const varBetween = wB * wF * (mB - mF) * (mB - mF);
    if (varBetween > varMax) {
      varMax = varBetween;
      threshold = t;
    }
  }

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
