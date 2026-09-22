/**
 * Frequency-Domain Image Filters (2D FFT / Fourier Transform)
 * 56. Ideal Low Pass
 * 57. Gaussian Low Pass
 * 58. Butterworth Low Pass
 * 59. Ideal High Pass
 * 60. Gaussian High Pass
 * 61. Butterworth High Pass
 * 62. Band Pass
 * 63. Band Reject
 * 64. Notch Filter
 */

export interface FrequencyFilterParams {
  cutoff?: number; // Percent 5 - 90
  order?: number; // Butterworth order 1 - 6
  centerFreq?: number; // Band center 10 - 80
  bandwidth?: number; // Bandwidth 5 - 40
  notchRadius?: number; // Notch radius 5 - 30
  notchDistance?: number; // Notch distance from center 10 - 80
}

/**
 * In-place 1D Cooley-Tukey Radix-2 FFT
 */
function fft1D(real: Float32Array, imag: Float32Array, n: number, inverse: boolean) {
  // Bit-reversal permutation
  let j = 0;
  for (let i = 0; i < n - 1; i++) {
    if (i < j) {
      const tr = real[i];
      real[i] = real[j];
      real[j] = tr;

      const ti = imag[i];
      imag[i] = imag[j];
      imag[j] = ti;
    }
    let k = n >> 1;
    while (k <= j) {
      j -= k;
      k >>= 1;
    }
    j += k;
  }

  // Butterfly computations
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1;
    const angle = ((inverse ? 2 : -2) * Math.PI) / len;
    const wStepR = Math.cos(angle);
    const wStepI = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let wR = 1.0;
      let wI = 0.0;
      for (let m = 0; m < half; m++) {
        const uIdx = i + m;
        const vIdx = i + m + half;

        const uR = real[uIdx];
        const uI = imag[uIdx];

        const vR = real[vIdx] * wR - imag[vIdx] * wI;
        const vI = real[vIdx] * wI + imag[vIdx] * wR;

        real[uIdx] = uR + vR;
        imag[uIdx] = uI + vI;

        real[vIdx] = uR - vR;
        imag[vIdx] = uI - vI;

        const nextWR = wR * wStepR - wI * wStepI;
        const nextWI = wR * wStepI + wI * wStepR;
        wR = nextWR;
        wI = nextWI;
      }
    }
  }

  if (inverse) {
    for (let i = 0; i < n; i++) {
      real[i] /= n;
      imag[i] /= n;
    }
  }
}

/**
 * 2D Fast Fourier Transform on power-of-two buffer
 */
function fft2D(
  real: Float32Array,
  imag: Float32Array,
  width: number,
  height: number,
  inverse: boolean
) {
  // 1. Transform rows
  const rowReal = new Float32Array(width);
  const rowImag = new Float32Array(width);

  for (let y = 0; y < height; y++) {
    const offset = y * width;
    for (let x = 0; x < width; x++) {
      rowReal[x] = real[offset + x];
      rowImag[x] = imag[offset + x];
    }
    fft1D(rowReal, rowImag, width, inverse);
    for (let x = 0; x < width; x++) {
      real[offset + x] = rowReal[x];
      imag[offset + x] = rowImag[x];
    }
  }

  // 2. Transform columns
  const colReal = new Float32Array(height);
  const colImag = new Float32Array(height);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const idx = y * width + x;
      colReal[y] = real[idx];
      colImag[y] = imag[idx];
    }
    fft1D(colReal, colImag, height, inverse);
    for (let y = 0; y < height; y++) {
      const idx = y * width + x;
      real[idx] = colReal[y];
      imag[idx] = colImag[y];
    }
  }
}

/**
 * Frequency mask function type: (u, v, dist, maxDist) => filter weight H(u,v)
 */
type FrequencyMaskFn = (u: number, v: number, dist: number, maxDist: number) => number;

/**
 * Core 2D Frequency-Domain Pipeline:
 * Image -> FFT -> Centered Mask H(u,v) -> IFFT -> Output Image
 */
function processFrequencyDomain(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  maskFn: FrequencyMaskFn
) {
  // Determine power-of-two grid (clamped between 64 and 256 for fast interactive response)
  const getPowerOfTwo = (v: number) => {
    let p = 1;
    while (p < v && p < 256) p <<= 1;
    return Math.min(256, Math.max(64, p));
  };

  const gridW = getPowerOfTwo(width);
  const gridH = getPowerOfTwo(height);
  const total = gridW * gridH;

  const real = new Float32Array(total);
  const imag = new Float32Array(total);

  // We filter the luminance channel in frequency domain
  for (let gy = 0; gy < gridH; gy++) {
    const sy = Math.min(height - 1, Math.floor((gy / gridH) * height));
    for (let gx = 0; gx < gridW; gx++) {
      const sx = Math.min(width - 1, Math.floor((gx / gridW) * width));
      const p = (sy * width + sx) * 4;
      const lum = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
      // Multiply by (-1)^(x+y) to shift zero frequency to center automatically!
      const shift = (gx + gy) % 2 === 0 ? 1 : -1;
      real[gy * gridW + gx] = lum * shift;
      imag[gy * gridW + gx] = 0;
    }
  }

  // 1. Forward 2D FFT (Already shifted to center)
  fft2D(real, imag, gridW, gridH, false);

  // 2. Apply Frequency Mask H(u, v)
  const cx = gridW / 2;
  const cy = gridH / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  for (let gy = 0; gy < gridH; gy++) {
    const v = gy - cy;
    for (let gx = 0; gx < gridW; gx++) {
      const u = gx - cx;
      const dist = Math.sqrt(u * u + v * v);
      const h = maskFn(u, v, dist, maxDist);
      const idx = gy * gridW + gx;
      real[idx] *= h;
      imag[idx] *= h;
    }
  }

  // 3. Inverse 2D FFT
  fft2D(real, imag, gridW, gridH, true);

  // 4. Multiply by (-1)^(x+y) to undo center shift
  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const shift = (gx + gy) % 2 === 0 ? 1 : -1;
      real[gy * gridW + gx] *= shift;
    }
  }

  // 5. Bilinear interpolation of filtered luminance back to original image
  for (let y = 0; y < height; y++) {
    const gyNorm = (y / height) * gridH;
    const gy0 = Math.min(gridH - 1, Math.floor(gyNorm));
    const gy1 = Math.min(gridH - 1, gy0 + 1);
    const wy = gyNorm - gy0;

    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      if (data[p + 3] === 0) continue;

      const gxNorm = (x / width) * gridW;
      const gx0 = Math.min(gridW - 1, Math.floor(gxNorm));
      const gx1 = Math.min(gridW - 1, gx0 + 1);
      const wx = gxNorm - gx0;

      const v00 = real[gy0 * gridW + gx0];
      const v10 = real[gy0 * gridW + gx1];
      const v01 = real[gy1 * gridW + gx0];
      const v11 = real[gy1 * gridW + gx1];

      const filteredLum = Math.min(
        255,
        Math.max(
          0,
          (v00 * (1 - wx) + v10 * wx) * (1 - wy) + (v01 * (1 - wx) + v11 * wx) * wy
        )
      );

      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      const origLum = 0.299 * r + 0.587 * g + 0.114 * b;

      const diff = filteredLum - origLum;
      const outR = Math.min(255, Math.max(0, Math.round(r + diff)));
      const outG = Math.min(255, Math.max(0, Math.round(g + diff)));
      const outB = Math.min(255, Math.max(0, Math.round(b + diff)));

      data[p] = Math.round(r + (outR - r) * k);
      data[p + 1] = Math.round(g + (outG - g) * k);
      data[p + 2] = Math.round(b + (outB - b) * k);
    }
  }
}

/**
 * 56. Ideal Low Pass Filter (ILPF)
 * H(u,v) = 1 if D <= D0 else 0
 */
export function applyIdealLowPass(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  cutoff: number = 30
) {
  processFrequencyDomain(data, width, height, k, (u, v, dist, maxDist) => {
    const d0 = (cutoff / 100) * maxDist;
    return dist <= d0 ? 1 : 0;
  });
}

/**
 * 57. Gaussian Low Pass Filter (GLPF)
 * H(u,v) = exp(-D^2 / (2 * D0^2))
 */
export function applyGaussianLowPass(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  cutoff: number = 30
) {
  processFrequencyDomain(data, width, height, k, (u, v, dist, maxDist) => {
    const d0 = Math.max(1, (cutoff / 100) * maxDist);
    return Math.exp(-(dist * dist) / (2 * d0 * d0));
  });
}

/**
 * 58. Butterworth Low Pass Filter (BLPF)
 * H(u,v) = 1 / (1 + (D / D0)^(2n))
 */
export function applyButterworthLowPass(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  cutoff: number = 30,
  order: number = 2
) {
  const n = Math.max(1, Math.min(6, Math.round(order)));
  processFrequencyDomain(data, width, height, k, (u, v, dist, maxDist) => {
    const d0 = Math.max(1, (cutoff / 100) * maxDist);
    return 1 / (1 + Math.pow(dist / d0, 2 * n));
  });
}

/**
 * 59. Ideal High Pass Filter (IHPF)
 * H(u,v) = 0 if D <= D0 else 1
 */
export function applyIdealHighPass(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  cutoff: number = 20
) {
  processFrequencyDomain(data, width, height, k, (u, v, dist, maxDist) => {
    const d0 = (cutoff / 100) * maxDist;
    return dist <= d0 ? 0 : 1;
  });
}

/**
 * 60. Gaussian High Pass Filter (GHPF)
 * H(u,v) = 1 - exp(-D^2 / (2 * D0^2))
 */
export function applyGaussianHighPass(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  cutoff: number = 20
) {
  processFrequencyDomain(data, width, height, k, (u, v, dist, maxDist) => {
    const d0 = Math.max(1, (cutoff / 100) * maxDist);
    return 1 - Math.exp(-(dist * dist) / (2 * d0 * d0));
  });
}

/**
 * 61. Butterworth High Pass Filter (BHPF)
 * H(u,v) = 1 / (1 + (D0 / D)^(2n))
 */
export function applyButterworthHighPass(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  cutoff: number = 20,
  order: number = 2
) {
  const n = Math.max(1, Math.min(6, Math.round(order)));
  processFrequencyDomain(data, width, height, k, (u, v, dist, maxDist) => {
    if (dist === 0) return 0;
    const d0 = Math.max(1, (cutoff / 100) * maxDist);
    return 1 / (1 + Math.pow(d0 / dist, 2 * n));
  });
}

/**
 * 62. Band Pass Filter (BPF)
 * Allows frequencies in a ring around center frequency D0 with bandwidth W
 */
export function applyBandPass(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  centerFreq: number = 30,
  bandwidth: number = 15
) {
  processFrequencyDomain(data, width, height, k, (u, v, dist, maxDist) => {
    const d0 = (centerFreq / 100) * maxDist;
    const w = Math.max(2, (bandwidth / 100) * maxDist);
    if (dist === 0) return 0;
    const term = (dist * dist - d0 * d0) / (dist * w);
    return Math.exp(-0.5 * term * term);
  });
}

/**
 * 63. Band Reject Filter (BRF / Band Stop)
 * Attenuates frequencies in a band around D0
 */
export function applyBandReject(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  centerFreq: number = 30,
  bandwidth: number = 15
) {
  processFrequencyDomain(data, width, height, k, (u, v, dist, maxDist) => {
    const d0 = (centerFreq / 100) * maxDist;
    const w = Math.max(2, (bandwidth / 100) * maxDist);
    if (dist === 0) return 1;
    const term = (dist * dist - d0 * d0) / (dist * w);
    return 1 - Math.exp(-0.5 * term * term);
  });
}

/**
 * 64. Notch Filter
 * Rejects specific periodic harmonic noise frequencies (symmetric notches at +/- uk, vk)
 */
export function applyNotchFilter(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  k: number,
  notchRadius: number = 10,
  notchDistance: number = 35
) {
  processFrequencyDomain(data, width, height, k, (u, v, dist, maxDist) => {
    const d0 = (notchRadius / 100) * maxDist;
    const distTarget = (notchDistance / 100) * maxDist;

    // Symmetric notch points on 45 degree diagonals
    const offset = distTarget * 0.7071;
    const d1 = Math.sqrt((u - offset) * (u - offset) + (v - offset) * (v - offset));
    const d2 = Math.sqrt((u + offset) * (u + offset) + (v + offset) * (v + offset));

    const h1 = 1 - Math.exp(-(d1 * d1) / (2 * d0 * d0));
    const h2 = 1 - Math.exp(-(d2 * d2) / (2 * d0 * d0));

    return h1 * h2;
  });
}
