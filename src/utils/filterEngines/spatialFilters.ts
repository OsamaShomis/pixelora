/**
 * Local / Spatial Blur & Smoothing Filters
 * 11. Box / Mean Blur
 * 12. Weighted Mean Blur
 * 13. Gaussian Blur
 * 14. Median Filter
 * 15. Min Filter
 * 16. Max Filter
 * 17. Bilateral Filter
 * 18. Motion Blur
 * 19. Directional Blur
 */

export interface SpatialFilterParams {
  radius?: number;
  sigma?: number;
  kernelSize?: number;
  spatialRadius?: number;
  spatialSigma?: number;
  colorSigma?: number;
  distance?: number;
  angle?: number;
}

/**
 * Fast separable Box / Mean Blur (Horizontal + Vertical pass)
 */
export function applyBoxBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  radius: number = 3
) {
  const r = Math.max(1, Math.min(30, Math.round(radius)));
  const total = width * height;
  const temp = new Float32Array(total * 4);
  const src = new Float32Array(total * 4);

  for (let i = 0; i < total * 4; i++) {
    src[i] = data[i];
  }

  // Horizontal box pass
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      let sumR = 0, sumG = 0, sumB = 0, sumA = 0, count = 0;
      const xStart = Math.max(0, x - r);
      const xEnd = Math.min(width - 1, x + r);
      for (let ix = xStart; ix <= xEnd; ix++) {
        const p = (rowOffset + ix) * 4;
        sumR += src[p];
        sumG += src[p + 1];
        sumB += src[p + 2];
        sumA += src[p + 3];
        count++;
      }
      const outP = (rowOffset + x) * 4;
      temp[outP] = sumR / count;
      temp[outP + 1] = sumG / count;
      temp[outP + 2] = sumB / count;
      temp[outP + 3] = sumA / count;
    }
  }

  // Vertical box pass + intensity blend
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let sumR = 0, sumG = 0, sumB = 0, count = 0;
      const yStart = Math.max(0, y - r);
      const yEnd = Math.min(height - 1, y + r);
      for (let iy = yStart; iy <= yEnd; iy++) {
        const p = (iy * width + x) * 4;
        sumR += temp[p];
        sumG += temp[p + 1];
        sumB += temp[p + 2];
        count++;
      }
      const outP = (y * width + x) * 4;
      if (data[outP + 3] === 0) continue;

      const meanR = sumR / count;
      const meanG = sumG / count;
      const meanB = sumB / count;

      data[outP] = Math.round(data[outP] + (meanR - data[outP]) * k);
      data[outP + 1] = Math.round(data[outP + 1] + (meanG - data[outP + 1]) * k);
      data[outP + 2] = Math.round(data[outP + 2] + (meanB - data[outP + 2]) * k);
    }
  }
}

/**
 * Weighted Mean Blur with distance-decay weights
 */
export function applyWeightedMeanBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  radius: number = 3
) {
  const r = Math.max(1, Math.min(15, Math.round(radius)));
  const kernelSize = 2 * r + 1;
  const weights = new Float32Array(kernelSize);
  let wSum = 0;
  for (let i = 0; i < kernelSize; i++) {
    const dist = Math.abs(i - r);
    weights[i] = 1 / (1 + dist * 0.75);
    wSum += weights[i];
  }
  for (let i = 0; i < kernelSize; i++) weights[i] /= wSum;

  const total = width * height;
  const temp = new Float32Array(total * 4);
  const src = new Float32Array(total * 4);
  for (let i = 0; i < total * 4; i++) src[i] = data[i];

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      let rAcc = 0, gAcc = 0, bAcc = 0, aAcc = 0, totalW = 0;
      for (let i = -r; i <= r; i++) {
        const ix = Math.max(0, Math.min(width - 1, x + i));
        const w = weights[i + r];
        const p = (rowOffset + ix) * 4;
        rAcc += src[p] * w;
        gAcc += src[p + 1] * w;
        bAcc += src[p + 2] * w;
        aAcc += src[p + 3] * w;
        totalW += w;
      }
      const outP = (rowOffset + x) * 4;
      temp[outP] = rAcc / totalW;
      temp[outP + 1] = gAcc / totalW;
      temp[outP + 2] = bAcc / totalW;
      temp[outP + 3] = aAcc / totalW;
    }
  }

  // Vertical pass
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let rAcc = 0, gAcc = 0, bAcc = 0, totalW = 0;
      for (let i = -r; i <= r; i++) {
        const iy = Math.max(0, Math.min(height - 1, y + i));
        const w = weights[i + r];
        const p = (iy * width + x) * 4;
        rAcc += temp[p] * w;
        gAcc += temp[p + 1] * w;
        bAcc += temp[p + 2] * w;
        totalW += w;
      }
      const outP = (y * width + x) * 4;
      if (data[outP + 3] === 0) continue;

      const wr = rAcc / totalW;
      const wg = gAcc / totalW;
      const wb = bAcc / totalW;

      data[outP] = Math.round(data[outP] + (wr - data[outP]) * k);
      data[outP + 1] = Math.round(data[outP + 1] + (wg - data[outP + 1]) * k);
      data[outP + 2] = Math.round(data[outP + 2] + (wb - data[outP + 2]) * k);
    }
  }
}

/**
 * True 1D Separable Gaussian Blur
 */
export function applyGaussianBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  radius: number = 5,
  sigma: number = 2.0
) {
  const r = Math.max(1, Math.min(30, Math.round(radius)));
  const sig = Math.max(0.5, sigma || r / 2.5);
  const kernelSize = 2 * r + 1;
  const kernel = new Float32Array(kernelSize);
  let kSum = 0;
  const twoSigSq = 2 * sig * sig;

  for (let i = -r; i <= r; i++) {
    const val = Math.exp(-(i * i) / twoSigSq);
    kernel[i + r] = val;
    kSum += val;
  }
  for (let i = 0; i < kernelSize; i++) kernel[i] /= kSum;

  const total = width * height;
  const temp = new Float32Array(total * 4);
  const src = new Float32Array(total * 4);
  for (let i = 0; i < total * 4; i++) src[i] = data[i];

  // Horizontal
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      let rAcc = 0, gAcc = 0, bAcc = 0, aAcc = 0;
      for (let i = -r; i <= r; i++) {
        const ix = Math.max(0, Math.min(width - 1, x + i));
        const p = (rowOffset + ix) * 4;
        const w = kernel[i + r];
        rAcc += src[p] * w;
        gAcc += src[p + 1] * w;
        bAcc += src[p + 2] * w;
        aAcc += src[p + 3] * w;
      }
      const outP = (rowOffset + x) * 4;
      temp[outP] = rAcc;
      temp[outP + 1] = gAcc;
      temp[outP + 2] = bAcc;
      temp[outP + 3] = aAcc;
    }
  }

  // Vertical
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let rAcc = 0, gAcc = 0, bAcc = 0;
      for (let i = -r; i <= r; i++) {
        const iy = Math.max(0, Math.min(height - 1, y + i));
        const p = (iy * width + x) * 4;
        const w = kernel[i + r];
        rAcc += temp[p] * w;
        gAcc += temp[p + 1] * w;
        bAcc += temp[p + 2] * w;
      }
      const outP = (y * width + x) * 4;
      if (data[outP + 3] === 0) continue;

      data[outP] = Math.round(data[outP] + (rAcc - data[outP]) * k);
      data[outP + 1] = Math.round(data[outP + 1] + (gAcc - data[outP + 1]) * k);
      data[outP + 2] = Math.round(data[outP + 2] + (bAcc - data[outP + 2]) * k);
    }
  }
}

/**
 * 2D Median Filter with fast histogram/quickselect
 */
export function applyMedianFilter(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  radius: number = 2
) {
  const r = Math.max(1, Math.min(4, Math.round(radius)));
  const total = width * height;
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

      // Simple insertion sort on the window buffer
      rBuf.subarray(0, idx).sort();
      gBuf.subarray(0, idx).sort();
      bBuf.subarray(0, idx).sort();

      const medR = rBuf[medIdx];
      const medG = gBuf[medIdx];
      const medB = bBuf[medIdx];

      data[p] = Math.round(data[p] + (medR - data[p]) * k);
      data[p + 1] = Math.round(data[p + 1] + (medG - data[p + 1]) * k);
      data[p + 2] = Math.round(data[p + 2] + (medB - data[p + 2]) * k);
    }
  }
}

/**
 * Min Filter (Local minimum)
 */
export function applyMinFilter(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  radius: number = 2
) {
  const r = Math.max(1, Math.min(6, Math.round(radius)));
  const src = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      if (src[p + 3] === 0) continue;

      let minR = 255, minG = 255, minB = 255;
      for (let dy = -r; dy <= r; dy++) {
        const py = Math.max(0, Math.min(height - 1, y + dy));
        for (let dx = -r; dx <= r; dx++) {
          const px = Math.max(0, Math.min(width - 1, x + dx));
          const sp = (py * width + px) * 4;
          if (src[sp] < minR) minR = src[sp];
          if (src[sp + 1] < minG) minG = src[sp + 1];
          if (src[sp + 2] < minB) minB = src[sp + 2];
        }
      }

      data[p] = Math.round(data[p] + (minR - data[p]) * k);
      data[p + 1] = Math.round(data[p + 1] + (minG - data[p + 1]) * k);
      data[p + 2] = Math.round(data[p + 2] + (minB - data[p + 2]) * k);
    }
  }
}

/**
 * Max Filter (Local maximum)
 */
export function applyMaxFilter(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  radius: number = 2
) {
  const r = Math.max(1, Math.min(6, Math.round(radius)));
  const src = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      if (src[p + 3] === 0) continue;

      let maxR = 0, maxG = 0, maxB = 0;
      for (let dy = -r; dy <= r; dy++) {
        const py = Math.max(0, Math.min(height - 1, y + dy));
        for (let dx = -r; dx <= r; dx++) {
          const px = Math.max(0, Math.min(width - 1, x + dx));
          const sp = (py * width + px) * 4;
          if (src[sp] > maxR) maxR = src[sp];
          if (src[sp + 1] > maxG) maxG = src[sp + 1];
          if (src[sp + 2] > maxB) maxB = src[sp + 2];
        }
      }

      data[p] = Math.round(data[p] + (maxR - data[p]) * k);
      data[p + 1] = Math.round(data[p + 1] + (maxG - data[p + 1]) * k);
      data[p + 2] = Math.round(data[p + 2] + (maxB - data[p + 2]) * k);
    }
  }
}

/**
 * Bilateral Filter (Edge-preserving smoothing)
 */
export function applyBilateralFilter(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  spatialRadius: number = 3,
  spatialSigma: number = 3.0,
  colorSigma: number = 30.0
) {
  const r = Math.max(1, Math.min(6, Math.round(spatialRadius)));
  const sSigma = Math.max(0.5, spatialSigma);
  const cSigma = Math.max(5, colorSigma);
  const twoSpatial = 2 * sSigma * sSigma;
  const twoColor = 2 * cSigma * cSigma;

  // Precompute spatial weights
  const spatialLUT = new Float32Array((2 * r + 1) * (2 * r + 1));
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      spatialLUT[(dy + r) * (2 * r + 1) + (dx + r)] = Math.exp(
        -(dx * dx + dy * dy) / twoSpatial
      );
    }
  }

  // Precompute color difference exp LUT (0-255)
  const colorLUT = new Float32Array(256 * 3);
  for (let i = 0; i < colorLUT.length; i++) {
    colorLUT[i] = Math.exp(-(i * i) / twoColor);
  }

  const src = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      if (src[p + 3] === 0) continue;

      const cR = src[p];
      const cG = src[p + 1];
      const cB = src[p + 2];

      let sumR = 0, sumG = 0, sumB = 0, totalW = 0;

      for (let dy = -r; dy <= r; dy++) {
        const py = Math.max(0, Math.min(height - 1, y + dy));
        for (let dx = -r; dx <= r; dx++) {
          const px = Math.max(0, Math.min(width - 1, x + dx));
          const sp = (py * width + px) * 4;

          const nR = src[sp];
          const nG = src[sp + 1];
          const nB = src[sp + 2];

          const diffR = Math.abs(cR - nR);
          const diffG = Math.abs(cG - nG);
          const diffB = Math.abs(cB - nB);
          const colorDiff = Math.floor((diffR + diffG + diffB) / 3);

          const sW = spatialLUT[(dy + r) * (2 * r + 1) + (dx + r)];
          const cW = colorLUT[Math.min(colorLUT.length - 1, colorDiff)];
          const w = sW * cW;

          sumR += nR * w;
          sumG += nG * w;
          sumB += nB * w;
          totalW += w;
        }
      }

      const outR = sumR / (totalW || 1);
      const outG = sumG / (totalW || 1);
      const outB = sumB / (totalW || 1);

      data[p] = Math.round(data[p] + (outR - data[p]) * k);
      data[p + 1] = Math.round(data[p + 1] + (outG - data[p + 1]) * k);
      data[p + 2] = Math.round(data[p + 2] + (outB - data[p + 2]) * k);
    }
  }
}

/**
 * Motion Blur along linear trajectory
 */
export function applyMotionBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  distance: number = 15,
  angle: number = 0
) {
  const dist = Math.max(2, Math.min(50, Math.round(distance)));
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);

  const src = new Uint8ClampedArray(data);
  const half = Math.floor(dist / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      if (src[p + 3] === 0) continue;

      let sumR = 0, sumG = 0, sumB = 0, count = 0;

      for (let s = -half; s <= half; s++) {
        const sx = Math.max(0, Math.min(width - 1, Math.round(x + s * dx)));
        const sy = Math.max(0, Math.min(height - 1, Math.round(y + s * dy)));
        const sp = (sy * width + sx) * 4;

        sumR += src[sp];
        sumG += src[sp + 1];
        sumB += src[sp + 2];
        count++;
      }

      const avgR = sumR / count;
      const avgG = sumG / count;
      const avgB = sumB / count;

      data[p] = Math.round(data[p] + (avgR - data[p]) * k);
      data[p + 1] = Math.round(data[p + 1] + (avgG - data[p + 1]) * k);
      data[p + 2] = Math.round(data[p + 2] + (avgB - data[p + 2]) * k);
    }
  }
}

/**
 * Directional Blur (symmetric angle smear)
 */
export function applyDirectionalBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  radius: number = 10,
  angle: number = 45
) {
  applyMotionBlur(data, width, height, k, radius * 2, angle);
}
