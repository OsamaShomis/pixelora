import { Layer, BackgroundConfig, ExportSettings, ShapeConfig, TextConfig, DrawingPath, LayerFilters } from '../types';
import { DEFAULT_FILTERS } from '../data/sampleProjects';
import { drawShapeOnCanvas } from './shapeDrawer';
import { renderVectorPathOnCanvas } from './vectorPath';
import {
  applyLightroomPipelineToImageData,
  applySharpeningToImageData,
  applyBlurToImageData,
  applyGrainToImageData,
  applyVignetteToCanvas,
  applyGrainToCanvas,
  hasAdvancedFilters,
  getEffectiveLayerFilters,
} from './imageEnhancer';

/**
 * Helper to convert hex or color string to rgba
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  if (hex.startsWith('rgba') || hex.startsWith('hsla')) return hex;
  if (hex.startsWith('rgb')) {
    return hex.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
  }
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(0,0,0,${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Helper to safely load an image HTML element from a URL / base64 string
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Generates a CSS filter string corresponding to the layer filters for Canvas 2D context or preview
 */
export function buildCanvasFilterString(filters?: LayerFilters): string {
  if (!filters) return 'none';
  const effective = getEffectiveLayerFilters(filters);
  const parts: string[] = [];

  // 1. Brightness & Exposure & Highlights & Shadows & Whites & Blacks
  const totalBrightness = Math.round(
    Math.max(
      0,
      effective.brightness +
        (effective.exposure || 0) * 0.7 +
        (effective.highlights || 0) * 0.15 +
        (effective.shadows || 0) * 0.15 +
        (effective.whites || 0) * 0.2 +
        (effective.blacks || 0) * 0.15
    )
  );
  if (totalBrightness !== 100) parts.push(`brightness(${totalBrightness}%)`);

  // 2. Contrast & Clarity & Sharpness
  const totalContrast = Math.round(
    Math.max(
      0,
      effective.contrast +
        (effective.clarity || 0) * 0.35 +
        (effective.sharpness ? effective.sharpness * 0.08 : 0)
    )
  );
  if (totalContrast !== 100) parts.push(`contrast(${totalContrast}%)`);

  // 3. Saturation & Vibrance
  const totalSaturation = Math.round(
    Math.max(0, effective.saturation + (effective.vibrance || 0) * 0.5)
  );
  if (totalSaturation !== 100) parts.push(`saturate(${totalSaturation}%)`);

  // 4. Hue & Tint
  const totalHue = Math.round((effective.hue || 0) + (effective.tint || 0) * 0.4);
  if (totalHue !== 0) parts.push(`hue-rotate(${totalHue}deg)`);

  // 5. Temperature
  if (effective.temperature && effective.temperature !== 0) {
    if (effective.temperature > 0) {
      parts.push(`sepia(${Math.round(effective.temperature * 0.35)}%)`);
    } else {
      parts.push(`hue-rotate(${Math.round(effective.temperature * 0.25)}deg)`);
    }
  }

  // 6. Blur
  if (effective.blur && effective.blur > 0) {
    parts.push(`blur(${effective.blur}px)`);
  }

  // 7. Grayscale
  if (effective.grayscale && effective.grayscale > 0) {
    parts.push(`grayscale(${effective.grayscale}%)`);
  }

  // 8. Sepia
  if (effective.sepia && effective.sepia > 0) {
    parts.push(`sepia(${effective.sepia}%)`);
  }

  // 9. Invert
  if (effective.invert && effective.invert > 0) {
    parts.push(`invert(${effective.invert}%)`);
  }

  // 10. Black & White Mode
  if (effective.bwEnabled) {
    parts.push(`grayscale(100%)`);
  }

  // 11. Legacy Presets if presetFilter is one of the classic quick keywords
  if (effective.presetFilter && effective.presetFilter !== 'none') {
    const k = (effective.presetIntensity ?? 100) / 100;
    switch (effective.presetFilter) {
      case 'bw':
        parts.push(`grayscale(${Math.round(100 * k)}%)`);
        break;
      case 'sepia':
        parts.push(`sepia(${Math.round(100 * k)}%)`);
        break;
      case 'vintage':
        parts.push(
          `sepia(${Math.round(50 * k)}%) contrast(${Math.round(100 + 20 * k)}%) brightness(${Math.round(100 - 10 * k)}%)`
        );
        break;
      case 'cool':
        parts.push(
          `hue-rotate(${Math.round(180 * k)}deg) saturate(${Math.round(100 + 20 * k)}%)`
        );
        break;
      case 'warm':
        parts.push(
          `sepia(${Math.round(30 * k)}%) saturate(${Math.round(100 + 40 * k)}%)`
        );
        break;
      case 'edges':
        parts.push(
          `contrast(${Math.round(100 + 100 * k)}%) grayscale(${Math.round(100 * k)}%)`
        );
        break;
      case 'auto_enhance':
        parts.push(
          `contrast(${Math.round(100 + 15 * k)}%) saturate(${Math.round(100 + 20 * k)}%) brightness(${Math.round(100 + 5 * k)}%)`
        );
        break;
      default:
        break;
    }
  }

  return parts.length > 0 ? parts.join(' ') : 'none';
}

/**
 * Draws a background on the target Canvas 2D context
 */
export async function renderBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: BackgroundConfig,
  preserveTransparency: boolean
) {
  if (background.type === 'transparent' || preserveTransparency) {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    return;
  }

  if (background.type === 'solid') {
    ctx.fillStyle = background.color || '#ffffff';
    ctx.fillRect(0, 0, width, height);
  } else if (background.type === 'gradient' && background.gradient) {
    const angleRad = ((background.gradient.angle || 0) * Math.PI) / 180;
    const x1 = width / 2 - (Math.cos(angleRad) * width) / 2;
    const y1 = height / 2 - (Math.sin(angleRad) * height) / 2;
    const x2 = width / 2 + (Math.cos(angleRad) * width) / 2;
    const y2 = height / 2 + (Math.sin(angleRad) * height) / 2;

    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, background.gradient.from || '#6C4DFF');
    grad.addColorStop(1, background.gradient.to || '#23B5D3');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if ((background.type === 'library' || background.type === 'custom_image') && background.imageUrl) {
    try {
      const bgImg = await loadImage(background.imageUrl);
      ctx.drawImage(bgImg, 0, 0, width, height);
    } catch {
      // Fallback to solid if image fails to load
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, width, height);
    }
  } else {
    // Default fallback
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Draws a geometric shape on the Canvas context
 */
export function renderShape(ctx: CanvasRenderingContext2D, shape: ShapeConfig, width: number, height: number) {
  drawShapeOnCanvas(ctx, shape, width, height);
}

/**
 * Draws text on the Canvas context with RTL support, gradients, shadows, strokes & formatting
 */
export function renderText(ctx: CanvasRenderingContext2D, textConfig: TextConfig, width: number, height: number) {
  ctx.save();
  const fontSize = textConfig.fontSize || 36;
  const fontFamily = textConfig.fontFamily || 'Tajawal, sans-serif';
  const isBold = textConfig.bold ? 'bold ' : '';
  const isItalic = textConfig.italic ? 'italic ' : '';

  if (textConfig.opacity !== undefined) {
    ctx.globalAlpha = Math.max(0, Math.min(1, ctx.globalAlpha * textConfig.opacity));
  }

  ctx.font = `${isItalic}${isBold}${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'middle';

  const align = textConfig.align === 'justify' ? 'center' : (textConfig.align || 'center');
  ctx.textAlign = align as CanvasTextAlign;

  // Background color if present
  if (textConfig.backgroundColor && textConfig.backgroundColor !== 'transparent') {
    ctx.save();
    ctx.fillStyle = textConfig.backgroundColor;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // Shadow configuration
  if (textConfig.shadow && (textConfig.shadow.enabled !== false)) {
    const shadowAlpha = textConfig.shadow.opacity !== undefined ? textConfig.shadow.opacity : 0.6;
    ctx.shadowColor = textConfig.shadow.color.startsWith('#')
      ? `${textConfig.shadow.color}${Math.round(shadowAlpha * 255).toString(16).padStart(2, '0')}`
      : textConfig.shadow.color || 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = textConfig.shadow.blur ?? 4;
    ctx.shadowOffsetX = textConfig.shadow.offsetX ?? 2;
    ctx.shadowOffsetY = textConfig.shadow.offsetY ?? 2;
  }

  // Gradient or Solid Fill Style
  if (textConfig.gradient?.enabled) {
    const angleRad = ((textConfig.gradient.angle || 135) * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.max(width, height) / 2;
    const x0 = cx - Math.cos(angleRad) * r;
    const y0 = cy - Math.sin(angleRad) * r;
    const x1 = cx + Math.cos(angleRad) * r;
    const y1 = cy + Math.sin(angleRad) * r;

    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, textConfig.gradient.from || '#6C4DFF');
    grad.addColorStop(1, textConfig.gradient.to || '#23B5D3');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = textConfig.color || '#172033';
  }

  const rawText = textConfig.uppercase ? textConfig.text.toUpperCase() : textConfig.text;
  const lines = rawText.split('\n');
  const lineSpacing = (textConfig.lineHeight || 1.2) * fontSize;
  const totalTextHeight = lines.length * lineSpacing;
  const startY = (height - totalTextHeight) / 2 + lineSpacing / 2;

  const posX = align === 'left' ? 12 : align === 'right' ? width - 12 : width / 2;

  // Render each line
  lines.forEach((line, idx) => {
    const currentY = startY + idx * lineSpacing;

    // Stroke / Outline if enabled
    if (textConfig.stroke?.enabled && textConfig.stroke.width > 0) {
      ctx.save();
      ctx.strokeStyle = textConfig.stroke.color || '#000000';
      ctx.lineWidth = textConfig.stroke.width * 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeText(line, posX, currentY);
      ctx.restore();
    }

    // Fill Text
    ctx.fillText(line, posX, currentY);

    const textWidth = ctx.measureText(line).width;
    let lineStartX = posX - textWidth / 2;
    if (align === 'left') lineStartX = posX;
    if (align === 'right') lineStartX = posX - textWidth;

    // Underline
    if (textConfig.underline) {
      ctx.save();
      ctx.lineWidth = Math.max(2, fontSize / 14);
      ctx.strokeStyle = textConfig.color || '#172033';
      ctx.beginPath();
      ctx.moveTo(lineStartX, currentY + fontSize * 0.45);
      ctx.lineTo(lineStartX + textWidth, currentY + fontSize * 0.45);
      ctx.stroke();
      ctx.restore();
    }

    // Strikethrough
    if (textConfig.strikethrough) {
      ctx.save();
      ctx.lineWidth = Math.max(2, fontSize / 14);
      ctx.strokeStyle = textConfig.color || '#172033';
      ctx.beginPath();
      ctx.moveTo(lineStartX, currentY);
      ctx.lineTo(lineStartX + textWidth, currentY);
      ctx.stroke();
      ctx.restore();
    }
  });

  ctx.restore();
}

/**
 * Helper to draw a star at (cx, cy)
 */
function drawCanvasStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Helper to draw a heart at (cx, cy)
 */
function drawCanvasHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(0, topCurveHeight);
  // top left curve
  ctx.bezierCurveTo(-size / 2, -topCurveHeight, -size / 2, size / 3, 0, size * 0.7);
  // top right curve
  ctx.bezierCurveTo(size / 2, size / 3, size / 2, -topCurveHeight, 0, topCurveHeight);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draws freehand paths on the Canvas context with hardness/feathering, brush types, and tip shapes
 */
export function renderDrawingPaths(ctx: CanvasRenderingContext2D, paths: DrawingPath[]) {
  if (!paths || paths.length === 0) return;

  for (const path of paths) {
    if (!path.points || path.points.length < 1) continue;
    ctx.save();

    const isSquare = path.tipShape === 'square';
    const capStyle: CanvasLineCap = isSquare ? 'square' : 'round';
    const joinStyle: CanvasLineJoin = isSquare ? 'miter' : 'round';
    const bType = path.brushType || 'soft';

    if (path.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.lineCap = capStyle;
      ctx.lineJoin = joinStyle;

      const hardness = path.hardness !== undefined ? path.hardness : 0.8;
      if (hardness < 0.9) {
        ctx.shadowColor = 'rgba(0,0,0,1)';
        ctx.shadowBlur = Math.round((1 - hardness) * (path.size / 2));
      }
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = path.color || '#6C4DFF';
      ctx.fillStyle = path.color || '#6C4DFF';
      ctx.lineCap = capStyle;
      ctx.lineJoin = joinStyle;

      const hardness = path.hardness !== undefined ? path.hardness : 0.7;
      if (bType === 'airbrush') {
        ctx.shadowColor = path.color || '#6C4DFF';
        ctx.shadowBlur = Math.max(4, Math.round(path.size * 0.6));
      } else if (hardness < 0.85) {
        ctx.shadowColor = path.color;
        ctx.shadowBlur = Math.max(2, Math.round((1 - hardness) * 14));
      }
    }

    ctx.globalAlpha = path.opacity !== undefined ? path.opacity : 1;
    ctx.lineWidth = path.size || 5;

    // Special decorative brushes
    if (bType === 'stars' && path.tool !== 'eraser') {
      const starRadius = Math.max(4, path.size / 1.5);
      const step = Math.max(1, Math.floor(starRadius * 0.8));
      for (let i = 0; i < path.points.length; i += step) {
        const pt = path.points[i];
        drawCanvasStar(ctx, pt.x, pt.y, starRadius);
      }
    } else if (bType === 'hearts' && path.tool !== 'eraser') {
      const heartSize = Math.max(6, path.size);
      const step = Math.max(1, Math.floor(heartSize * 0.8));
      for (let i = 0; i < path.points.length; i += step) {
        const pt = path.points[i];
        drawCanvasHeart(ctx, pt.x, pt.y, heartSize);
      }
    } else if (bType === 'spray' && path.tool !== 'eraser') {
      const radius = path.size / 2;
      for (const pt of path.points) {
        for (let s = 0; s < 4; s++) {
          const offAngle = Math.random() * Math.PI * 2;
          const offDist = Math.random() * radius;
          const sx = pt.x + Math.cos(offAngle) * offDist;
          const sy = pt.y + Math.sin(offAngle) * offDist;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(1, radius * 0.15), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      // Standard / Soft / Hard / Pencil / Ink line strokes
      if (path.points.length === 1) {
        ctx.beginPath();
        if (isSquare) {
          const half = (path.size || 5) / 2;
          ctx.fillRect(path.points[0].x - half, path.points[0].y - half, path.size || 5, path.size || 5);
        } else {
          ctx.arc(path.points[0].x, path.points[0].y, (path.size || 5) / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

/**
 * Renders an entire composite image onto a canvas and returns the canvas element
 */
export async function renderCompositeCanvas(
  layers: Layer[],
  background: BackgroundConfig,
  canvasWidth: number,
  canvasHeight: number,
  exportWidth?: number,
  exportHeight?: number,
  preserveTransparency = false
): Promise<HTMLCanvasElement> {
  const finalWidth = exportWidth || canvasWidth;
  const finalHeight = exportHeight || canvasHeight;

  const canvas = document.createElement('canvas');
  canvas.width = finalWidth;
  canvas.height = finalHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2d context for composite rendering');

  const scaleX = finalWidth / canvasWidth;
  const scaleY = finalHeight / canvasHeight;

  // 1. Render Background
  ctx.save();
  await renderBackground(ctx, finalWidth, finalHeight, background, preserveTransparency);
  ctx.restore();

  // 2. Sort visible layers by zIndex
  const sortedLayers = [...layers]
    .filter((l) => l.visible !== false)
    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  // 3. Render each layer
  for (const layer of sortedLayers) {
    // 3A. Effect Layer Handling: Applies photographic Lightroom / filter effects to the composite underneath
    if (layer.type === 'effect') {
      const effCanvas = document.createElement('canvas');
      effCanvas.width = canvas.width;
      effCanvas.height = canvas.height;
      const effCtx = effCanvas.getContext('2d', { willReadFrequently: true });
      if (effCtx) {
        effCtx.drawImage(canvas, 0, 0);

        const effective = getEffectiveLayerFilters(layer.filters);
        const isAdv = hasAdvancedFilters(layer.filters) || (effective.blur && effective.blur > 0);

        if (isAdv) {
          try {
            const imgData = effCtx.getImageData(0, 0, effCanvas.width, effCanvas.height);
            applyLightroomPipelineToImageData(imgData, effective);

            if (effective.blur && effective.blur > 0) {
              applyBlurToImageData(imgData, effective.blur * ((scaleX + scaleY) / 2));
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

            effCtx.putImageData(imgData, 0, 0);

            const vignetteAmt =
              typeof effective.vignette === 'number'
                ? effective.vignette
                : typeof effective.vignette === 'object'
                ? effective.vignette?.amount || 0
                : 0;

            if (vignetteAmt !== 0) {
              applyVignetteToCanvas(effCtx, effCanvas.width, effCanvas.height, {
                amount: vignetteAmt,
                midpoint: typeof effective.vignette === 'object' ? effective.vignette.midpoint : 50,
                feather: typeof effective.vignette === 'object' ? effective.vignette.feather : 50,
                roundness: typeof effective.vignette === 'object' ? effective.vignette.roundness : 0,
                highlights: typeof effective.vignette === 'object' ? effective.vignette.highlights : 0,
              });
            }
          } catch (e) {
            console.warn('Effect layer rendering error:', e);
          }
        } else {
          const filterStr = buildCanvasFilterString(layer.filters);
          if (filterStr !== 'none') {
            const tempC = document.createElement('canvas');
            tempC.width = effCanvas.width;
            tempC.height = effCanvas.height;
            const tempCtx = tempC.getContext('2d');
            if (tempCtx) {
              tempCtx.filter = filterStr;
              tempCtx.drawImage(effCanvas, 0, 0);
              effCtx.clearRect(0, 0, effCanvas.width, effCanvas.height);
              effCtx.drawImage(tempC, 0, 0);
            }
          }
        }

        // Apply non-destructive mask if present
        if (layer.effectMask) {
          try {
            const maskImg = await loadImage(layer.effectMask);
            effCtx.globalCompositeOperation = 'destination-in';
            effCtx.drawImage(maskImg, 0, 0, effCanvas.width, effCanvas.height);
            effCtx.globalCompositeOperation = 'source-over';
          } catch (mErr) {
            console.warn('Failed to apply effect mask:', mErr);
          }
        }

        ctx.save();
        ctx.globalAlpha =
          ((layer.opacity !== undefined ? layer.opacity : 100) / 100) *
          ((layer.filters?.opacity !== undefined ? layer.filters.opacity : 100) / 100);
        ctx.drawImage(effCanvas, 0, 0);
        ctx.restore();
      }
      continue;
    }

    ctx.save();

    // Scale layer coordinates to target canvas dimensions
    const lx = layer.x * scaleX;
    const ly = layer.y * scaleY;
    const lw = layer.width * scaleX;
    const lh = layer.height * scaleY;

    // Apply layer transform (position, rotation, skew, pivot, flip)
    const pivotX = layer.pivotX !== undefined ? layer.pivotX : 0.5;
    const pivotY = layer.pivotY !== undefined ? layer.pivotY : 0.5;
    ctx.translate(lx + lw * pivotX, ly + lh * pivotY);
    if (layer.rotation) {
      ctx.rotate((layer.rotation * Math.PI) / 180);
    }
    if (layer.skewX || layer.skewY) {
      const tanX = Math.tan(((layer.skewX || 0) * Math.PI) / 180);
      const tanY = Math.tan(((layer.skewY || 0) * Math.PI) / 180);
      ctx.transform(1, tanY, tanX, 1, 0, 0);
    }
    const flipX = layer.flipHorizontal ? -1 : 1;
    const flipY = layer.flipVertical ? -1 : 1;
    ctx.scale(flipX, flipY);
    ctx.translate(-lw * pivotX, -lh * pivotY);

    // Apply global opacity
    const layerOpacity = (layer.opacity !== undefined ? layer.opacity : 100) / 100;
    const filterOpacity = (layer.filters?.opacity !== undefined ? layer.filters.opacity : 100) / 100;
    ctx.globalAlpha = Math.max(0, Math.min(1, layerOpacity * filterOpacity));

    // Apply filter string
    const filterString = buildCanvasFilterString(layer.filters);
    if (filterString !== 'none') {
      try {
        ctx.filter = filterString;
      } catch {
        // Fallback if browser doesn't support context filter
      }
    }

    if (layer.type === 'image' && layer.source) {
      try {
        const img = await loadImage(layer.source);

        // Render into an offscreen canvas to isolate layer effects and preserve transparency
        const offCanvas = document.createElement('canvas');
        offCanvas.width = Math.max(1, Math.round(lw));
        offCanvas.height = Math.max(1, Math.round(lh));
        const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

        if (offCtx) {
          const isAdvanced = hasAdvancedFilters(layer.filters);
          const effective = getEffectiveLayerFilters(layer.filters);

          if (isAdvanced) {
            // Advanced Lightroom Pipeline: Draw clean image and process actual pixels with full mathematical fidelity
            offCtx.filter = 'none';
            offCtx.drawImage(img, 0, 0, offCanvas.width, offCanvas.height);

            try {
              const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
              // Run the complete photographic pipeline (Tone Curves, HSL, Color Grading, Exposure, Brightness, Contrast, Saturation, Hue, Grayscale, Sepia, Invert, etc.)
              applyLightroomPipelineToImageData(imgData, effective);

              // Apply optical Gaussian blur directly on ImageData pixels
              if (effective.blur && effective.blur > 0) {
                applyBlurToImageData(imgData, effective.blur);
              }

              // Apply true optical unsharp masking / edge sharpening directly on ImageData
              if ((effective.sharpness && effective.sharpness > 0) || (effective.sharpeningDetail && effective.sharpeningDetail.amount > 0)) {
                applySharpeningToImageData(imgData, effective.sharpness, effective.sharpeningDetail);
              }

              // Apply realistic film grain directly on ImageData pixels
              if (effective.grain && effective.grain.amount > 0) {
                applyGrainToImageData(imgData, effective.grain);
              }

              offCtx.putImageData(imgData, 0, 0);
            } catch (pErr) {
              console.warn('Advanced pixel pipeline fallback:', pErr);
            }
          } else {
            // Fast CSS filter path for basic brightness/contrast adjustments
            if (filterString !== 'none') {
              try {
                offCtx.filter = filterString;
              } catch {
                // Fallback
              }
            }
            offCtx.drawImage(img, 0, 0, offCanvas.width, offCanvas.height);
            offCtx.filter = 'none';
          }

          // 3. Vignette effect overlay using source-atop (preserves PNG cutout transparency!)
          const effectiveFilters = effective;
          const vignetteAmt =
            typeof effectiveFilters.vignette === 'number'
              ? effectiveFilters.vignette
              : typeof effectiveFilters.vignette === 'object'
              ? effectiveFilters.vignette?.amount || 0
              : 0;

          if (vignetteAmt !== 0) {
            applyVignetteToCanvas(offCtx, offCanvas.width, offCanvas.height, {
              amount: vignetteAmt,
              midpoint:
                typeof effectiveFilters.vignette === 'object'
                  ? effectiveFilters.vignette.midpoint
                  : 50,
              feather:
                typeof effectiveFilters.vignette === 'object'
                  ? effectiveFilters.vignette.feather
                  : 50,
              roundness:
                typeof effectiveFilters.vignette === 'object'
                  ? effectiveFilters.vignette.roundness
                  : 0,
              highlights:
                typeof effectiveFilters.vignette === 'object'
                  ? effectiveFilters.vignette.highlights
                  : 0,
            });
          }

          // 4. Product / Layer Shadow Rendering
          const shadow = layer.shadow;
          if (shadow && shadow.enabled) {
            const rad = ((shadow.angle || 90) * Math.PI) / 180;
            const dist = shadow.distance || (shadow.type === 'floating' ? 35 : 8);
            const ox = Math.round(dist * Math.cos(rad));
            const oy = Math.round(dist * Math.sin(rad));
            const blur = shadow.blur || 20;
            const alpha = (shadow.opacity || 50) / 100;
            const color = shadow.color || '#000000';

            if (shadow.type === 'contact' || shadow.type === 'floating') {
              const isFloating = shadow.type === 'floating';
              const shadowW = isFloating ? lw * 0.75 : lw * 0.88;
              const shadowH = isFloating ? Math.max(12, lh * 0.12) : Math.max(8, lh * 0.10);
              const cx = lw / 2 + ox;
              const cy = isFloating ? lh + oy + (dist * 0.5) : lh - (shadowH * 0.55) + oy;

              ctx.save();
              ctx.filter = `blur(${Math.max(1, Math.round(blur / 2))}px)`;
              ctx.globalAlpha = alpha;
              const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, shadowW / 2);
              grad.addColorStop(0, color);
              grad.addColorStop(0.75, 'transparent');
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.ellipse(cx, cy, shadowW / 2, shadowH / 2, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            } else if (shadow.type === 'drop') {
              ctx.shadowColor = hexToRgba(color, alpha);
              ctx.shadowBlur = blur;
              ctx.shadowOffsetX = ox;
              ctx.shadowOffsetY = oy;
            }
          }

          // 5. Draw the fully processed offscreen canvas onto the main canvas
          ctx.drawImage(offCanvas, 0, 0, lw, lh);

          // Reset shadow
          if (shadow && shadow.enabled && shadow.type === 'drop') {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }
        } else {
          ctx.drawImage(img, 0, 0, lw, lh);
        }
      } catch (err) {
        console.warn(`Failed to render layer image: ${layer.name}`, err);
      }
    } else if (layer.type === 'shape' && layer.shapeConfig) {
      renderShape(ctx, layer.shapeConfig, lw, lh);
    } else if (layer.type === 'text' && layer.textConfig) {
      renderText(ctx, layer.textConfig, lw, lh);
    } else if (layer.type === 'drawing' && layer.drawingPaths) {
      // Scale drawing paths proportionally
      const scaledPaths = layer.drawingPaths.map((p) => ({
        ...p,
        size: p.size * ((scaleX + scaleY) / 2),
        points: p.points.map((pt) => ({ x: pt.x * scaleX, y: pt.y * scaleY })),
      }));
      renderDrawingPaths(ctx, scaledPaths);
    } else if (layer.type === 'path' && layer.pathConfig) {
      renderVectorPathOnCanvas(ctx, layer.pathConfig, scaleX, scaleY);
    }

    // Reset filter
    ctx.filter = 'none';
    ctx.restore();
  }

  return canvas;
}

/**
 * Performs actual export to dataURL or Blob with proper MIME type and background
 */
export async function exportCompositeImage(
  layers: Layer[],
  background: BackgroundConfig,
  canvasWidth: number,
  canvasHeight: number,
  settings: ExportSettings
): Promise<{ dataUrl: string; blob: Blob; fileName: string; mimeType: string }> {
  const isJpg = settings.format === 'jpg';
  const isPng = settings.format === 'png';
  const isWebp = settings.format === 'webp';
  const isSvg = settings.format === 'svg';

  const finalPreserveTransparency =
    (isPng || isWebp || isSvg) && (settings.preserveTransparency || background.type === 'transparent');

  // Custom dimensions or original canvas size
  const exportWidth = settings.customWidth || canvasWidth;
  const exportHeight = settings.customHeight || canvasHeight;

  // For JPG, if background is transparent or preserving transparency was requested, fill with white
  const adjustedBg: BackgroundConfig =
    isJpg && (background.type === 'transparent' || settings.preserveTransparency)
      ? { type: 'solid', color: background.color || '#ffffff' }
      : background;

  const canvas = await renderCompositeCanvas(
    layers,
    adjustedBg,
    canvasWidth,
    canvasHeight,
    exportWidth,
    exportHeight,
    finalPreserveTransparency
  );

  // Clean filename and ensure exact extension match
  const rawName = settings.fileName.trim() || 'pixelora-design';
  const cleanName = rawName.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, '_');
  const fileName = `${cleanName}.${settings.format}`;

  if (isSvg) {
    // For SVG: Generate PNG data representation preserving full alpha channel and all layer compositing
    const pngDataUrl = canvas.toDataURL('image/png');
    
    // Construct standard, valid standalone SVG container
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${exportWidth}" height="${exportHeight}" viewBox="0 0 ${exportWidth} ${exportHeight}">
  <title>${cleanName}</title>
  <desc>Exported composition from Pixelora Image Editor</desc>
  <image width="${exportWidth}" height="${exportHeight}" href="${pngDataUrl}" xlink:href="${pngDataUrl}" />
</svg>`;

    const mimeType = 'image/svg+xml';
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const dataUrl = URL.createObjectURL(blob);

    return { dataUrl, blob, fileName, mimeType };
  }

  let mimeType = 'image/png';
  if (isJpg) mimeType = 'image/jpeg';
  if (isWebp) mimeType = 'image/webp';

  const quality = Math.max(0.1, Math.min(1.0, (settings.quality || 92) / 100));

  const dataUrl = canvas.toDataURL(mimeType, quality);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to create Blob from canvas'));
      },
      mimeType,
      quality
    );
  });

  return { dataUrl, blob, fileName, mimeType };
}

export interface MergeLayersOptions {
  trimTransparentBounds?: boolean;
  isFlatten?: boolean;
  background?: BackgroundConfig;
  mergedLayerName?: string;
}

/**
 * Merges an array of layers into a single raster image Layer.
 * Renders all transformations, opacities, filters and alpha transparency with 100% mathematical fidelity.
 * If trimTransparentBounds is true (default for layer merges), tightly bounds the new layer around visible pixels.
 */
export async function mergeLayersIntoSingleLayer(
  layersToMerge: Layer[],
  canvasWidth: number,
  canvasHeight: number,
  options: MergeLayersOptions = {}
): Promise<Layer> {
  const {
    trimTransparentBounds = true,
    isFlatten = false,
    background = { type: 'transparent' },
    mergedLayerName,
  } = options;

  const bgConfig: BackgroundConfig = isFlatten ? background : { type: 'transparent' };
  const preserveTransparency = !isFlatten;

  // Render composite canvas with all layers' transforms, opacities and filters applied
  const canvas = await renderCompositeCanvas(
    layersToMerge,
    bgConfig,
    canvasWidth,
    canvasHeight,
    canvasWidth,
    canvasHeight,
    preserveTransparency
  );

  let finalSource = '';
  let finalX = 0;
  let finalY = 0;
  let finalW = canvasWidth;
  let finalH = canvasHeight;

  if (trimTransparentBounds && !isFlatten) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
      const data = imgData.data;
      let minX = canvasWidth;
      let minY = canvasHeight;
      let maxX = 0;
      let maxY = 0;
      let hasOpaquePixel = false;

      // Scan for non-transparent pixels
      for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < canvasWidth; x++) {
          const alpha = data[(y * canvasWidth + x) * 4 + 3];
          if (alpha > 0) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            hasOpaquePixel = true;
          }
        }
      }

      if (hasOpaquePixel) {
        finalX = minX;
        finalY = minY;
        finalW = Math.max(1, maxX - minX + 1);
        finalH = Math.max(1, maxY - minY + 1);

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = finalW;
        cropCanvas.height = finalH;
        const cropCtx = cropCanvas.getContext('2d');
        if (cropCtx) {
          cropCtx.drawImage(canvas, finalX, finalY, finalW, finalH, 0, 0, finalW, finalH);
          finalSource = cropCanvas.toDataURL('image/png');
        }
      }
    }
  }

  if (!finalSource) {
    finalSource = canvas.toDataURL('image/png');
  }

  const maxZIndex = layersToMerge.reduce((max, l) => Math.max(max, l.zIndex || 0), 0);

  const fallbackName =
    mergedLayerName ||
    (isFlatten
      ? 'خلفية مسطحة (Flattened)'
      : `دمج (${layersToMerge.map((l) => l.name).join(' + ')})`);

  return {
    id: 'layer_merged_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: fallbackName,
    type: 'image',
    source: finalSource,
    x: finalX,
    y: finalY,
    width: finalW,
    height: finalH,
    rotation: 0,
    opacity: 100,
    visible: true,
    zIndex: maxZIndex,
    filters: { ...DEFAULT_FILTERS },
    bitmapWidth: finalW,
    bitmapHeight: finalH,
  };
}

/**
 * Samples the true rendered pixel color at canvas coordinates (x, y).
 * Uses offscreen rendering of the composition to guarantee optical accuracy.
 */
export async function sampleCompositePixelColor(
  layers: Layer[],
  background: BackgroundConfig,
  canvasWidth: number,
  canvasHeight: number,
  x: number,
  y: number
): Promise<string> {
  const clampX = Math.max(0, Math.min(canvasWidth - 1, Math.floor(x)));
  const clampY = Math.max(0, Math.min(canvasHeight - 1, Math.floor(y)));

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '#000000';

  // 1. Render Background
  try {
    await renderBackground(ctx, canvasWidth, canvasHeight, background, false);
  } catch {}

  // 2. Render Layers in zIndex order
  const sortedLayers = [...layers]
    .filter((l) => l.visible !== false)
    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  for (const layer of sortedLayers) {
    ctx.save();
    const lx = layer.x;
    const ly = layer.y;
    const lw = layer.width;
    const lh = layer.height;

    const pivotX = layer.pivotX !== undefined ? layer.pivotX : 0.5;
    const pivotY = layer.pivotY !== undefined ? layer.pivotY : 0.5;
    ctx.translate(lx + lw * pivotX, ly + lh * pivotY);
    if (layer.rotation) {
      ctx.rotate((layer.rotation * Math.PI) / 180);
    }
    if (layer.skewX || layer.skewY) {
      const tanX = Math.tan(((layer.skewX || 0) * Math.PI) / 180);
      const tanY = Math.tan(((layer.skewY || 0) * Math.PI) / 180);
      ctx.transform(1, tanY, tanX, 1, 0, 0);
    }
    const flipX = layer.flipHorizontal ? -1 : 1;
    const flipY = layer.flipVertical ? -1 : 1;
    ctx.scale(flipX, flipY);
    ctx.translate(-lw * pivotX, -lh * pivotY);

    const layerOpacity = (layer.opacity !== undefined ? layer.opacity : 100) / 100;
    const filterOpacity = (layer.filters?.opacity !== undefined ? layer.filters.opacity : 100) / 100;
    ctx.globalAlpha = Math.max(0, Math.min(1, layerOpacity * filterOpacity));

    const filterString = buildCanvasFilterString(layer.filters);
    if (filterString !== 'none') {
      try {
        ctx.filter = filterString;
      } catch {}
    }

    if (layer.type === 'image' && layer.source) {
      try {
        const img = await loadImage(layer.source);
        ctx.drawImage(img, 0, 0, lw, lh);
      } catch {}
    } else if (layer.type === 'shape' && layer.shapeConfig) {
      renderShape(ctx, layer.shapeConfig, lw, lh);
    } else if (layer.type === 'text' && layer.textConfig) {
      renderText(ctx, layer.textConfig, lw, lh);
    } else if (layer.type === 'drawing' && layer.drawingPaths) {
      renderDrawingPaths(ctx, layer.drawingPaths);
    } else if (layer.type === 'path' && layer.pathConfig) {
      renderVectorPathOnCanvas(ctx, layer.pathConfig);
    }
    ctx.restore();
  }

  try {
    const p = ctx.getImageData(clampX, clampY, 1, 1).data;
    const hex =
      '#' +
      [p[0], p[1], p[2]]
        .map((c) => c.toString(16).padStart(2, '0'))
        .join('');
    return hex.toUpperCase();
  } catch {
    return '#000000';
  }
}
