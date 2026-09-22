import {
  LayerFilters,
  ToneCurves,
  CurvePoint,
  HslMixer,
  ColorGrading,
  VignetteEffect,
  GrainEffect,
  SharpeningDetail,
  NoiseReductionDetail,
  LensCorrections,
  GeometryTransform,
  AdjustmentMask,
  BwMix,
  CameraProfile,
} from '../types';
import { LIGHTROOM_PRESETS } from '../data/lightroomPresets';
import { isImageProcessingFilter, applyImageProcessingFilter } from './filterEngines';

/**
 * Combines manual adjustment layer filters with any active filter preset
 * based on presetIntensity (0-100%).
 * Ensures strict state independence: resetting filters leaves manual adjustments intact,
 * and resetting adjustments leaves the active preset intact.
 */
export function getEffectiveLayerFilters(filters?: LayerFilters): LayerFilters {
  if (!filters) {
    return {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      exposure: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      vibrance: 0,
      temperature: 0,
      tint: 0,
      hue: 0,
      sharpness: 0,
      blur: 0,
      clarity: 0,
      texture: 0,
      vignette: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,
      opacity: 100,
      presetFilter: 'none',
      presetIntensity: 100,
    };
  }

  const result: LayerFilters = { ...filters };
  const presetId = filters.presetFilter;
  const intensity = filters.presetIntensity !== undefined ? filters.presetIntensity : 100;

  if (!presetId || presetId === 'none' || presetId === 'original' || intensity <= 0) {
    return result;
  }

  const k = Math.max(0, Math.min(100, intensity)) / 100;
  const preset = LIGHTROOM_PRESETS.find((p) => p.id === presetId);
  if (!preset) return result;

  const pf = preset.filters;

  // Basic & Light blending
  if (pf.brightness !== undefined && pf.brightness !== 100) {
    result.brightness = Math.round((filters.brightness ?? 100) + (pf.brightness - 100) * k);
  }
  if (pf.contrast !== undefined && pf.contrast !== 100) {
    result.contrast = Math.round((filters.contrast ?? 100) + (pf.contrast - 100) * k);
  }
  if (pf.saturation !== undefined && pf.saturation !== 100) {
    result.saturation = Math.round((filters.saturation ?? 100) + (pf.saturation - 100) * k);
  }
  if (pf.exposure !== undefined && pf.exposure !== 0) {
    result.exposure = Math.round((filters.exposure ?? 0) + pf.exposure * k);
  }
  if (pf.highlights !== undefined && pf.highlights !== 0) {
    result.highlights = Math.round((filters.highlights ?? 0) + pf.highlights * k);
  }
  if (pf.shadows !== undefined && pf.shadows !== 0) {
    result.shadows = Math.round((filters.shadows ?? 0) + pf.shadows * k);
  }
  if (pf.whites !== undefined && pf.whites !== 0) {
    result.whites = Math.round((filters.whites ?? 0) + pf.whites * k);
  }
  if (pf.blacks !== undefined && pf.blacks !== 0) {
    result.blacks = Math.round((filters.blacks ?? 0) + pf.blacks * k);
  }
  if (pf.temperature !== undefined && pf.temperature !== 0) {
    result.temperature = Math.round((filters.temperature ?? 0) + pf.temperature * k);
  }
  if (pf.tint !== undefined && pf.tint !== 0) {
    result.tint = Math.round((filters.tint ?? 0) + pf.tint * k);
  }
  if (pf.vibrance !== undefined && pf.vibrance !== 0) {
    result.vibrance = Math.round((filters.vibrance ?? 0) + pf.vibrance * k);
  }
  if (pf.clarity !== undefined && pf.clarity !== 0) {
    result.clarity = Math.round((filters.clarity ?? 0) + pf.clarity * k);
  }
  if (pf.texture !== undefined && pf.texture !== 0) {
    result.texture = Math.round((filters.texture ?? 0) + pf.texture * k);
  }
  if (pf.dehaze !== undefined && pf.dehaze !== 0) {
    result.dehaze = Math.round((filters.dehaze ?? 0) + pf.dehaze * k);
  }
  if (pf.sharpness !== undefined && pf.sharpness !== 0) {
    result.sharpness = Math.round((filters.sharpness ?? 0) + pf.sharpness * k);
  }
  if (pf.bwEnabled) {
    if (k > 0.3) result.bwEnabled = true;
    if (pf.bwMix) result.bwMix = pf.bwMix;
  }
  if (pf.colorGrading) {
    result.colorGrading = {
      shadows: {
        ...pf.colorGrading.shadows,
        saturation: Math.round(pf.colorGrading.shadows.saturation * k),
      },
      midtones: {
        ...pf.colorGrading.midtones,
        saturation: Math.round(pf.colorGrading.midtones.saturation * k),
      },
      highlights: {
        ...pf.colorGrading.highlights,
        saturation: Math.round(pf.colorGrading.highlights.saturation * k),
      },
      blending: pf.colorGrading.blending,
      balance: pf.colorGrading.balance,
    };
  }
  if (pf.toneCurves) {
    result.toneCurves = pf.toneCurves;
  }
  if (pf.vignette) {
    const pAmt = typeof pf.vignette === 'number' ? pf.vignette : pf.vignette.amount;
    const mAmt = typeof filters.vignette === 'number' ? filters.vignette : (filters.vignette?.amount ?? 0);
    const combinedAmt = Math.max(-100, Math.min(100, Math.round(mAmt + pAmt * k)));
    result.vignette = typeof pf.vignette === 'object' ? { ...pf.vignette, amount: combinedAmt } : combinedAmt;
  }
  if (pf.grain) {
    const mGrain = filters.grain?.amount ?? 0;
    const combinedAmt = Math.max(0, Math.min(100, Math.round(mGrain + pf.grain.amount * k)));
    result.grain = { ...pf.grain, amount: combinedAmt };
  }

  return result;
}

/**
 * Monotonic Cubic Spline Interpolation for Tone Curves
 * Generates an accurate 256-value Lookup Table (LUT) from control points
 */
export function generateToneCurveLUT(points: CurvePoint[]): Uint8Array {
  const lut = new Uint8Array(256);
  if (!points || points.length === 0) {
    for (let i = 0; i < 256; i++) lut[i] = i;
    return lut;
  }

  // Sort points by X coordinate
  const sorted = [...points].sort((a, b) => a.x - b.x);

  // Ensure 0 and 255 exist
  if (sorted[0].x > 0) sorted.unshift({ x: 0, y: sorted[0].y });
  if (sorted[sorted.length - 1].x < 255) {
    sorted.push({ x: 255, y: sorted[sorted.length - 1].y });
  }

  const n = sorted.length;
  if (n === 2) {
    // Linear
    const m = (sorted[1].y - sorted[0].y) / (sorted[1].x - sorted[0].x || 1);
    for (let x = 0; x < 256; x++) {
      const y = sorted[0].y + m * (x - sorted[0].x);
      lut[x] = Math.max(0, Math.min(255, Math.round(y)));
    }
    return lut;
  }

  // Calculate slopes
  const dx = new Float32Array(n - 1);
  const dy = new Float32Array(n - 1);
  const m = new Float32Array(n - 1);

  for (let i = 0; i < n - 1; i++) {
    dx[i] = sorted[i + 1].x - sorted[i].x;
    dy[i] = sorted[i + 1].y - sorted[i].y;
    m[i] = dx[i] !== 0 ? dy[i] / dx[i] : 0;
  }

  // Calculate tangents
  const tangents = new Float32Array(n);
  tangents[0] = m[0];
  tangents[n - 1] = m[n - 2];

  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) {
      tangents[i] = 0;
    } else {
      tangents[i] = (m[i - 1] + m[i]) / 2;
    }
  }

  // Interpolate 0..255
  let seg = 0;
  for (let x = 0; x < 256; x++) {
    while (seg < n - 2 && x > sorted[seg + 1].x) {
      seg++;
    }

    const p0 = sorted[seg];
    const p1 = sorted[seg + 1];
    const h = p1.x - p0.x;

    if (h === 0) {
      lut[x] = Math.max(0, Math.min(255, Math.round(p0.y)));
      continue;
    }

    const t = (x - p0.x) / h;
    const t2 = t * t;
    const t3 = t2 * t;

    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    const y = h00 * p0.y + h10 * h * tangents[seg] + h01 * p1.y + h11 * h * tangents[seg + 1];
    lut[x] = Math.max(0, Math.min(255, Math.round(y)));
  }

  return lut;
}

/**
 * RGB <-> HSL conversions
 */
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * 8 Color Channels Centers in Hue Degrees (Red, Orange, Yellow, Green, Cyan/Aqua, Blue, Purple, Magenta)
 */
const COLOR_CHANNEL_HUES: Record<string, number> = {
  red: 0,
  orange: 30,
  yellow: 60,
  green: 120,
  aqua: 180, // Cyan
  blue: 240,
  purple: 280,
  magenta: 320,
};

/**
 * Calculates smooth continuous weights for 8 HSL channels based on pixel hue.
 * Uses a smooth cosine window with 55-degree span ensuring completely seamless
 * transitions across adjacent color boundaries (e.g. Red↔Orange, Yellow↔Green, Green↔Cyan)
 * without hard thresholds or dead zones.
 */
function getChannelWeight(pixelHue: number, targetHue: number): number {
  let diff = Math.abs(pixelHue - targetHue);
  if (diff > 180) diff = 360 - diff;
  const radius = 55;
  if (diff >= radius) return 0;
  return Math.cos((diff / radius) * (Math.PI / 2));
}

/**
 * Applies full Lightroom color adjustments directly on ImageData pixels
 */
export function applyLightroomPipelineToImageData(
  imgData: ImageData,
  filters: LayerFilters
): void {
  const data = imgData.data;
  const len = data.length;

  // 1. Prepare Tone Curve LUTs
  let rgbLut: Uint8Array | null = null;
  let redLut: Uint8Array | null = null;
  let greenLut: Uint8Array | null = null;
  let blueLut: Uint8Array | null = null;

  if (filters.toneCurves) {
    if (filters.toneCurves.rgb?.length > 2 || filters.toneCurves.rgb?.[0]?.y !== 0 || filters.toneCurves.rgb?.[1]?.y !== 255) {
      rgbLut = generateToneCurveLUT(filters.toneCurves.rgb);
    }
    if (filters.toneCurves.red?.length > 2 || filters.toneCurves.red?.[0]?.y !== 0 || filters.toneCurves.red?.[1]?.y !== 255) {
      redLut = generateToneCurveLUT(filters.toneCurves.red);
    }
    if (filters.toneCurves.green?.length > 2 || filters.toneCurves.green?.[0]?.y !== 0 || filters.toneCurves.green?.[1]?.y !== 255) {
      greenLut = generateToneCurveLUT(filters.toneCurves.green);
    }
    if (filters.toneCurves.blue?.length > 2 || filters.toneCurves.blue?.[0]?.y !== 0 || filters.toneCurves.blue?.[1]?.y !== 255) {
      blueLut = generateToneCurveLUT(filters.toneCurves.blue);
    }
  }

  // Precompute constants
  const exposureMult = Math.pow(2, (filters.exposure || 0) / 50);
  const brightnessFactor = (filters.brightness ?? 100) / 100;
  const contrastFactor = (filters.contrast ?? 100) / 100;
  const contrastOffset = 128 * (1 - contrastFactor);

  const highlightsShift = (filters.highlights || 0) * 0.6;
  const shadowsShift = (filters.shadows || 0) * 0.6;
  const whitesShift = (filters.whites || 0) * 0.5;
  const blacksShift = (filters.blacks || 0) * 0.5;

  const tempShift = (filters.temperature || 0) * 0.8;
  const tintShift = (filters.tint || 0) * 0.8;
  const vibranceAmount = (filters.vibrance || 0) / 100;
  const saturationMult = (filters.saturation ?? 100) / 100;

  const hslMixer = filters.hslMixer;
  const colorGrading = filters.colorGrading;
  const bwEnabled = !!filters.bwEnabled;
  const bwMix = filters.bwMix;
  const clarity = (filters.clarity || 0) / 100;
  const dehaze = (filters.dehaze || 0) / 100;
  const texture = (filters.texture || 0) / 100;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    // 1. Exposure & Brightness
    r = r * exposureMult * brightnessFactor;
    g = g * exposureMult * brightnessFactor;
    b = b * exposureMult * brightnessFactor;

    // 2. Contrast
    r = r * contrastFactor + contrastOffset;
    g = g * contrastFactor + contrastOffset;
    b = b * contrastFactor + contrastOffset;

    // Calculate preliminary luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // 3. Highlights, Shadows, Whites, Blacks
    const highWeight = Math.max(0, Math.min(1, (lum - 128) / 127));
    const shadowWeight = Math.max(0, Math.min(1, (128 - lum) / 128));
    const whiteWeight = Math.max(0, Math.min(1, (lum - 192) / 63));
    const blackWeight = Math.max(0, Math.min(1, (64 - lum) / 64));

    const lumAdjust =
      highlightsShift * highWeight +
      shadowsShift * shadowWeight +
      whitesShift * whiteWeight +
      blacksShift * blackWeight;

    r += lumAdjust;
    g += lumAdjust;
    b += lumAdjust;

    // 4. Tone Curves LUTs
    if (rgbLut) {
      r = rgbLut[Math.max(0, Math.min(255, Math.round(r)))];
      g = rgbLut[Math.max(0, Math.min(255, Math.round(g)))];
      b = rgbLut[Math.max(0, Math.min(255, Math.round(b)))];
    }
    if (redLut) r = redLut[Math.max(0, Math.min(255, Math.round(r)))];
    if (greenLut) g = greenLut[Math.max(0, Math.min(255, Math.round(g)))];
    if (blueLut) b = blueLut[Math.max(0, Math.min(255, Math.round(b)))];

    // 5. White Balance (Temperature & Tint)
    if (tempShift !== 0 || tintShift !== 0) {
      r += tempShift;
      b -= tempShift;
      g += tintShift;
      r -= tintShift * 0.5;
      b -= tintShift * 0.5;
    }

    // 6. Dehaze & Clarity local contrast tone shift
    if (dehaze !== 0 || clarity !== 0 || texture !== 0) {
      const midWeight = 1 - Math.abs(lum - 128) / 128;
      const boost = (dehaze * 25 + clarity * 20 + texture * 12) * midWeight;
      r += (r - 128) * (boost / 128);
      g += (g - 128) * (boost / 128);
      b += (b - 128) * (boost / 128);
    }

    // Convert to HSL for color adjustments
    let [h, s, l] = rgbToHsl(
      Math.max(0, Math.min(255, r)),
      Math.max(0, Math.min(255, g)),
      Math.max(0, Math.min(255, b))
    );

    // 6.5 Hue Shift (rotates color in genuine HSL space around 360° color wheel)
    const hueShift = filters.hue || 0;
    if (hueShift !== 0) {
      h = (h + hueShift + 360) % 360;
    }

    // 7. Vibrance (boosts lower saturated pixels more)
    if (vibranceAmount !== 0) {
      const currentSatNorm = s / 100;
      const vibranceBoost = vibranceAmount * (1 - currentSatNorm) * 50;
      s = Math.max(0, Math.min(100, s + vibranceBoost));
    }

    // 8. Global Saturation
    s = Math.max(0, Math.min(100, s * saturationMult));

    // 9. HSL Color Mixer (8 Channels: Red, Orange, Yellow, Green, Cyan, Blue, Purple, Magenta)
    if (hslMixer) {
      // Saturation tapering: neutral/achromatic pixels (s near 0) should not be shifted by colored channel targets
      const satFactor = Math.min(1, Math.max(0, s / 12));
      if (satFactor > 0.005) {
        let deltaH = 0;
        let deltaS = 0;
        let deltaL = 0;
        const origHue = h;

        for (const [channel, targetHue] of Object.entries(COLOR_CHANNEL_HUES)) {
          const weight = getChannelWeight(origHue, targetHue) * satFactor;
          if (weight > 0.005) {
            const adj = hslMixer[channel as keyof HslMixer];
            if (adj) {
              const chHue = Number.isFinite(adj.hue) ? adj.hue : 0;
              const chSat = Number.isFinite(adj.saturation) ? adj.saturation : 0;
              const chLum = Number.isFinite(adj.luminance) ? adj.luminance : 0;

              deltaH += chHue * weight * 0.45;
              deltaS += chSat * weight;
              deltaL += chLum * weight * 0.5;
            }
          }
        }

        if (deltaH !== 0 || deltaS !== 0 || deltaL !== 0) {
          h = (origHue + deltaH + 3600) % 360;
          s = Math.max(0, Math.min(100, s + deltaS));
          l = Math.max(0, Math.min(100, l + deltaL));
        }
      }
    }

    // Convert back to RGB
    let [nr, ng, nb] = hslToRgb(h, s, l);

    // 10. Grayscale & Black & White Mix (Sets R = G = B, preserving alpha)
    if (bwEnabled) {
      if (bwMix) {
        let channelL = 0;
        let totalWeight = 0;
        for (const [channel, targetHue] of Object.entries(COLOR_CHANNEL_HUES)) {
          const w = getChannelWeight(h, targetHue);
          if (w > 0) {
            const mixVal = (bwMix[channel as keyof BwMix] ?? 50) / 100;
            channelL += mixVal * w;
            totalWeight += w;
          }
        }
        const mixFactor = totalWeight > 0 ? channelL / totalWeight : 1;
        const bwLum = Math.max(0, Math.min(255, (0.299 * nr + 0.587 * ng + 0.114 * nb) * (mixFactor * 1.5)));
        nr = bwLum;
        ng = bwLum;
        nb = bwLum;
      } else {
        const mono = 0.299 * nr + 0.587 * ng + 0.114 * nb;
        nr = mono;
        ng = mono;
        nb = mono;
      }
    } else if (filters.grayscale && filters.grayscale > 0) {
      const mono = 0.299 * nr + 0.587 * ng + 0.114 * nb;
      const gFactor = Math.min(1, Math.max(0, filters.grayscale / 100));
      nr = nr * (1 - gFactor) + mono * gFactor;
      ng = ng * (1 - gFactor) + mono * gFactor;
      nb = nb * (1 - gFactor) + mono * gFactor;
    }

    // 10.5 Sepia (Standard W3C / ITU color matrix directly modifying RGB channels)
    if (filters.sepia && filters.sepia > 0) {
      const sr = nr * 0.393 + ng * 0.769 + nb * 0.189;
      const sg = nr * 0.349 + ng * 0.686 + nb * 0.168;
      const sb = nr * 0.272 + ng * 0.534 + nb * 0.131;
      const sFactor = Math.min(1, Math.max(0, filters.sepia / 100));
      nr = nr * (1 - sFactor) + sr * sFactor;
      ng = ng * (1 - sFactor) + sg * sFactor;
      nb = nb * (1 - sFactor) + sb * sFactor;
    }

    // 10.6 Invert (Operates on actual RGB channels: R' = 255 - R, G' = 255 - G, B' = 255 - B; Alpha is untouched)
    if (filters.invert && filters.invert > 0) {
      const iFactor = Math.min(1, Math.max(0, filters.invert / 100));
      nr = nr * (1 - iFactor) + (255 - nr) * iFactor;
      ng = ng * (1 - iFactor) + (255 - ng) * iFactor;
      nb = nb * (1 - iFactor) + (255 - nb) * iFactor;
    }

    // 11. Color Grading (Shadows, Midtones, Highlights 3-Way Split Toning + Luminance)
    if (colorGrading) {
      const curL = (0.299 * nr + 0.587 * ng + 0.114 * nb) / 255;
      const balance = (colorGrading.balance || 0) / 100;
      const blending = ((colorGrading.blending ?? 50) / 100) * 0.5 + 0.5; // Smooth blending transition
      const splitPoint = Math.max(0.2, Math.min(0.8, 0.5 + balance * 0.25));

      const shadowW = Math.pow(Math.max(0, 1 - curL / splitPoint), 1 / blending);
      const highlightW = Math.pow(Math.max(0, (curL - splitPoint) / (1 - splitPoint)), 1 / blending);
      const midtoneW = Math.max(0, 1 - Math.abs(curL - splitPoint) * 2);

      // Shadows
      if (colorGrading.shadows) {
        if (colorGrading.shadows.saturation > 0) {
          const [sr, sg, sb] = hslToRgb(colorGrading.shadows.hue, colorGrading.shadows.saturation, 50);
          const sAmt = (colorGrading.shadows.saturation / 100) * shadowW * 0.45;
          nr = nr * (1 - sAmt) + sr * sAmt;
          ng = ng * (1 - sAmt) + sg * sAmt;
          nb = nb * (1 - sAmt) + sb * sAmt;
        }
        if (colorGrading.shadows.luminance && colorGrading.shadows.luminance !== 0) {
          const lumShift = (colorGrading.shadows.luminance / 100) * shadowW * 45;
          nr += lumShift;
          ng += lumShift;
          nb += lumShift;
        }
      }

      // Midtones
      if (colorGrading.midtones) {
        if (colorGrading.midtones.saturation > 0) {
          const [mr, mg, mb] = hslToRgb(colorGrading.midtones.hue, colorGrading.midtones.saturation, 50);
          const mAmt = (colorGrading.midtones.saturation / 100) * midtoneW * 0.4;
          nr = nr * (1 - mAmt) + mr * mAmt;
          ng = ng * (1 - mAmt) + mg * mAmt;
          nb = nb * (1 - mAmt) + mb * mAmt;
        }
        if (colorGrading.midtones.luminance && colorGrading.midtones.luminance !== 0) {
          const lumShift = (colorGrading.midtones.luminance / 100) * midtoneW * 45;
          nr += lumShift;
          ng += lumShift;
          nb += lumShift;
        }
      }

      // Highlights
      if (colorGrading.highlights) {
        if (colorGrading.highlights.saturation > 0) {
          const [hr, hg, hb] = hslToRgb(colorGrading.highlights.hue, colorGrading.highlights.saturation, 50);
          const hAmt = (colorGrading.highlights.saturation / 100) * highlightW * 0.45;
          nr = nr * (1 - hAmt) + hr * hAmt;
          ng = ng * (1 - hAmt) + hg * hAmt;
          nb = nb * (1 - hAmt) + hb * hAmt;
        }
        if (colorGrading.highlights.luminance && colorGrading.highlights.luminance !== 0) {
          const lumShift = (colorGrading.highlights.luminance / 100) * highlightW * 45;
          nr += lumShift;
          ng += lumShift;
          nb += lumShift;
        }
      }
    }

    data[i] = Math.max(0, Math.min(255, Math.round(nr)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(ng)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(nb)));
  }

  // 12. Real Pixel-Level Image Processing Filters (64 Mathematical Engines)
  if (filters.presetFilter && isImageProcessingFilter(filters.presetFilter)) {
    applyImageProcessingFilter(
      imgData,
      filters.presetFilter,
      filters.presetIntensity ?? 100,
      filters.presetParams ?? {}
    );
  }
}

/**
 * Fast, alpha-preserving Box/Gaussian blur directly on ImageData.
 * Processes actual neighboring pixels in O(N) time with zero edge halo/bleeding on transparent PNGs.
 */
export function applyBlurToImageData(imgData: ImageData, radius: number): void {
  const r = Math.round(radius);
  if (!r || r <= 0) return;
  const w = imgData.width;
  const h = imgData.height;
  if (w < 2 || h < 2) return;

  const data = imgData.data;
  const passes = r > 10 ? 2 : 3;
  const boxRadius = Math.max(1, Math.round(r * 0.7));
  const temp = new Uint8ClampedArray(data.length);

  for (let p = 0; p < passes; p++) {
    // Horizontal pass: blur from data -> temp
    for (let y = 0; y < h; y++) {
      const rowStart = y * w * 4;
      let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
      let count = 0;

      for (let k = -boxRadius; k <= boxRadius; k++) {
        const x = Math.max(0, Math.min(w - 1, k));
        const idx = rowStart + x * 4;
        const a = data[idx + 3];
        if (a > 0) {
          sumR += data[idx] * (a / 255);
          sumG += data[idx + 1] * (a / 255);
          sumB += data[idx + 2] * (a / 255);
          sumA += a;
        }
        count++;
      }

      for (let x = 0; x < w; x++) {
        const outIdx = rowStart + x * 4;
        if (sumA > 0) {
          temp[outIdx] = Math.round((sumR / sumA) * 255);
          temp[outIdx + 1] = Math.round((sumG / sumA) * 255);
          temp[outIdx + 2] = Math.round((sumB / sumA) * 255);
          temp[outIdx + 3] = Math.round(sumA / count);
        } else {
          temp[outIdx] = 0;
          temp[outIdx + 1] = 0;
          temp[outIdx + 2] = 0;
          temp[outIdx + 3] = 0;
        }

        const removeX = Math.max(0, x - boxRadius);
        const addX = Math.min(w - 1, x + boxRadius + 1);
        const remIdx = rowStart + removeX * 4;
        const addIdx = rowStart + addX * 4;

        const remA = data[remIdx + 3];
        if (remA > 0) {
          sumR -= data[remIdx] * (remA / 255);
          sumG -= data[remIdx + 1] * (remA / 255);
          sumB -= data[remIdx + 2] * (remA / 255);
          sumA -= remA;
        }

        const addA = data[addIdx + 3];
        if (addA > 0) {
          sumR += data[addIdx] * (addA / 255);
          sumG += data[addIdx + 1] * (addA / 255);
          sumB += data[addIdx + 2] * (addA / 255);
          sumA += addA;
        }
      }
    }

    // Vertical pass: blur from temp -> data
    for (let x = 0; x < w; x++) {
      let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
      let count = 0;

      for (let k = -boxRadius; k <= boxRadius; k++) {
        const y = Math.max(0, Math.min(h - 1, k));
        const idx = (y * w + x) * 4;
        const a = temp[idx + 3];
        if (a > 0) {
          sumR += temp[idx] * (a / 255);
          sumG += temp[idx + 1] * (a / 255);
          sumB += temp[idx + 2] * (a / 255);
          sumA += a;
        }
        count++;
      }

      for (let y = 0; y < h; y++) {
        const outIdx = (y * w + x) * 4;
        if (sumA > 0) {
          data[outIdx] = Math.round((sumR / sumA) * 255);
          data[outIdx + 1] = Math.round((sumG / sumA) * 255);
          data[outIdx + 2] = Math.round((sumB / sumA) * 255);
          data[outIdx + 3] = Math.round(sumA / count);
        } else {
          data[outIdx] = 0;
          data[outIdx + 1] = 0;
          data[outIdx + 2] = 0;
          data[outIdx + 3] = 0;
        }

        const removeY = Math.max(0, y - boxRadius);
        const addY = Math.min(h - 1, y + boxRadius + 1);
        const remIdx = (removeY * w + x) * 4;
        const addIdx = (addY * w + x) * 4;

        const remA = temp[remIdx + 3];
        if (remA > 0) {
          sumR -= temp[remIdx] * (remA / 255);
          sumG -= temp[remIdx + 1] * (remA / 255);
          sumB -= temp[remIdx + 2] * (remA / 255);
          sumA -= remA;
        }

        const addA = temp[addIdx + 3];
        if (addA > 0) {
          sumR += temp[addIdx] * (addA / 255);
          sumG += temp[addIdx + 1] * (addA / 255);
          sumB += temp[addIdx + 2] * (addA / 255);
          sumA += addA;
        }
      }
    }
  }
}

/**
 * Unsharp Masking directly on ImageData:
 * 1. Creates blurred low-pass copy of original image
 * 2. Extracts high frequency difference: diff = original - blurred
 * 3. Applies threshold/masking if specified
 * 4. Adds difference scaled by strength back to original
 * 5. Writes result directly into imgData.data, preserving alpha channel
 */
export function applyUnsharpMaskToImageData(
  imgData: ImageData,
  detail: SharpeningDetail
): void {
  const amount = detail.amount ?? 0;
  if (amount <= 0) return;

  const w = imgData.width;
  const h = imgData.height;
  if (w < 2 || h < 2) return;

  const radius = Math.max(1, Math.min(5, Math.round(detail.radius ?? 1.5)));
  const strength = (amount / 100) * 1.5;
  const maskingThreshold = (detail.masking ?? 0) * 0.25;

  const copyBuffer = new Uint8ClampedArray(imgData.data);
  const copyImgData = new ImageData(copyBuffer, w, h);
  applyBlurToImageData(copyImgData, radius);

  const orig = imgData.data;
  const blur = copyImgData.data;
  const len = orig.length;

  for (let i = 0; i < len; i += 4) {
    const a = orig[i + 3];
    if (a === 0) continue; // Completely transparent, preserve alpha

    for (let c = 0; c < 3; c++) {
      const oVal = orig[i + c];
      const bVal = blur[i + c];
      const diff = oVal - bVal;

      if (Math.abs(diff) >= maskingThreshold) {
        orig[i + c] = Math.max(0, Math.min(255, Math.round(oVal + diff * strength)));
      }
    }
    // Alpha orig[i + 3] remains untouched
  }
}

/**
 * Applies sharpening or Unsharp Masking directly to ImageData
 * Preserves alpha channel and transparent PNG cutouts
 */
export function applySharpeningToImageData(
  imgData: ImageData,
  sharpness?: number,
  sharpeningDetail?: SharpeningDetail
): void {
  if (sharpeningDetail && sharpeningDetail.amount > 0) {
    applyUnsharpMaskToImageData(imgData, sharpeningDetail);
    return;
  }

  if (!sharpness || sharpness <= 0) return;
  const w = imgData.width;
  const h = imgData.height;
  if (w < 3 || h < 3) return;

  const src = new Uint8ClampedArray(imgData.data);
  const dst = imgData.data;
  const amount = Math.min(1.0, sharpness / 100) * 0.7;

  for (let y = 1; y < h - 1; y++) {
    const rowOffset = y * w;
    const upRowOffset = (y - 1) * w;
    const downRowOffset = (y + 1) * w;

    for (let x = 1; x < w - 1; x++) {
      const idx = (rowOffset + x) * 4;
      const a = src[idx + 3];
      if (a === 0) continue;

      const up = (upRowOffset + x) * 4;
      const down = (downRowOffset + x) * 4;
      const left = (rowOffset + (x - 1)) * 4;
      const right = (rowOffset + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const val = src[idx + c];
        const laplacian = 4 * val - src[up + c] - src[down + c] - src[left + c] - src[right + c];
        dst[idx + c] = Math.max(0, Math.min(255, Math.round(val + laplacian * amount)));
      }
      // dst[idx + 3] alpha is completely untouched
    }
  }
}

/**
 * Applies realistic film grain directly to ImageData pixels
 * Preserves alpha channel and transparent PNG cutouts
 */
export function applyGrainToImageData(imgData: ImageData, grain: GrainEffect): void {
  if (!grain || grain.amount <= 0) return;
  const data = imgData.data;
  const len = data.length;
  const intensity = (grain.amount / 100) * 42;
  const roughness = ((grain.roughness ?? 50) / 100) * 0.4 + 0.8;

  for (let i = 0; i < len; i += 4) {
    const a = data[i + 3];
    if (a === 0) continue; // Skip transparent pixel

    const u1 = Math.max(0.0001, Math.random());
    const u2 = Math.random();
    const randG = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const noise = randG * (intensity / 3) * roughness;

    data[i] = Math.max(0, Math.min(255, Math.round(data[i] + noise)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(data[i + 1] + noise)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(data[i + 2] + noise)));
    // Alpha channel data[i + 3] untouched!
  }
}

/**
 * Checks whether LayerFilters contains adjustments that require ImageData processing
 */
export function hasAdvancedFilters(filters?: LayerFilters): boolean {
  if (!filters) return false;
  const effective = getEffectiveLayerFilters(filters);

  // 1. Basic adjustments
  if (effective.brightness !== undefined && effective.brightness !== 100) return true;
  if (effective.contrast !== undefined && effective.contrast !== 100) return true;
  if (effective.saturation !== undefined && effective.saturation !== 100) return true;
  if (effective.hue !== undefined && effective.hue !== 0) return true;

  // 2. Color operations
  if (effective.grayscale !== undefined && effective.grayscale > 0) return true;
  if (effective.sepia !== undefined && effective.sepia > 0) return true;
  if (effective.invert !== undefined && effective.invert > 0) return true;

  // 3. Detail operations
  if (effective.blur !== undefined && effective.blur > 0) return true;
  if (effective.sharpness !== undefined && effective.sharpness > 0) return true;
  if (effective.sharpeningDetail && effective.sharpeningDetail.amount > 0) return true;

  // 4. Effects
  if (effective.grain && effective.grain.amount > 0) return true;
  if (
    effective.vignette &&
    (typeof effective.vignette === 'number'
      ? effective.vignette !== 0
      : effective.vignette.amount !== 0)
  ) {
    return true;
  }

  // 5. Tone Curves check
  if (effective.toneCurves) {
    const { rgb, red, green, blue } = effective.toneCurves;
    const isLinear = (pts?: CurvePoint[]) =>
      !pts ||
      (pts.length === 2 &&
        pts[0]?.x === 0 &&
        pts[0]?.y === 0 &&
        pts[1]?.x === 255 &&
        pts[1]?.y === 255);
    if (!isLinear(rgb) || !isLinear(red) || !isLinear(green) || !isLinear(blue)) {
      return true;
    }
  }

  // 6. HSL Mixer check
  if (effective.hslMixer) {
    for (const val of Object.values(effective.hslMixer)) {
      if (val && (val.hue !== 0 || val.saturation !== 0 || val.luminance !== 0)) {
        return true;
      }
    }
  }

  // 7. Color Grading check
  if (effective.colorGrading) {
    const { shadows, midtones, highlights } = effective.colorGrading;
    if (
      (shadows && (shadows.saturation > 0 || (shadows.luminance && shadows.luminance !== 0))) ||
      (midtones && (midtones.saturation > 0 || (midtones.luminance && midtones.luminance !== 0))) ||
      (highlights && (highlights.saturation > 0 || (highlights.luminance && highlights.luminance !== 0)))
    ) {
      return true;
    }
  }

  // 8. B&W Enabled check
  if (effective.bwEnabled) return true;

  // 9. Photographic sliders
  if (
    (effective.exposure && effective.exposure !== 0) ||
    (effective.highlights && effective.highlights !== 0) ||
    (effective.shadows && effective.shadows !== 0) ||
    (effective.whites && effective.whites !== 0) ||
    (effective.blacks && effective.blacks !== 0) ||
    (effective.temperature && effective.temperature !== 0) ||
    (effective.tint && effective.tint !== 0) ||
    (effective.vibrance && effective.vibrance !== 0) ||
    (effective.clarity && effective.clarity !== 0) ||
    (effective.dehaze && effective.dehaze !== 0) ||
    (effective.texture && effective.texture !== 0)
  ) {
    return true;
  }

  // 10. Presets
  if (effective.presetFilter && effective.presetFilter !== 'none' && effective.presetFilter !== 'original') {
    return true;
  }

  return false;
}

/**
 * Applies Vignette to a Canvas context
 * Uses source-atop so transparency in cutout PNGs is 100% preserved
 */
export function applyVignetteToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  vignette: VignetteEffect
): void {
  if (!vignette || vignette.amount === 0) return;

  ctx.save();
  // Ensure we only shade existing drawn pixels (preserves transparent background)
  ctx.globalCompositeOperation = 'source-atop';

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.sqrt(cx * cx + cy * cy);
  const midpoint = (vignette.midpoint ?? 50) / 100;
  const feather = Math.max(0.1, (vignette.feather ?? 50) / 100);

  const innerRadius = maxRadius * midpoint * (1 - feather * 0.5);
  const outerRadius = maxRadius;

  const gradient = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);

  const isDark = vignette.amount < 0;
  const alpha = Math.abs(vignette.amount) / 100;

  if (isDark) {
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${alpha})`);
  } else {
    gradient.addColorStop(0, 'rgba(255,255,255,0)');
    gradient.addColorStop(1, `rgba(255,255,255,${alpha})`);
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Applies Realistic Film Grain
 * Uses source-atop so transparency in cutout PNGs is 100% preserved
 */
export function applyGrainToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  grain: GrainEffect
): void {
  if (!grain || grain.amount <= 0) return;

  ctx.save();
  const intensity = (grain.amount / 100) * 0.28;
  const grainCanvas = document.createElement('canvas');
  const gWidth = Math.max(64, Math.round(width / Math.max(1, (grain.size || 25) / 10)));
  const gHeight = Math.max(64, Math.round(height / Math.max(1, (grain.size || 25) / 10)));
  grainCanvas.width = gWidth;
  grainCanvas.height = gHeight;

  const gCtx = grainCanvas.getContext('2d');
  if (!gCtx) {
    ctx.restore();
    return;
  }

  const gImgData = gCtx.createImageData(gWidth, gHeight);
  const gData = gImgData.data;
  const gLen = gData.length;

  for (let i = 0; i < gLen; i += 4) {
    const val = Math.random() > 0.5 ? 255 : 0;
    gData[i] = val;
    gData[i + 1] = val;
    gData[i + 2] = val;
    gData[i + 3] = Math.round(Math.random() * intensity * 255);
  }

  gCtx.putImageData(gImgData, 0, 0);

  // Use source-atop so grain only overlays non-transparent pixels!
  ctx.globalCompositeOperation = 'source-atop';
  ctx.drawImage(grainCanvas, 0, 0, width, height);
  ctx.restore();
}

/**
 * Builds CSS filter style representation for high-speed live preview
 */
export function buildLightroomCssFilters(filters?: LayerFilters): string {
  if (!filters) return 'none';
  const parts: string[] = [];

  const b = filters.brightness ?? 100;
  const c = filters.contrast ?? 100;
  const s = filters.saturation ?? 100;
  const exp = filters.exposure ?? 0;
  const temp = filters.temperature ?? 0;
  const tint = filters.tint ?? 0;
  const blur = filters.blur ?? 0;
  const bw = filters.bwEnabled;

  // Brightness + Exposure
  const totalBrightness = Math.round((b / 100) * Math.pow(2, exp / 60) * 100);
  if (totalBrightness !== 100) parts.push(`brightness(${totalBrightness}%)`);

  // Contrast
  if (c !== 100) parts.push(`contrast(${c}%)`);

  // Saturation & Black and White
  if (bw) {
    parts.push(`grayscale(100%)`);
  } else if (s !== 100) {
    parts.push(`saturate(${s}%)`);
  }

  // Temperature & Tint Hue rotation emulation
  if (temp !== 0 || tint !== 0) {
    const hueAngle = Math.round(temp * 0.3 + tint * 0.4);
    if (hueAngle !== 0) parts.push(`hue-rotate(${hueAngle}deg)`);
    if (temp > 10) parts.push(`sepia(${Math.round(temp * 0.4)}%)`);
  }

  // Blur
  if (blur > 0) parts.push(`blur(${blur}px)`);

  return parts.length > 0 ? parts.join(' ') : 'none';
}
