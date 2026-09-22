import React, { useEffect, useRef, useState } from 'react';
import { Layer } from '../../types';
import {
  hasAdvancedFilters,
  getEffectiveLayerFilters,
  applyLightroomPipelineToImageData,
  applySharpeningToImageData,
  applyBlurToImageData,
  applyGrainToImageData,
  applyVignetteToCanvas,
} from '../../utils/imageEnhancer';

interface ProcessedImageLayerProps {
  layer: Layer;
  className?: string;
  onLoad?: () => void;
}

export const ProcessedImageLayer: React.FC<ProcessedImageLayerProps> = ({
  layer,
  className = 'w-full h-full object-contain pointer-events-none',
  onLoad,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  const isAdvanced = hasAdvancedFilters(layer.filters);

  // 1. Preload and cache the source image element
  useEffect(() => {
    if (!layer.source) return;

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (!isMounted) return;
      imgRef.current = img;
      setImageLoaded(true);
      if (onLoad) onLoad();
    };

    img.onerror = (err) => {
      console.warn('Failed to load image for processed layer:', err);
    };

    img.src = layer.source;

    return () => {
      isMounted = false;
    };
  }, [layer.source, onLoad]);

  // 2. Render pixel pipeline onto canvas when advanced adjustments are active
  useEffect(() => {
    if (!isAdvanced || !imageLoaded || !imgRef.current) return;

    const renderPixels = () => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img) return;

      const targetW = Math.max(1, Math.round(layer.width));
      const targetH = Math.max(1, Math.round(layer.height));

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.clearRect(0, 0, targetW, targetH);

      const effective = getEffectiveLayerFilters(layer.filters);

      // Draw original image cleanly to canvas
      ctx.drawImage(img, 0, 0, targetW, targetH);

      try {
        const imgData = ctx.getImageData(0, 0, targetW, targetH);

        // Execute full photographic Lightroom mathematical pipeline:
        // Tone Curves (RGB, Red, Green, Blue splines),
        // HSL Mixer (8 discrete color channels),
        // Color Grading (Shadows, Midtones, Highlights 3-way split toning),
        // Photographic Exposure, Brightness, Contrast, Saturation, Hue, Grayscale, Sepia, Invert,
        // Highlights, Shadows, Whites, Blacks, Temperature, Tint, Vibrance, Clarity, Dehaze, Texture, B&W Mix.
        applyLightroomPipelineToImageData(imgData, effective);

        // Apply optical Gaussian blur directly on ImageData pixels
        if (effective.blur && effective.blur > 0) {
          applyBlurToImageData(imgData, effective.blur);
        }

        // Apply optical unsharp masking / edge sharpening directly on ImageData
        if ((effective.sharpness && effective.sharpness > 0) || (effective.sharpeningDetail && effective.sharpeningDetail.amount > 0)) {
          applySharpeningToImageData(imgData, effective.sharpness, effective.sharpeningDetail);
        }

        // Apply realistic film grain directly on ImageData pixels
        if (effective.grain && effective.grain.amount > 0) {
          applyGrainToImageData(imgData, effective.grain);
        }

        ctx.putImageData(imgData, 0, 0);

        // Apply vignette with source-atop preservation of PNG cutouts
        const vignetteAmt =
          typeof effective.vignette === 'number'
            ? effective.vignette
            : typeof effective.vignette === 'object'
            ? effective.vignette?.amount || 0
            : 0;

        if (vignetteAmt !== 0) {
          applyVignetteToCanvas(ctx, targetW, targetH, {
            amount: vignetteAmt,
            midpoint:
              typeof effective.vignette === 'object'
                ? effective.vignette.midpoint
                : 50,
            feather:
              typeof effective.vignette === 'object'
                ? effective.vignette.feather
                : 50,
            roundness:
              typeof effective.vignette === 'object'
                ? effective.vignette.roundness
                : 0,
            highlights:
              typeof effective.vignette === 'object'
                ? effective.vignette.highlights
                : 0,
          });
        }
      } catch (err) {
        console.warn('Live pixel processing error:', err);
      }
    };

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    animFrameRef.current = requestAnimationFrame(renderPixels);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    isAdvanced,
    imageLoaded,
    layer.width,
    layer.height,
    layer.filters,
  ]);

  if (!layer.source) return null;

  // When advanced filters are active, render the live pixel canvas
  if (isAdvanced) {
    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{ width: '100%', height: '100%' }}
      />
    );
  }

  // Fast standard image tag for basic/unfiltered layers
  return (
    <img
      src={layer.source}
      alt={layer.name}
      referrerPolicy="no-referrer"
      draggable={false}
      className={className}
      onLoad={onLoad}
    />
  );
};
