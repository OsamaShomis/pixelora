/**
 * Master Index for Pixelora Image Processing Filter Engines
 * Dispatches all 64 real pixel-level image processing operations
 */

import {
  applyGrayscale,
  applyInvert,
  applyBinaryThreshold,
  applyAdaptiveThreshold,
  applyPosterize,
  applySolarize,
  applyGamma,
  applyLogTransform,
  applyPowerLaw,
  applyColorQuantization,
} from './pointProcessing';

import {
  applyBoxBlur,
  applyWeightedMeanBlur,
  applyGaussianBlur,
  applyMedianFilter,
  applyMinFilter,
  applyMaxFilter,
  applyBilateralFilter,
  applyMotionBlur,
  applyDirectionalBlur,
} from './spatialFilters';

import {
  applySpatialNoiseReduction,
  applyWienerFilter,
  applyAdaptiveNoiseFilter,
  applySaltAndPepperRemoval,
} from './noiseReduction';

import {
  applySpatialSharpen,
  applyUnsharpMask,
  applyHighBoost,
  applyLaplacianSharpen,
  applyDetailEnhance,
} from './sharpenFilters';

import {
  applySobel,
  applySobelX,
  applySobelY,
  applyPrewitt,
  applyPrewittX,
  applyPrewittY,
  applyRobertsCross,
  applyScharr,
  applyLaplacian,
  applyCanny,
  applyLoG,
  applyDoG,
  applyFindEdges,
  applyEdgeEnhance,
} from './edgeDetection';

import {
  applyErosion,
  applyDilation,
  applyOpening,
  applyClosing,
  applyMorphologicalGradient,
  applyTopHat,
  applyBlackHat,
  applyBoundaryExtraction,
} from './morphologyFilters';

import {
  applyHistogramEqualization,
  applyCLAHE,
  applyHistogramStretching,
  applyHistogramMatching,
  applyGlobalThresholdOtsu,
} from './histogramFilters';

import {
  applyIdealLowPass,
  applyGaussianLowPass,
  applyButterworthLowPass,
  applyIdealHighPass,
  applyGaussianHighPass,
  applyButterworthHighPass,
  applyBandPass,
  applyBandReject,
  applyNotchFilter,
} from './frequencyFilters';

export const IMAGE_PROCESSING_FILTER_IDS = new Set<string>([
  // Point Processing
  'filter_grayscale',
  'filter_invert',
  'filter_binary_threshold',
  'filter_adaptive_threshold',
  'filter_posterize',
  'filter_solarize',
  'filter_gamma',
  'filter_log_transform',
  'filter_power_law',
  'filter_color_quantization',

  // Spatial Blur
  'filter_box_blur',
  'filter_weighted_mean_blur',
  'filter_gaussian_blur',
  'filter_median',
  'filter_min',
  'filter_max',
  'filter_bilateral',
  'filter_motion_blur',
  'filter_directional_blur',

  // Noise Reduction
  'filter_noise_reduction_spatial',
  'filter_wiener',
  'filter_adaptive_noise',
  'filter_salt_pepper_removal',

  // Sharpening
  'filter_sharpen_spatial',
  'filter_unsharp_mask',
  'filter_high_boost',
  'filter_laplacian_sharpen',
  'filter_detail_enhance',

  // Edge Detection
  'filter_sobel',
  'filter_sobel_x',
  'filter_sobel_y',
  'filter_prewitt',
  'filter_prewitt_x',
  'filter_prewitt_y',
  'filter_roberts_cross',
  'filter_scharr',
  'filter_laplacian',
  'filter_canny',
  'filter_log',
  'filter_dog',
  'filter_find_edges',
  'filter_edge_enhance',

  // Morphology
  'filter_erosion',
  'filter_dilation',
  'filter_opening',
  'filter_closing',
  'filter_morph_gradient',
  'filter_top_hat',
  'filter_black_hat',
  'filter_boundary_extraction',

  // Histogram
  'filter_hist_equalization',
  'filter_clahe',
  'filter_hist_stretching',
  'filter_hist_matching',
  'filter_global_threshold_otsu',

  // Frequency Domain
  'filter_ideal_low_pass',
  'filter_gaussian_low_pass',
  'filter_butterworth_low_pass',
  'filter_ideal_high_pass',
  'filter_gaussian_high_pass',
  'filter_butterworth_high_pass',
  'filter_band_pass',
  'filter_band_reject',
  'filter_notch_filter',
]);

export function isImageProcessingFilter(filterId?: string): boolean {
  if (!filterId) return false;
  return IMAGE_PROCESSING_FILTER_IDS.has(filterId);
}

/**
 * Dispatches and applies the designated image-processing filter on ImageData
 */
export function applyImageProcessingFilter(
  imgData: ImageData,
  filterId: string,
  intensity: number = 100,
  params: Record<string, any> = {}
): void {
  if (!isImageProcessingFilter(filterId)) return;
  const k = Math.max(0, Math.min(100, intensity)) / 100;
  if (k === 0) return;

  const data = imgData.data;
  const width = imgData.width;
  const height = imgData.height;

  switch (filterId) {
    // 1. Point Processing
    case 'filter_grayscale':
      applyGrayscale(data, k);
      break;
    case 'filter_invert':
      applyInvert(data, k);
      break;
    case 'filter_binary_threshold':
      applyBinaryThreshold(data, k, params.threshold ?? 128);
      break;
    case 'filter_adaptive_threshold':
      applyAdaptiveThreshold(data, width, height, k, params.blockSize ?? 15, params.constant ?? 5);
      break;
    case 'filter_posterize':
      applyPosterize(data, k, params.levels ?? 4);
      break;
    case 'filter_solarize':
      applySolarize(data, k, params.threshold ?? 128);
      break;
    case 'filter_gamma':
      applyGamma(data, k, params.gamma ?? 1.5);
      break;
    case 'filter_log_transform':
      applyLogTransform(data, k, params.scale ?? 1.0);
      break;
    case 'filter_power_law':
      applyPowerLaw(data, k, params.gamma ?? 0.8, params.constant ?? 1.0);
      break;
    case 'filter_color_quantization':
      applyColorQuantization(data, k, params.colors ?? 16);
      break;

    // 2. Spatial Blur & Smoothing
    case 'filter_box_blur':
      applyBoxBlur(data, width, height, k, params.radius ?? 3);
      break;
    case 'filter_weighted_mean_blur':
      applyWeightedMeanBlur(data, width, height, k, params.radius ?? 3);
      break;
    case 'filter_gaussian_blur':
      applyGaussianBlur(data, width, height, k, params.radius ?? 5, params.sigma ?? 2.0);
      break;
    case 'filter_median':
      applyMedianFilter(data, width, height, k, params.radius ?? 2);
      break;
    case 'filter_min':
      applyMinFilter(data, width, height, k, params.radius ?? 2);
      break;
    case 'filter_max':
      applyMaxFilter(data, width, height, k, params.radius ?? 2);
      break;
    case 'filter_bilateral':
      applyBilateralFilter(
        data,
        width,
        height,
        k,
        params.spatialRadius ?? 3,
        params.spatialSigma ?? 3.0,
        params.colorSigma ?? 30.0
      );
      break;
    case 'filter_motion_blur':
      applyMotionBlur(data, width, height, k, params.distance ?? 15, params.angle ?? 0);
      break;
    case 'filter_directional_blur':
      applyDirectionalBlur(data, width, height, k, params.radius ?? 10, params.angle ?? 45);
      break;

    // 3. Noise Reduction
    case 'filter_noise_reduction_spatial':
      applySpatialNoiseReduction(data, width, height, k, params.strength ?? 50, params.radius ?? 2);
      break;
    case 'filter_wiener':
      applyWienerFilter(data, width, height, k, params.windowSize ?? 5, params.noiseVariance ?? 100);
      break;
    case 'filter_adaptive_noise':
      applyAdaptiveNoiseFilter(data, width, height, k, params.sensitivity ?? 50, params.radius ?? 2);
      break;
    case 'filter_salt_pepper_removal':
      applySaltAndPepperRemoval(data, width, height, k, params.threshold ?? 30, params.radius ?? 2);
      break;

    // 4. Sharpening
    case 'filter_sharpen_spatial':
      applySpatialSharpen(data, width, height, k, params.strength ?? 50);
      break;
    case 'filter_unsharp_mask':
      applyUnsharpMask(
        data,
        width,
        height,
        k,
        params.amount ?? 100,
        params.radius ?? 2,
        params.threshold ?? 0
      );
      break;
    case 'filter_high_boost':
      applyHighBoost(data, width, height, k, params.boost ?? 1.5, params.radius ?? 2);
      break;
    case 'filter_laplacian_sharpen':
      applyLaplacianSharpen(data, width, height, k, params.strength ?? 50);
      break;
    case 'filter_detail_enhance':
      applyDetailEnhance(data, width, height, k, params.amount ?? 50, params.radius ?? 3);
      break;

    // 5. Edge Detection
    case 'filter_sobel':
      applySobel(data, width, height, k, params.strength ?? 100);
      break;
    case 'filter_sobel_x':
      applySobelX(data, width, height, k, params.strength ?? 100);
      break;
    case 'filter_sobel_y':
      applySobelY(data, width, height, k, params.strength ?? 100);
      break;
    case 'filter_prewitt':
      applyPrewitt(data, width, height, k, params.strength ?? 100);
      break;
    case 'filter_prewitt_x':
      applyPrewittX(data, width, height, k, params.strength ?? 100);
      break;
    case 'filter_prewitt_y':
      applyPrewittY(data, width, height, k, params.strength ?? 100);
      break;
    case 'filter_roberts_cross':
      applyRobertsCross(data, width, height, k, params.strength ?? 100);
      break;
    case 'filter_scharr':
      applyScharr(data, width, height, k, params.strength ?? 100);
      break;
    case 'filter_laplacian':
      applyLaplacian(data, width, height, k, params.strength ?? 100);
      break;
    case 'filter_canny':
      applyCanny(
        data,
        width,
        height,
        k,
        params.lowThreshold ?? 30,
        params.highThreshold ?? 80,
        params.sigma ?? 1.4
      );
      break;
    case 'filter_log':
      applyLoG(data, width, height, k, params.sigma ?? 1.4);
      break;
    case 'filter_dog':
      applyDoG(data, width, height, k, params.sigma1 ?? 1.0, params.sigma2 ?? 2.0);
      break;
    case 'filter_find_edges':
      applyFindEdges(data, width, height, k, params.strength ?? 100);
      break;
    case 'filter_edge_enhance':
      applyEdgeEnhance(data, width, height, k, params.strength ?? 50);
      break;

    // 6. Morphology
    case 'filter_erosion':
      applyErosion(data, width, height, k, params.kernelSize ?? 3, params.shape ?? 'square');
      break;
    case 'filter_dilation':
      applyDilation(data, width, height, k, params.kernelSize ?? 3, params.shape ?? 'square');
      break;
    case 'filter_opening':
      applyOpening(data, width, height, k, params.kernelSize ?? 3, params.shape ?? 'square');
      break;
    case 'filter_closing':
      applyClosing(data, width, height, k, params.kernelSize ?? 3, params.shape ?? 'square');
      break;
    case 'filter_morph_gradient':
      applyMorphologicalGradient(data, width, height, k, params.kernelSize ?? 3, params.shape ?? 'square');
      break;
    case 'filter_top_hat':
      applyTopHat(data, width, height, k, params.kernelSize ?? 3, params.shape ?? 'square');
      break;
    case 'filter_black_hat':
      applyBlackHat(data, width, height, k, params.kernelSize ?? 3, params.shape ?? 'square');
      break;
    case 'filter_boundary_extraction':
      applyBoundaryExtraction(data, width, height, k, params.kernelSize ?? 3, params.shape ?? 'square');
      break;

    // 7. Global / Histogram
    case 'filter_hist_equalization':
      applyHistogramEqualization(data, k);
      break;
    case 'filter_clahe':
      applyCLAHE(data, width, height, k, params.clipLimit ?? 2.0, params.gridSize ?? 8);
      break;
    case 'filter_hist_stretching':
      applyHistogramStretching(data, k, params.lowPercentile ?? 1, params.highPercentile ?? 99);
      break;
    case 'filter_hist_matching':
      applyHistogramMatching(data, k);
      break;
    case 'filter_global_threshold_otsu':
      applyGlobalThresholdOtsu(data, k);
      break;

    // 8. Frequency Domain
    case 'filter_ideal_low_pass':
      applyIdealLowPass(data, width, height, k, params.cutoff ?? 30);
      break;
    case 'filter_gaussian_low_pass':
      applyGaussianLowPass(data, width, height, k, params.cutoff ?? 30);
      break;
    case 'filter_butterworth_low_pass':
      applyButterworthLowPass(data, width, height, k, params.cutoff ?? 30, params.order ?? 2);
      break;
    case 'filter_ideal_high_pass':
      applyIdealHighPass(data, width, height, k, params.cutoff ?? 20);
      break;
    case 'filter_gaussian_high_pass':
      applyGaussianHighPass(data, width, height, k, params.cutoff ?? 20);
      break;
    case 'filter_butterworth_high_pass':
      applyButterworthHighPass(data, width, height, k, params.cutoff ?? 20, params.order ?? 2);
      break;
    case 'filter_band_pass':
      applyBandPass(data, width, height, k, params.centerFreq ?? 30, params.bandwidth ?? 15);
      break;
    case 'filter_band_reject':
      applyBandReject(data, width, height, k, params.centerFreq ?? 30, params.bandwidth ?? 15);
      break;
    case 'filter_notch_filter':
      applyNotchFilter(data, width, height, k, params.notchRadius ?? 10, params.notchDistance ?? 35);
      break;

    default:
      break;
  }
}
