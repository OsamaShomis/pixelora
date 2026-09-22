/**
 * Noise Reduction Filters
 * 20. Noise Reduction (Spatial local variance smoothing)
 * 21. Wiener Filter (Adaptive local statistics)
 * 22. Adaptive Noise Reduction
 * 23. Salt-and-Pepper Noise Removal
 */

export interface NoiseFilterParams {
  strength?: number;
  radius?: number;
  windowSize?: number;
  noiseVariance?: number;
  sensitivity?: number;
  threshold?: number;
}

/**
 * Spatial Noise Reduction: smooths flat regions while preserving edges based on local variance
 */
export function applySpatialNoiseReduction(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  strength: number = 50,
  radius: number = 2
) {
  const r = Math.max(1, Math.min(4, Math.round(radius)));
  const factor = (strength / 100) * 0.8;
  const src = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      if (src[p + 3] === 0) continue;

      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      for (let dy = -r; dy <= r; dy++) {
        const py = Math.max(0, Math.min(height - 1, y + dy));
        for (let dx = -r; dx <= r; dx++) {
          const px = Math.max(0, Math.min(width - 1, x + dx));
          const sp = (py * width + px) * 4;
          sumR += src[sp];
          sumG += src[sp + 1];
          sumB += src[sp + 2];
          count++;
        }
      }

      const meanR = sumR / count;
      const meanG = sumG / count;
      const meanB = sumB / count;

      let varR = 0, varG = 0, varB = 0;
      for (let dy = -r; dy <= r; dy++) {
        const py = Math.max(0, Math.min(height - 1, y + dy));
        for (let dx = -r; dx <= r; dx++) {
          const px = Math.max(0, Math.min(width - 1, x + dx));
          const sp = (py * width + px) * 4;
          const diffR = src[sp] - meanR;
          const diffG = src[sp + 1] - meanG;
          const diffB = src[sp + 2] - meanB;
          varR += diffR * diffR;
          varG += diffG * diffG;
          varB += diffB * diffB;
        }
      }
      varR /= count;
      varG /= count;
      varB /= count;

      // Weight between mean and original based on local variance
      // Lower variance -> flat area -> apply more smoothing
      const wR = factor / (1 + varR * 0.01);
      const wG = factor / (1 + varG * 0.01);
      const wB = factor / (1 + varB * 0.01);

      const outR = src[p] * (1 - wR) + meanR * wR;
      const outG = src[p + 1] * (1 - wG) + meanG * wG;
      const outB = src[p + 2] * (1 - wB) + meanB * wB;

      data[p] = Math.round(data[p] + (outR - data[p]) * k);
      data[p + 1] = Math.round(data[p + 1] + (outG - data[p + 1]) * k);
      data[p + 2] = Math.round(data[p + 2] + (outB - data[p + 2]) * k);
    }
  }
}

/**
 * 2D Adaptive Wiener Filter
 * Calculates local mean and variance in NxN window:
 * O(x,y) = mu + max(0, var - noiseVar) / max(var, noiseVar) * (I(x,y) - mu)
 */
export function applyWienerFilter(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  windowSize: number = 5,
  noiseVariance: number = 100
) {
  const win = Math.max(3, Math.min(9, windowSize % 2 === 0 ? windowSize + 1 : windowSize));
  const r = Math.floor(win / 2);
  const nVar = Math.max(5, noiseVariance);
  const src = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      if (src[p + 3] === 0) continue;

      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      for (let dy = -r; dy <= r; dy++) {
        const py = Math.max(0, Math.min(height - 1, y + dy));
        for (let dx = -r; dx <= r; dx++) {
          const px = Math.max(0, Math.min(width - 1, x + dx));
          const sp = (py * width + px) * 4;
          sumR += src[sp];
          sumG += src[sp + 1];
          sumB += src[sp + 2];
          count++;
        }
      }

      const muR = sumR / count;
      const muG = sumG / count;
      const muB = sumB / count;

      let vR = 0, vG = 0, vB = 0;
      for (let dy = -r; dy <= r; dy++) {
        const py = Math.max(0, Math.min(height - 1, y + dy));
        for (let dx = -r; dx <= r; dx++) {
          const px = Math.max(0, Math.min(width - 1, x + dx));
          const sp = (py * width + px) * 4;
          const dR = src[sp] - muR;
          const dG = src[sp + 1] - muG;
          const dB = src[sp + 2] - muB;
          vR += dR * dR;
          vG += dG * dG;
          vB += dB * dB;
        }
      }
      vR /= count;
      vG /= count;
      vB /= count;

      const fR = Math.max(0, vR - nVar) / Math.max(vR, nVar);
      const fG = Math.max(0, vG - nVar) / Math.max(vG, nVar);
      const fB = Math.max(0, vB - nVar) / Math.max(vB, nVar);

      const outR = muR + fR * (src[p] - muR);
      const outG = muG + fG * (src[p + 1] - muG);
      const outB = muB + fB * (src[p + 2] - muB);

      data[p] = Math.round(data[p] + (outR - data[p]) * k);
      data[p + 1] = Math.round(data[p + 1] + (outG - data[p + 1]) * k);
      data[p + 2] = Math.round(data[p + 2] + (outB - data[p + 2]) * k);
    }
  }
}

/**
 * Adaptive Noise Reduction (Gradient-guided edge preserving)
 */
export function applyAdaptiveNoiseFilter(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  sensitivity: number = 50,
  radius: number = 2
) {
  const r = Math.max(1, Math.min(4, Math.round(radius)));
  const sens = Math.max(1, sensitivity);
  const src = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      if (src[p + 3] === 0) continue;

      // Estimate local gradient
      const xm = Math.max(0, x - 1);
      const xp = Math.min(width - 1, x + 1);
      const ym = Math.max(0, y - 1);
      const yp = Math.min(height - 1, y + 1);

      const dxLum =
        (src[(y * width + xp) * 4] - src[(y * width + xm) * 4]) * 0.299 +
        (src[(y * width + xp) * 4 + 1] - src[(y * width + xm) * 4 + 1]) * 0.587 +
        (src[(y * width + xp) * 4 + 2] - src[(y * width + xm) * 4 + 2]) * 0.114;

      const dyLum =
        (src[(yp * width + x) * 4] - src[(ym * width + x) * 4]) * 0.299 +
        (src[(yp * width + x) * 4 + 1] - src[(ym * width + x) * 4 + 1]) * 0.587 +
        (src[(yp * width + x) * 4 + 2] - src[(ym * width + x) * 4 + 2]) * 0.114;

      const grad = Math.sqrt(dxLum * dxLum + dyLum * dyLum);
      const edgeFactor = Math.exp(-grad / (sens * 0.5));

      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      for (let dy = -r; dy <= r; dy++) {
        const py = Math.max(0, Math.min(height - 1, y + dy));
        for (let dx = -r; dx <= r; dx++) {
          const px = Math.max(0, Math.min(width - 1, x + dx));
          const sp = (py * width + px) * 4;
          sumR += src[sp];
          sumG += src[sp + 1];
          sumB += src[sp + 2];
          count++;
        }
      }

      const meanR = sumR / count;
      const meanG = sumG / count;
      const meanB = sumB / count;

      const outR = src[p] * (1 - edgeFactor) + meanR * edgeFactor;
      const outG = src[p + 1] * (1 - edgeFactor) + meanG * edgeFactor;
      const outB = src[p + 2] * (1 - edgeFactor) + meanB * edgeFactor;

      data[p] = Math.round(data[p] + (outR - data[p]) * k);
      data[p + 1] = Math.round(data[p + 1] + (outG - data[p + 1]) * k);
      data[p + 2] = Math.round(data[p + 2] + (outB - data[p + 2]) * k);
    }
  }
}

/**
 * Salt-and-Pepper Noise Removal
 * Detects extreme isolated impulse spikes and replaces them with local median
 */
export function applySaltAndPepperRemoval(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  threshold: number = 30,
  radius: number = 2
) {
  const r = Math.max(1, Math.min(3, Math.round(radius)));
  const src = new Uint8ClampedArray(data);
  const size = (2 * r + 1) * (2 * r + 1);
  const rBuf = new Uint8Array(size);
  const gBuf = new Uint8Array(size);
  const bBuf = new Uint8Array(size);
  const medIdx = Math.floor(size / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      if (src[p + 3] === 0) continue;

      let idx = 0;
      for (let dy = -r; dy <= r; dy++) {
        const py = Math.max(0, Math.min(height - 1, y + dy));
        for (let dx = -r; dx <= r; dx++) {
          const px = Math.max(0, Math.min(width - 1, x + dx));
          const sp = (py * width + px) * 4;
          rBuf[idx] = src[sp];
          gBuf[idx] = src[sp + 1];
          bBuf[idx] = src[sp + 2];
          idx++;
        }
      }

      rBuf.subarray(0, idx).sort();
      gBuf.subarray(0, idx).sort();
      bBuf.subarray(0, idx).sort();

      const medR = rBuf[medIdx];
      const medG = gBuf[medIdx];
      const medB = bBuf[medIdx];

      // Check if current pixel is an outlier compared to local neighborhood
      const diffR = Math.abs(src[p] - medR);
      const diffG = Math.abs(src[p + 1] - medG);
      const diffB = Math.abs(src[p + 2] - medB);

      let outR = src[p];
      let outG = src[p + 1];
      let outB = src[p + 2];

      if (diffR > threshold || diffG > threshold || diffB > threshold) {
        outR = medR;
        outG = medG;
        outB = medB;
      }

      data[p] = Math.round(data[p] + (outR - data[p]) * k);
      data[p + 1] = Math.round(data[p + 1] + (outG - data[p + 1]) * k);
      data[p + 2] = Math.round(data[p + 2] + (outB - data[p + 2]) * k);
    }
  }
}
