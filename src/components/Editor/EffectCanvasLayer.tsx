import React, { useEffect, useRef } from 'react';
import { Layer, BackgroundConfig } from '../../types';
import { renderCompositeCanvas, loadImage, buildCanvasFilterString } from '../../utils/compositeRenderer';
import {
  hasAdvancedFilters,
  getEffectiveLayerFilters,
  applyLightroomPipelineToImageData,
  applyBlurToImageData,
  applySharpeningToImageData,
  applyGrainToImageData,
  applyVignetteToCanvas,
} from '../../utils/imageEnhancer';

interface EffectCanvasLayerProps {
  layer: Layer;
  layers: Layer[];
  canvasWidth: number;
  canvasHeight: number;
  background: BackgroundConfig;
  isErasing?: boolean;
  liveErasingCanvasRef?: React.MutableRefObject<HTMLCanvasElement | null>;
  liveTick?: number;
}

export const EffectCanvasLayer: React.FC<EffectCanvasLayerProps> = ({
  layer,
  layers,
  canvasWidth,
  canvasHeight,
  background,
  isErasing,
  liveErasingCanvasRef,
  liveTick,
}) => {
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const affectedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isRenderingRef = useRef(false);
  const maskImgCacheRef = useRef<{ url: string; img: HTMLImageElement } | null>(null);

  // Compute layers below this effect layer
  const layersBelow = layers.filter(
    (l) => l.visible && (l.zIndex || 0) < (layer.zIndex || 0) && l.id !== layer.id
  );

  // 1. Render base composite and apply photographic effect pipeline
  useEffect(() => {
    let isCancelled = false;

    const computeAffectedPixels = async () => {
      if (isCancelled) return;
      isRenderingRef.current = true;

      try {
        const w = Math.max(1, Math.round(canvasWidth));
        const h = Math.max(1, Math.round(canvasHeight));

        // Render all layers beneath this effect
        const sourceComposite = await renderCompositeCanvas(
          layersBelow,
          background,
          canvasWidth,
          canvasHeight
        );

        if (isCancelled) return;

        // Create or reuse offscreen affected canvas
        const affCanvas = document.createElement('canvas');
        affCanvas.width = w;
        affCanvas.height = h;
        const affCtx = affCanvas.getContext('2d', { willReadFrequently: true });
        if (!affCtx) return;

        affCtx.drawImage(sourceComposite, 0, 0, w, h);

        const effective = getEffectiveLayerFilters(layer.filters);
        const isAdv = hasAdvancedFilters(layer.filters) || (effective.blur && effective.blur > 0);

        if (isAdv) {
          const imgData = affCtx.getImageData(0, 0, w, h);
          applyLightroomPipelineToImageData(imgData, effective);

          if (effective.blur && effective.blur > 0) {
            applyBlurToImageData(imgData, effective.blur);
          }

          if (
            (effective.sharpness && effective.sharpness > 0) ||
            (effective.sharpeningDetail && effective.sharpeningDetail.amount > 0)
          ) {
            applySharpeningToImageData(imgData, effective.sharpness, effective.sharpeningDetail);
          }

          if (effective.grain && effective.grain.amount > 0) {
            applyGrainToImageData(imgData, effective.grain);
          }

          affCtx.putImageData(imgData, 0, 0);

          const vignetteAmt =
            typeof effective.vignette === 'number'
              ? effective.vignette
              : typeof effective.vignette === 'object'
              ? effective.vignette?.amount || 0
              : 0;

          if (vignetteAmt !== 0) {
            applyVignetteToCanvas(affCtx, w, h, {
              amount: vignetteAmt,
              midpoint: typeof effective.vignette === 'object' ? effective.vignette.midpoint : 50,
              feather: typeof effective.vignette === 'object' ? effective.vignette.feather : 50,
              roundness: typeof effective.vignette === 'object' ? effective.vignette.roundness : 0,
              highlights: typeof effective.vignette === 'object' ? effective.vignette.highlights : 0,
            });
          }
        } else {
          const filterStr = buildCanvasFilterString(layer.filters);
          if (filterStr !== 'none') {
            const tempC = document.createElement('canvas');
            tempC.width = w;
            tempC.height = h;
            const tempCtx = tempC.getContext('2d');
            if (tempCtx) {
              tempCtx.filter = filterStr;
              tempCtx.drawImage(affCanvas, 0, 0);
              affCtx.clearRect(0, 0, w, h);
              affCtx.drawImage(tempC, 0, 0);
            }
          }
        }

        affectedCanvasRef.current = affCanvas;

        // Cache mask image if exists
        if (layer.effectMask) {
          if (!maskImgCacheRef.current || maskImgCacheRef.current.url !== layer.effectMask) {
            try {
              const mImg = await loadImage(layer.effectMask);
              maskImgCacheRef.current = { url: layer.effectMask, img: mImg };
            } catch (mErr) {
              console.warn('Failed to load mask image:', mErr);
            }
          }
        } else {
          maskImgCacheRef.current = null;
        }

        // Draw onto the display canvas
        renderDisplayCanvas();
      } catch (err) {
        console.warn('EffectCanvasLayer render error:', err);
      } finally {
        isRenderingRef.current = false;
      }
    };

    computeAffectedPixels();

    return () => {
      isCancelled = true;
    };
  }, [
    layer.filters,
    layer.zIndex,
    layer.effectMask,
    canvasWidth,
    canvasHeight,
    background,
    // Representation of layersBelow to trigger update when lower layers change
    layersBelow
      .map(
        (l) =>
          `${l.id}_${l.zIndex}_${l.x}_${l.y}_${l.width}_${l.height}_${l.visible}_${l.source || ''}_${JSON.stringify(
            l.filters || {}
          )}`
      )
      .join(';'),
  ]);

  // 2. High-speed display rendering function (applies mask with destination-in)
  const renderDisplayCanvas = () => {
    const displayCanvas = displayCanvasRef.current;
    const affCanvas = affectedCanvasRef.current;
    if (!displayCanvas || !affCanvas) return;

    const w = displayCanvas.width;
    const h = displayCanvas.height;
    const ctx = displayCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, w, h);

    // Draw affected pixels
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(affCanvas, 0, 0, w, h);

    // Apply Mask if erasing live or if mask exists
    if (isErasing && liveErasingCanvasRef?.current) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(liveErasingCanvasRef.current, 0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    } else if (maskImgCacheRef.current?.img) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(maskImgCacheRef.current.img, 0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  // 3. Fast real-time update during live erasing strokes
  useEffect(() => {
    if (isErasing && liveErasingCanvasRef?.current) {
      renderDisplayCanvas();
    }
  }, [liveTick, isErasing]);

  return (
    <canvas
      ref={displayCanvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className="w-full h-full object-contain pointer-events-none absolute inset-0"
      style={{
        opacity: (layer.opacity ?? 100) / 100,
      }}
    />
  );
};
