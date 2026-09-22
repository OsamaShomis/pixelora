/**
 * Edge Detection Image Filters
 * 29. Sobel
 * 30. Sobel X
 * 31. Sobel Y
 * 32. Prewitt
 * 33. Prewitt X
 * 34. Prewitt Y
 * 35. Roberts Cross
 * 36. Scharr
 * 37. Laplacian
 * 38. Canny
 * 39. Laplacian of Gaussian (LoG)
 * 40. Difference of Gaussians (DoG)
 * 41. Find Edges
 * 42. Edge Enhance
 */

import { applyGaussianBlur } from './spatialFilters';

export interface EdgeFilterParams {
  strength?: number;
  lowThreshold?: number;
  highThreshold?: number;
  sigma?: number;
  sigma1?: number;
  sigma2?: number;
}

/**
 * Extracts grayscale luminance into a Float32Array
 */
function extractLuminance(data: Uint8ClampedArray, width: number, height: number): Float32Array {
  const total = width * height;
  const lum = new Float32Array(total);
  for (let i = 0, p = 0; i < total; i++, p += 4) {
    lum[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
  }
  return lum;
}

/**
 * Applies edge map (0-255 grayscale) back to the target data array
 */
function blendEdgeMap(
  data: Uint8ClampedArray,
  edgeMap: Float32Array,
  k: number,
  invertEdges: boolean = false
) {
  const len = edgeMap.length;
  for (let i = 0; i < len; i++) {
    const p = i * 4;
    if (data[p + 3] === 0) continue;

    let e = Math.min(255, Math.max(0, edgeMap[i]));
    if (invertEdges) e = 255 - e;

    data[p] = Math.round(data[p] + (e - data[p]) * k);
    data[p + 1] = Math.round(data[p + 1] + (e - data[p + 1]) * k);
    data[p + 2] = Math.round(data[p + 2] + (e - data[p + 2]) * k);
  }
}

/**
 * Sobel Operator: Gradient Magnitude = sqrt(Gx^2 + Gy^2)
 */
export function applySobel(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  strength: number = 100
) {
  const lum = extractLuminance(data, width, height);
  const out = new Float32Array(width * height);
  const factor = strength / 100;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      // Sobel horizontal
      const gx =
        -lum[p - width - 1] + lum[p - width + 1] -
        2 * lum[p - 1] + 2 * lum[p + 1] -
        lum[p + width - 1] + lum[p + width + 1];

      // Sobel vertical
      const gy =
        -lum[p - width - 1] - 2 * lum[p - width] - lum[p - width + 1] +
        lum[p + width - 1] + 2 * lum[p + width] + lum[p + width + 1];

      out[p] = Math.sqrt(gx * gx + gy * gy) * factor;
    }
  }

  blendEdgeMap(data, out, k);
}

/**
 * Sobel X (Horizontal gradient / vertical edges)
 */
export function applySobelX(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  strength: number = 100
) {
  const lum = extractLuminance(data, width, height);
  const out = new Float32Array(width * height);
  const factor = strength / 100;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      const gx =
        -lum[p - width - 1] + lum[p - width + 1] -
        2 * lum[p - 1] + 2 * lum[p + 1] -
        lum[p + width - 1] + lum[p + width + 1];
      out[p] = Math.abs(gx) * factor;
    }
  }

  blendEdgeMap(data, out, k);
}

/**
 * Sobel Y (Vertical gradient / horizontal edges)
 */
export function applySobelY(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  strength: number = 100
) {
  const lum = extractLuminance(data, width, height);
  const out = new Float32Array(width * height);
  const factor = strength / 100;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      const gy =
        -lum[p - width - 1] - 2 * lum[p - width] - lum[p - width + 1] +
        lum[p + width - 1] + 2 * lum[p + width] + lum[p + width + 1];
      out[p] = Math.abs(gy) * factor;
    }
  }

  blendEdgeMap(data, out, k);
}

/**
 * Prewitt Operator
 */
export function applyPrewitt(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  strength: number = 100
) {
  const lum = extractLuminance(data, width, height);
  const out = new Float32Array(width * height);
  const factor = strength / 100;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      const gx =
        -lum[p - width - 1] + lum[p - width + 1] -
        lum[p - 1] + lum[p + 1] -
        lum[p + width - 1] + lum[p + width + 1];

      const gy =
        -lum[p - width - 1] - lum[p - width] - lum[p - width + 1] +
        lum[p + width - 1] + lum[p + width] + lum[p + width + 1];

      out[p] = Math.sqrt(gx * gx + gy * gy) * factor;
    }
  }

  blendEdgeMap(data, out, k);
}

export function applyPrewittX(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  strength: number = 100
) {
  const lum = extractLuminance(data, width, height);
  const out = new Float32Array(width * height);
  const factor = strength / 100;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      const gx =
        -lum[p - width - 1] + lum[p - width + 1] -
        lum[p - 1] + lum[p + 1] -
        lum[p + width - 1] + lum[p + width + 1];
      out[p] = Math.abs(gx) * factor;
    }
  }

  blendEdgeMap(data, out, k);
}

export function applyPrewittY(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  strength: number = 100
) {
  const lum = extractLuminance(data, width, height);
  const out = new Float32Array(width * height);
  const factor = strength / 100;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      const gy =
        -lum[p - width - 1] - lum[p - width] - lum[p - width + 1] +
        lum[p + width - 1] + lum[p + width] + lum[p + width + 1];
      out[p] = Math.abs(gy) * factor;
    }
  }

  blendEdgeMap(data, out, k);
}

/**
 * Roberts Cross Operator: 2x2 gradient operator
 */
export function applyRobertsCross(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  strength: number = 100
) {
  const lum = extractLuminance(data, width, height);
  const out = new Float32Array(width * height);
  const factor = (strength / 100) * 1.5;

  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const p = y * width + x;
      const gx = lum[p] - lum[p + width + 1];
      const gy = lum[p + 1] - lum[p + width];
      out[p] = Math.sqrt(gx * gx + gy * gy) * factor;
    }
  }

  blendEdgeMap(data, out, k);
}

/**
 * Scharr Operator: Optimized rotational symmetry
 */
export function applyScharr(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  strength: number = 100
) {
  const lum = extractLuminance(data, width, height);
  const out = new Float32Array(width * height);
  const factor = (strength / 100) / 4;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      const gx =
        -3 * lum[p - width - 1] + 3 * lum[p - width + 1] -
        10 * lum[p - 1] + 10 * lum[p + 1] -
        3 * lum[p + width - 1] + 3 * lum[p + width + 1];

      const gy =
        -3 * lum[p - width - 1] - 10 * lum[p - width] - 3 * lum[p - width + 1] +
        3 * lum[p + width - 1] + 10 * lum[p + width] + 3 * lum[p + width + 1];

      out[p] = Math.sqrt(gx * gx + gy * gy) * factor;
    }
  }

  blendEdgeMap(data, out, k);
}

/**
 * Discrete 2nd-derivative Laplacian operator
 */
export function applyLaplacian(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  strength: number = 100
) {
  const lum = extractLuminance(data, width, height);
  const out = new Float32Array(width * height);
  const factor = strength / 100;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      const lap =
        lum[p - width] +
        lum[p + width] +
        lum[p - 1] +
        lum[p + 1] -
        4 * lum[p];
      out[p] = Math.abs(lap) * factor;
    }
  }

  blendEdgeMap(data, out, k);
}

/**
 * Canny Edge Detector:
 * Stage 1: Gaussian filter
 * Stage 2: Gradient intensity and angle
 * Stage 3: Non-maximum suppression
 * Stage 4: Double thresholding
 * Stage 5: Edge tracking by hysteresis
 */
export function applyCanny(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  lowThreshold: number = 30,
  highThreshold: number = 80,
  sigma: number = 1.4
) {
  const total = width * height;

  // 1. Gaussian blur
  const smooth = new Uint8ClampedArray(data);
  applyGaussianBlur(smooth, width, height, 1.0, Math.max(1, Math.round(sigma * 2)), sigma);
  const lum = extractLuminance(smooth, width, height);

  // 2. Gradients & directions
  const grad = new Float32Array(total);
  const dir = new Uint8Array(total); // Quantized into 0, 1 (45 deg), 2 (90 deg), 3 (135 deg)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      const gx =
        -lum[p - width - 1] + lum[p - width + 1] -
        2 * lum[p - 1] + 2 * lum[p + 1] -
        lum[p + width - 1] + lum[p + width + 1];

      const gy =
        -lum[p - width - 1] - 2 * lum[p - width] - lum[p - width + 1] +
        lum[p + width - 1] + 2 * lum[p + width] + lum[p + width + 1];

      grad[p] = Math.sqrt(gx * gx + gy * gy);

      let angle = (Math.atan2(gy, gx) * 180) / Math.PI;
      if (angle < 0) angle += 180;

      if ((angle >= 0 && angle < 22.5) || (angle >= 157.5 && angle <= 180)) {
        dir[p] = 0; // East-West
      } else if (angle >= 22.5 && angle < 67.5) {
        dir[p] = 1; // NE-SW
      } else if (angle >= 67.5 && angle < 112.5) {
        dir[p] = 2; // North-South
      } else {
        dir[p] = 3; // NW-SE
      }
    }
  }

  // 3. Non-maximum suppression
  const nms = new Float32Array(total);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      const g = grad[p];
      let g1 = 0, g2 = 0;

      switch (dir[p]) {
        case 0:
          g1 = grad[p - 1];
          g2 = grad[p + 1];
          break;
        case 1:
          g1 = grad[p - width + 1];
          g2 = grad[p + width - 1];
          break;
        case 2:
          g1 = grad[p - width];
          g2 = grad[p + width];
          break;
        case 3:
          g1 = grad[p - width - 1];
          g2 = grad[p + width + 1];
          break;
      }

      if (g >= g1 && g >= g2) {
        nms[p] = g;
      } else {
        nms[p] = 0;
      }
    }
  }

  // 4 & 5. Double thresholding and hysteresis edge tracking
  const edges = new Uint8Array(total);
  const STRONG = 255;
  const WEAK = 50;

  const stack: number[] = [];

  for (let i = 0; i < total; i++) {
    if (nms[i] >= highThreshold) {
      edges[i] = STRONG;
      stack.push(i);
    } else if (nms[i] >= lowThreshold) {
      edges[i] = WEAK;
    } else {
      edges[i] = 0;
    }
  }

  // Hysteresis flood fill
  while (stack.length > 0) {
    const p = stack.pop()!;
    const y = Math.floor(p / width);
    const x = p % width;

    for (let dy = -1; dy <= 1; dy++) {
      const ny = y + dy;
      if (ny < 0 || ny >= height) continue;
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        if (nx < 0 || nx >= width) continue;
        const np = ny * width + nx;
        if (edges[np] === WEAK) {
          edges[np] = STRONG;
          stack.push(np);
        }
      }
    }
  }

  const out = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    out[i] = edges[i] === STRONG ? 255 : 0;
  }

  blendEdgeMap(data, out, k);
}

/**
 * Laplacian of Gaussian (LoG)
 */
export function applyLoG(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  sigma: number = 1.4
) {
  const sig = Math.max(0.6, sigma);
  const r = Math.max(2, Math.min(8, Math.round(sig * 3)));
  const size = 2 * r + 1;
  const kernel = new Float32Array(size * size);
  const twoSigSq = 2 * sig * sig;
  const sig4 = sig * sig * sig * sig;

  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      const distSq = x * x + y * y;
      const val = -(1 - distSq / twoSigSq) * Math.exp(-distSq / twoSigSq) / (Math.PI * sig4);
      kernel[(y + r) * size + (x + r)] = val;
    }
  }

  const lum = extractLuminance(data, width, height);
  const out = new Float32Array(width * height);

  for (let y = r; y < height - r; y++) {
    for (let x = r; x < width - r; x++) {
      let sum = 0;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          sum += lum[(y + dy) * width + (x + dx)] * kernel[(dy + r) * size + (dx + r)];
        }
      }
      out[y * width + x] = Math.abs(sum) * 40;
    }
  }

  blendEdgeMap(data, out, k);
}

/**
 * Difference of Gaussians (DoG)
 */
export function applyDoG(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  sigma1: number = 1.0,
  sigma2: number = 2.0
) {
  const blur1 = new Uint8ClampedArray(data);
  const blur2 = new Uint8ClampedArray(data);

  applyGaussianBlur(blur1, width, height, 1.0, Math.round(sigma1 * 2), sigma1);
  applyGaussianBlur(blur2, width, height, 1.0, Math.round(sigma2 * 2), sigma2);

  const lum1 = extractLuminance(blur1, width, height);
  const lum2 = extractLuminance(blur2, width, height);
  const total = width * height;
  const out = new Float32Array(total);

  for (let i = 0; i < total; i++) {
    out[i] = Math.abs(lum1[i] - lum2[i]) * 8;
  }

  blendEdgeMap(data, out, k);
}

/**
 * Find Edges: High-contrast edge isolation
 */
export function applyFindEdges(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  strength: number = 100
) {
  applySobel(data, width, height, k, strength);
}

/**
 * Edge Enhance: Adds detected edges back into the original color image
 */
export function applyEdgeEnhance(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  strength: number = 50
) {
  const lum = extractLuminance(data, width, height);
  const factor = (strength / 100) * 0.8;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = (y * width + x) * 4;
      if (data[p + 3] === 0) continue;

      const lp = y * width + x;
      const gx =
        -lum[lp - width - 1] + lum[lp - width + 1] -
        2 * lum[lp - 1] + 2 * lum[lp + 1] -
        lum[lp + width - 1] + lum[lp + width + 1];

      const gy =
        -lum[lp - width - 1] - 2 * lum[lp - width] - lum[lp - width + 1] +
        lum[lp + width - 1] + 2 * lum[lp + width] + lum[lp + width + 1];

      const edgeMag = Math.sqrt(gx * gx + gy * gy) * factor;

      for (let c = 0; c < 3; c++) {
        const val = Math.min(255, data[p + c] + edgeMag);
        data[p + c] = Math.round(data[p + c] + (val - data[p + c]) * k);
      }
    }
  }
}
