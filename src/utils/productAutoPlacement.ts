/**
 * Pixelora Product Studio - Smart Product Auto-Placement & Composition Engine
 * Mathematically calculates product bounds, safe margins, centering, and podium anchoring
 * across any canvas aspect ratio and resolution (1080x1080, 1920x1080, 1080x1350, 1080x1920, etc.).
 */

import { Layer, ProductScene } from '../types';
import { DEFAULT_FILTERS } from '../data/sampleProjects';
import { getPodiumSvgDataUrl, getLightingSvgDataUrl } from './podiumGenerators';

export interface PlacementResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculates optimal product dimensions and position based on scene, canvas, and product aspect ratio.
 */
export function autoPlaceProduct(
  productLayer: Layer,
  canvasWidth: number,
  canvasHeight: number,
  scene: ProductScene
): PlacementResult {
  // 1. Calculate natural aspect ratio
  const naturalWidth = productLayer.bitmapWidth || productLayer.width || 500;
  const naturalHeight = productLayer.bitmapHeight || productLayer.height || 500;
  const aspect = naturalWidth > 0 && naturalHeight > 0 ? naturalWidth / naturalHeight : 1;

  // 2. Base target dimensions from scene scale ratio
  const baseScale = scene.placement.scaleRatio || 0.48;
  let targetHeight = canvasHeight * baseScale;
  let targetWidth = targetHeight * aspect;

  // 3. Safe boundaries
  const maxAllowedWidth = canvasWidth * 0.70;
  const maxAllowedHeight = canvasHeight * 0.62;

  // Scale down if exceeding safe width
  if (targetWidth > maxAllowedWidth) {
    targetWidth = maxAllowedWidth;
    targetHeight = targetWidth / aspect;
  }

  // Scale down if exceeding safe height
  if (targetHeight > maxAllowedHeight) {
    targetHeight = maxAllowedHeight;
    targetWidth = targetHeight * aspect;
  }

  // Minimum size clamp
  const minDimension = Math.min(canvasWidth, canvasHeight) * 0.20;
  if (targetHeight < minDimension && targetWidth < minDimension) {
    if (aspect >= 1) {
      targetWidth = minDimension;
      targetHeight = targetWidth / aspect;
    } else {
      targetHeight = minDimension;
      targetWidth = targetHeight * aspect;
    }
  }

  targetWidth = Math.round(targetWidth);
  targetHeight = Math.round(targetHeight);

  // 4. Horizontal alignment (always centered in scene)
  const x = Math.round((canvasWidth - targetWidth) / 2);

  // 5. Vertical alignment based on scene anchor
  let y = Math.round((canvasHeight - targetHeight) / 2);

  if (scene.placement.verticalAnchor === 'on_podium' && scene.podium) {
    // Top surface of the podium is at canvasHeight * podium.yRatio
    const podiumSurfaceY = canvasHeight * scene.podium.yRatio;
    // Rest product bottom edge right on the podium surface with 2% visual sink for grounding
    const visualSink = Math.round(targetHeight * 0.025);
    y = Math.round(podiumSurfaceY - targetHeight + visualSink);
  } else if (scene.placement.verticalAnchor === 'floating') {
    // Elevate product gracefully in the upper-mid area (Zero-G)
    y = Math.round(canvasHeight * 0.36 - targetHeight / 2);
  } else if (scene.placement.verticalAnchor === 'surface') {
    // Ground product in the lower third
    const groundY = canvasHeight * 0.74;
    y = Math.round(groundY - targetHeight);
  }

  // Apply fine-tuning offset if configured
  if (scene.placement.yOffsetRatio) {
    y += Math.round(canvasHeight * scene.placement.yOffsetRatio);
  }

  // Clamp within canvas safety zone (at least 3% margin from top and bottom)
  const minY = Math.round(canvasHeight * 0.03);
  const maxY = Math.round(canvasHeight * 0.96 - targetHeight);
  y = Math.max(minY, Math.min(y, maxY));

  return { x, y, width: targetWidth, height: targetHeight };
}

/**
 * Centers product layer strictly within canvas dimensions.
 */
export function centerProductInCanvas(
  layer: Layer,
  canvasWidth: number,
  canvasHeight: number
): PlacementResult {
  return {
    x: Math.round((canvasWidth - layer.width) / 2),
    y: Math.round((canvasHeight - layer.height) / 2),
    width: layer.width,
    height: layer.height,
  };
}

/**
 * Rescales product to comfortably fit the scene dimensions (max 65% of canvas).
 */
export function fitProductToCanvas(
  layer: Layer,
  canvasWidth: number,
  canvasHeight: number
): PlacementResult {
  const aspect = (layer.bitmapWidth || layer.width) / (layer.bitmapHeight || layer.height) || 1;
  const maxWidth = canvasWidth * 0.65;
  const maxHeight = canvasHeight * 0.65;

  let width = maxWidth;
  let height = width / aspect;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspect;
  }

  width = Math.round(width);
  height = Math.round(height);

  return {
    x: Math.round((canvasWidth - width) / 2),
    y: Math.round((canvasHeight - height) / 2),
    width,
    height,
  };
}

/**
 * Creates a podium layer for a scene.
 */
export function createPodiumLayer(
  scene: ProductScene,
  canvasWidth: number,
  canvasHeight: number,
  zIndex: number
): Layer | null {
  if (!scene.podium || scene.podium.type === 'none') {
    return null;
  }

  const svgDataUrl = getPodiumSvgDataUrl(scene.podium.type);
  const width = Math.round(canvasWidth * scene.podium.widthRatio);
  const height = Math.round(canvasHeight * scene.podium.heightRatio);
  const x = Math.round((canvasWidth - width) / 2);
  // Position podium so its top ellipse aligns with yRatio
  const y = Math.round(canvasHeight * scene.podium.yRatio - height * 0.33);

  return {
    id: `scene_podium_${scene.id}_${Date.now()}`,
    name: scene.podium.nameAr || 'منصة العرض',
    type: 'image',
    source: svgDataUrl,
    x,
    y,
    width,
    height,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex,
    filters: { ...DEFAULT_FILTERS },
    isSceneLayer: true,
    sceneRole: 'podium',
  };
}

/**
 * Creates a lighting overlay layer for a scene.
 */
export function createLightingLayer(
  scene: ProductScene,
  canvasWidth: number,
  canvasHeight: number,
  zIndex: number
): Layer | null {
  if (!scene.lighting || scene.lighting.type === 'none') {
    return null;
  }

  const svgDataUrl = getLightingSvgDataUrl(scene.lighting.type);

  return {
    id: `scene_lighting_${scene.id}_${Date.now()}`,
    name: scene.lighting.nameAr || 'إضاءة المشهد',
    type: 'image',
    source: svgDataUrl,
    x: 0,
    y: 0,
    width: canvasWidth,
    height: canvasHeight,
    rotation: 0,
    opacity: scene.lighting.opacity,
    visible: true,
    locked: false,
    zIndex,
    filters: { ...DEFAULT_FILTERS },
    isSceneLayer: true,
    sceneRole: 'lighting',
  };
}
