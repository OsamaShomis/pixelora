import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Check,
  X,
  RotateCw,
  RotateCcw,
  Sliders,
  Type,
  Square,
  Paintbrush,
  Layers,
  FlipHorizontal,
  FlipVertical,
  Hand,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eraser,
  Circle,
  Plus,
  Minus,
  Bold,
  Italic,
  Palette,
  Sparkles,
  Lock,
  Crop,
  LassoSelect,
  Image as ImageIcon,
  Pipette,
  AlertCircle,
} from 'lucide-react';
import {
  EditorState,
  Layer,
  ShapeType,
  DrawingPath,
  ShapeConfig,
  TextConfig,
  BrushConfig,
  BrushType,
  ApplyCropParams,
  CropTargetMode,
  CropAspectRatio,
  PathConfig,
  PathPoint,
  FreeformCropMode,
  FreeformCropPoint,
  ApplyFreeformCropParams,
} from '../../types';
import { getShapeSvgContent } from '../../utils/shapeDrawer';
import {
  buildCanvasFilterString,
  sampleCompositePixelColor,
  renderDrawingPaths,
} from '../../utils/compositeRenderer';
import { hasAdvancedFilters, getEffectiveLayerFilters } from '../../utils/imageEnhancer';
import { pathPointsToSvgD } from '../../utils/vectorPath';
import { ProcessedImageLayer } from './ProcessedImageLayer';
import { EffectCanvasLayer } from './EffectCanvasLayer';
import { PenCanvasOverlay } from './Pen/PenCanvasOverlay';
import { PathSelectionOverlay } from './Pen/PathSelectionOverlay';
import { TransformBoundingBox } from './Transform/TransformBoundingBox';
import { DEFAULT_FILTERS } from '../../data/sampleProjects';
import { ContextualToolbar } from './ContextualToolbar';

interface EditorCanvasProps {
  state: EditorState;
  onUpdateState: (updater: (prev: EditorState) => EditorState) => void;
  onSelectLayer: (id: string | null) => void;
  onImageUpload: (files: FileList | null) => void;
  onApplyCrop: (params: ApplyCropParams) => void;
  onApplyFreeformCrop?: (params: ApplyFreeformCropParams) => void;
  onOpenTextInspector?: () => void;
  language: 'ar' | 'en';
  darkMode: boolean;
  brushConfig: BrushConfig;
  setBrushConfig?: React.Dispatch<React.SetStateAction<BrushConfig>>;
  recentColors?: string[];
  onSelectColor?: (color: string) => void;
  isEyedropperActive?: boolean;
  onToggleEyedropper?: () => void;
  penProps?: {
    activePathLayer: Layer | null;
    onUpdateActivePath: (updatedConfig: PathConfig, isCompleted?: boolean) => void;
    onCreateNewPathLayer: (initialPoint: PathPoint) => void;
    selectedPointId: string | null;
    setSelectedPointId: (id: string | null) => void;
    activeSelectionSvgD?: string | null;
    onFillSelection?: (color: string) => void;
    onStrokeSelection?: (color: string, width: number) => void;
    onClearSelection?: () => void;
  };
  transformProps?: {
    onApplyTransform: () => void;
    onCancelTransform: () => void;
    onResetTransform: () => void;
  };
  removeObjectProps?: {
    brushSize: number;
    setBrushSize: (size: number) => void;
    hardness: number;
    setHardness: (hardness: number) => void;
    mode: 'add' | 'remove';
    setMode: (mode: 'add' | 'remove') => void;
    isPreviewing: boolean;
    onTogglePreview: () => void;
    onApply: () => void;
    onCancel: () => void;
    onClearMask: () => void;
    hasMask: boolean;
    setHasMask: (has: boolean) => void;
    isProcessing: boolean;
    setIsProcessing?: (proc: boolean) => void;
    previewCanvas?: HTMLCanvasElement | null;
    maskCanvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  };
  cutoutProps?: {
    mode: 'restore' | 'erase';
    setMode: (mode: 'restore' | 'erase') => void;
  };
}

function drawOnMask(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  brushSize: number,
  hardness: number,
  mode: 'add' | 'remove'
) {
  ctx.save();
  if (mode === 'remove') {
    ctx.globalCompositeOperation = 'destination-out';
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }

  const dist = Math.hypot(toX - fromX, toY - fromY);
  const step = Math.max(1, brushSize * 0.15);
  const steps = Math.max(1, Math.ceil(dist / step));
  const radius = brushSize / 2;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = fromX + (toX - fromX) * t;
    const cy = fromY + (toY - fromY) * t;

    if (hardness >= 0.9) {
      ctx.fillStyle = mode === 'remove' ? 'rgba(0,0,0,1)' : 'rgba(236, 72, 153, 0.85)';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const grad = ctx.createRadialGradient(cx, cy, radius * hardness, cx, cy, radius);
      if (mode === 'remove') {
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
      } else {
        grad.addColorStop(0, 'rgba(236, 72, 153, 0.95)');
        grad.addColorStop(hardness, 'rgba(236, 72, 153, 0.85)');
        grad.addColorStop(1, 'rgba(236, 72, 153, 0)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function getStarPolygonPoints(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    points.push(`${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`);
  }
  return points.join(' ');
}

function getHeartSvgPath(cx: number, cy: number, size: number): string {
  const topCurve = size * 0.3;
  return `M ${cx} ${cy + topCurve} C ${cx - size / 2} ${cy - topCurve} ${cx - size / 2} ${cy + size / 3} ${cx} ${cy + size * 0.7} C ${cx + size / 2} ${cy + size / 3} ${cx + size / 2} ${cy - topCurve} ${cx} ${cy + topCurve} Z`;
}

function renderSvgDrawingPath(
  p: DrawingPath,
  layerX = 0,
  layerY = 0,
  key: string | number = 'path'
) {
  const isSquare = p.tipShape === 'square';
  const bType = p.brushType || 'soft';

  if (bType === 'stars' && p.tool !== 'eraser') {
    const starRadius = Math.max(5, p.size / 1.4);
    const step = Math.max(1, Math.floor(starRadius * 0.7));
    const sampled = p.points.filter((_, idx) => idx % step === 0 || idx === p.points.length - 1);

    return (
      <g key={key}>
        {sampled.map((pt, sIdx) => (
          <polygon
            key={sIdx}
            points={getStarPolygonPoints(pt.x - layerX, pt.y - layerY, starRadius)}
            fill={p.color}
            fillOpacity={p.opacity !== undefined ? p.opacity : 1}
          />
        ))}
      </g>
    );
  }

  if (bType === 'hearts' && p.tool !== 'eraser') {
    const heartSize = Math.max(8, p.size);
    const step = Math.max(1, Math.floor(heartSize * 0.7));
    const sampled = p.points.filter((_, idx) => idx % step === 0 || idx === p.points.length - 1);

    return (
      <g key={key}>
        {sampled.map((pt, sIdx) => (
          <path
            key={sIdx}
            d={getHeartSvgPath(pt.x - layerX, pt.y - layerY, heartSize)}
            fill={p.color}
            fillOpacity={p.opacity !== undefined ? p.opacity : 1}
          />
        ))}
      </g>
    );
  }

  if (bType === 'spray' && p.tool !== 'eraser') {
    const radius = p.size / 2;
    return (
      <g key={key}>
        {p.points.map((pt, pIdx) => (
          <circle
            key={pIdx}
            cx={pt.x - layerX + Math.sin(pIdx * 3.7) * radius * 0.6}
            cy={pt.y - layerY + Math.cos(pIdx * 2.3) * radius * 0.6}
            r={Math.max(1.2, radius * 0.2)}
            fill={p.color}
            fillOpacity={p.opacity !== undefined ? p.opacity : 1}
          />
        ))}
      </g>
    );
  }

  const d = p.points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x - layerX} ${pt.y - layerY}`)
    .join(' ');

  return (
    <path
      key={key}
      d={d}
      stroke={p.color}
      strokeWidth={p.size}
      strokeOpacity={p.opacity !== undefined ? p.opacity : 1}
      strokeLinecap={isSquare ? 'square' : 'round'}
      strokeLinejoin={isSquare ? 'miter' : 'round'}
      filter={
        bType === 'airbrush'
          ? `url(#airbrush-soft-filter)`
          : p.hardness !== undefined && p.hardness < 0.6
          ? `url(#feather-soft-brush)`
          : undefined
      }
      fill="none"
    />
  );
}

// Hardware-accelerated canvas layer for freehand drawing and non-destructive destination-out erasing
interface DrawingCanvasLayerProps {
  layer: Layer;
  livePath?: DrawingPath | null;
}

const DrawingCanvasLayer: React.FC<DrawingCanvasLayerProps> = ({ layer, livePath }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const paths = layer.drawingPaths ? [...layer.drawingPaths] : [];
    if (livePath) {
      paths.push(livePath);
    }
    renderDrawingPaths(ctx, paths);
  }, [layer.drawingPaths, livePath, layer.width, layer.height]);

  return (
    <canvas
      ref={canvasRef}
      width={layer.width}
      height={layer.height}
      className="w-full h-full absolute inset-0 pointer-events-none"
    />
  );
};

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  state,
  onUpdateState,
  onSelectLayer,
  onImageUpload,
  onApplyCrop,
  onApplyFreeformCrop,
  onOpenTextInspector,
  language,
  darkMode,
  brushConfig,
  setBrushConfig,
  recentColors = [],
  onSelectColor,
  isEyedropperActive = false,
  onToggleEyedropper,
  penProps,
  transformProps,
  removeObjectProps,
  cutoutProps,
}) => {
  const isAr = language === 'ar';
  const containerRef = useRef<HTMLDivElement>(null);
  const stampCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedLayer = (state.layers || []).find((l) => l.id === state.selectedLayerId);

  // Eyedropper & Alt Key Sampling State
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [hoveredSampleColor, setHoveredSampleColor] = useState<string | null>(null);

  // Track keyboard shortcuts (Alt for color sampling, Enter/Escape for transform/remove_object, [ ] for brush size)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setIsAltPressed(true);
      } else if (e.key === 'Escape') {
        if (state.activeTool === 'transform' && transformProps) {
          transformProps.onCancelTransform();
        } else if (state.activeTool === 'remove_object' && removeObjectProps) {
          removeObjectProps.onCancel();
        } else if (isEyedropperActive && onToggleEyedropper) {
          onToggleEyedropper();
        }
      } else if (e.key === 'Enter') {
        if (state.activeTool === 'transform' && transformProps) {
          transformProps.onApplyTransform();
        } else if (
          state.activeTool === 'remove_object' &&
          removeObjectProps &&
          removeObjectProps.hasMask &&
          !removeObjectProps.isProcessing
        ) {
          removeObjectProps.onApply();
        }
      } else if (state.activeTool === 'remove_object' && removeObjectProps) {
        if (e.key === '[') {
          e.preventDefault();
          removeObjectProps.setBrushSize(Math.max(4, removeObjectProps.brushSize - 4));
        } else if (e.key === ']') {
          e.preventDefault();
          removeObjectProps.setBrushSize(Math.min(200, removeObjectProps.brushSize + 4));
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setIsAltPressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isEyedropperActive, onToggleEyedropper, state.activeTool, transformProps, removeObjectProps]);

  // Interaction State
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [isDraggingLayer, setIsDraggingLayer] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [initialLayerPos, setInitialLayerPos] = useState({ x: 0, y: 0 });

  // Resizing state
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [initialLayerSize, setInitialLayerSize] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
  });

  // Drawing & Real Eraser state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [activeErasingLayerId, setActiveErasingLayerId] = useState<string | null>(null);
  const activeErasingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeErasingLayerIdRef = useRef<string | null>(null);
  const liveErasingDisplayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastLocalPointRef = useRef<{ x: number; y: number } | null>(null);
  const [liveErasingTick, setLiveErasingTick] = useState<number>(0);

  // Remove Object Mask Overlay Display Ref and tick
  const removeObjectMaskDisplayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [removeObjectMaskTick, setRemoveObjectMaskTick] = useState<number>(0);

  // Sync Remove Object mask canvas to display canvas
  useEffect(() => {
    if (
      state.activeTool === 'remove_object' &&
      removeObjectProps?.maskCanvasRef?.current &&
      removeObjectMaskDisplayCanvasRef.current
    ) {
      const src = removeObjectProps.maskCanvasRef.current;
      const tgt = removeObjectMaskDisplayCanvasRef.current;
      if (tgt.width !== src.width || tgt.height !== src.height) {
        tgt.width = src.width;
        tgt.height = src.height;
      }
      const ctx = tgt.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, tgt.width, tgt.height);
        ctx.drawImage(src, 0, 0);
      }
    }
  }, [removeObjectMaskTick, state.activeTool, removeObjectProps?.maskCanvasRef]);

  // Direct Inline Text Editing
  const [editingTextLayerId, setEditingTextLayerId] = useState<string | null>(null);

  // Mouse Cursor Tracking for Brush/Eraser Ring
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{
    x: number;
    y: number;
    clientX: number;
    clientY: number;
    visible: boolean;
  }>({
    x: 0,
    y: 0,
    clientX: 0,
    clientY: 0,
    visible: false,
  });

  // Professional Crop State: Distinct handling for 'image' vs 'canvas'
  const [cropTargetMode, setCropTargetMode] = useState<CropTargetMode>('canvas');
  const [cropTargetLayerId, setCropTargetLayerId] = useState<string | null>(null);
  const [canvasCropBox, setCanvasCropBox] = useState({
    x: 0,
    y: 0,
    width: state.canvasWidth,
    height: state.canvasHeight,
  });
  const [imageCropBox, setImageCropBox] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [cropAspectRatio, setCropAspectRatio] = useState<CropAspectRatio>('free');
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [cropDragStart, setCropDragStart] = useState({ x: 0, y: 0 });
  const [cropResizeHandle, setCropResizeHandle] = useState<string | null>(null);
  const [cropInitialState, setCropInitialState] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Freeform Crop state (القص الحر)
  const [freeformMode, setFreeformMode] = useState<FreeformCropMode>('freehand');
  const [freeformPoints, setFreeformPoints] = useState<FreeformCropPoint[]>([]);
  const [isFreeformDrawing, setIsFreeformDrawing] = useState(false);
  const [freeformHoverPoint, setFreeformHoverPoint] = useState<FreeformCropPoint | null>(null);

  // Cache for loaded HTMLImageElements used in precise alpha hit-testing
  const imageElementCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const hitTestCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const isLayerPixelOpaque = (layer: Layer, canvasX: number, canvasY: number): boolean => {
    if (layer.type !== 'image' || !layer.source) return true;

    const centerX = layer.x + layer.width / 2;
    const centerY = layer.y + layer.height / 2;
    const rad = -((layer.rotation || 0) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    let localX = (canvasX - centerX) * cos - (canvasY - centerY) * sin;
    let localY = (canvasX - centerX) * sin + (canvasY - centerY) * cos;

    if (layer.flipHorizontal) localX = -localX;
    if (layer.flipVertical) localY = -localY;

    localX += layer.width / 2;
    localY += layer.height / 2;

    if (localX < 0 || localX >= layer.width || localY < 0 || localY >= layer.height) {
      return false;
    }

    let img = imageElementCache.current.get(layer.source);
    if (!img) {
      img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = layer.source;
      imageElementCache.current.set(layer.source, img);
    }

    if (!img.complete || img.naturalWidth === 0) {
      return true;
    }

    if (!hitTestCanvasRef.current) {
      hitTestCanvasRef.current = document.createElement('canvas');
      hitTestCanvasRef.current.width = 1;
      hitTestCanvasRef.current.height = 1;
    }

    const testCanvas = hitTestCanvasRef.current;
    const ctx = testCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return true;

    ctx.clearRect(0, 0, 1, 1);
    const srcX = (localX / layer.width) * img.naturalWidth;
    const srcY = (localY / layer.height) * img.naturalHeight;
    ctx.drawImage(img, srcX, srcY, 1, 1, 0, 0, 1, 1);

    const alpha = ctx.getImageData(0, 0, 1, 1).data[3];
    return alpha > 10;
  };

  // Helper to convert canvas coordinates to a layer's local coordinate space (respecting center, rotation, and flips)
  const canvasToLayerLocalCoords = useCallback((canvasX: number, canvasY: number, layer: Layer) => {
    const centerX = layer.x + layer.width / 2;
    const centerY = layer.y + layer.height / 2;
    const rad = -((layer.rotation || 0) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    let localX = (canvasX - centerX) * cos - (canvasY - centerY) * sin + layer.width / 2;
    let localY = (canvasX - centerX) * sin + (canvasY - centerY) * cos + layer.height / 2;

    if (layer.flipHorizontal) {
      localX = layer.width - localX;
    }
    if (layer.flipVertical) {
      localY = layer.height - localY;
    }

    return { x: localX, y: localY };
  }, []);

  // Helper to locate topmost visible layer at given canvas coordinates
  const findLayerAt = useCallback(
    (canvasX: number, canvasY: number): Layer | null => {
      const reversedLayers = [...state.layers].reverse();

      // 1. Try to find a layer with an opaque pixel under the cursor
      const hitOpaque = reversedLayers.find((l) => {
        if (!l.visible) return false;
        const inBounds =
          canvasX >= l.x &&
          canvasX <= l.x + l.width &&
          canvasY >= l.y &&
          canvasY <= l.y + l.height;
        if (!inBounds) return false;
        return isLayerPixelOpaque(l, canvasX, canvasY);
      });
      if (hitOpaque) return hitOpaque;

      // 2. Fallback to bounding box hit
      const hitBounds = reversedLayers.find((l) => {
        if (!l.visible) return false;
        return (
          canvasX >= l.x &&
          canvasX <= l.x + l.width &&
          canvasY >= l.y &&
          canvasY <= l.y + l.height
        );
      });
      return hitBounds || null;
    },
    [state.layers, isLayerPixelOpaque]
  );

  // Compute numerical aspect ratio for current mode and target
  const getRatioValue = useCallback(
    (ratio: CropAspectRatio, mode: CropTargetMode, targetImgLayer: Layer | undefined) => {
      if (ratio === 'free') return null;
      if (ratio === '1:1') return 1;
      if (ratio === '4:3') return 4 / 3;
      if (ratio === '3:4') return 3 / 4;
      if (ratio === '16:9') return 16 / 9;
      if (ratio === '9:16') return 9 / 16;
      if (ratio === 'original') {
        if (mode === 'image' && targetImgLayer) {
          const bw = targetImgLayer.bitmapWidth || targetImgLayer.width;
          const bh = targetImgLayer.bitmapHeight || targetImgLayer.height;
          return bw / Math.max(1, bh);
        }
        return state.canvasWidth / Math.max(1, state.canvasHeight);
      }
      return null;
    },
    [state.canvasWidth, state.canvasHeight]
  );

  // Initialize or synchronize Crop state whenever crop tool is activated or selected layer changes
  useEffect(() => {
    if (state.activeTool === 'crop') {
      const selectedLayer = (state.layers || []).find((l) => l.id === state.selectedLayerId);
      if (selectedLayer && selectedLayer.type === 'image' && selectedLayer.source) {
        setCropTargetMode('image');
        setCropTargetLayerId(selectedLayer.id);
        setImageCropBox({
          x: 0,
          y: 0,
          width: Math.round(selectedLayer.width),
          height: Math.round(selectedLayer.height),
        });
      } else {
        setCropTargetMode('canvas');
        setCanvasCropBox({
          x: 0,
          y: 0,
          width: state.canvasWidth,
          height: state.canvasHeight,
        });
      }
      setCropAspectRatio('free');
    }
  }, [state.activeTool, state.selectedLayerId, state.canvasWidth, state.canvasHeight, state.layers]);

  // Handle setting aspect ratio for crop
  const handleSetCropRatio = useCallback(
    (ratio: CropAspectRatio) => {
      setCropAspectRatio(ratio);
      const targetImgLayer = (state.layers || []).find((l) => l.id === cropTargetLayerId);
      const r = getRatioValue(ratio, cropTargetMode, targetImgLayer);
      if (!r) return;

      if (cropTargetMode === 'image' && targetImgLayer) {
        const maxW = targetImgLayer.width;
        const maxH = targetImgLayer.height;
        let newW = imageCropBox.width;
        let newH = Math.round(newW / r);
        if (newH > maxH) {
          newH = maxH;
          newW = Math.round(newH * r);
        }
        if (newW > maxW) {
          newW = maxW;
          newH = Math.round(newW / r);
        }
        const cx = imageCropBox.x + imageCropBox.width / 2;
        const cy = imageCropBox.y + imageCropBox.height / 2;
        let newX = Math.round(cx - newW / 2);
        let newY = Math.round(cy - newH / 2);
        newX = Math.max(0, Math.min(maxW - newW, newX));
        newY = Math.max(0, Math.min(maxH - newH, newY));
        setImageCropBox({
          x: newX,
          y: newY,
          width: Math.max(10, Math.round(newW)),
          height: Math.max(10, Math.round(newH)),
        });
      } else {
        const maxW = state.canvasWidth;
        const maxH = state.canvasHeight;
        let newW = canvasCropBox.width;
        let newH = Math.round(newW / r);
        if (newH > maxH) {
          newH = maxH;
          newW = Math.round(newH * r);
        }
        if (newW > maxW) {
          newW = maxW;
          newH = Math.round(newW / r);
        }
        const cx = canvasCropBox.x + canvasCropBox.width / 2;
        const cy = canvasCropBox.y + canvasCropBox.height / 2;
        let newX = Math.round(cx - newW / 2);
        let newY = Math.round(cy - newH / 2);
        newX = Math.max(0, Math.min(maxW - newW, newX));
        newY = Math.max(0, Math.min(maxH - newH, newY));
        setCanvasCropBox({
          x: newX,
          y: newY,
          width: Math.max(10, Math.round(newW)),
          height: Math.max(10, Math.round(newH)),
        });
      }
    },
    [
      cropTargetMode,
      cropTargetLayerId,
      getRatioValue,
      imageCropBox,
      canvasCropBox,
      state.canvasWidth,
      state.canvasHeight,
      state.layers,
    ]
  );

  // Reset crop bounds to full target extent
  const handleResetCrop = useCallback(() => {
    setCropAspectRatio('free');
    if (cropTargetMode === 'image') {
      const targetImgLayer = (state.layers || []).find((l) => l.id === cropTargetLayerId);
      if (targetImgLayer) {
        setImageCropBox({
          x: 0,
          y: 0,
          width: Math.round(targetImgLayer.width),
          height: Math.round(targetImgLayer.height),
        });
      }
    } else {
      setCanvasCropBox({
        x: 0,
        y: 0,
        width: state.canvasWidth,
        height: state.canvasHeight,
      });
    }
  }, [cropTargetMode, cropTargetLayerId, state.canvasWidth, state.canvasHeight, state.layers]);

  // Cancel crop
  const handleCancelCrop = useCallback(() => {
    onUpdateState((prev) => ({ ...prev, activeTool: 'select' }));
  }, [onUpdateState]);

  // Apply crop
  const handleApplyCropAction = useCallback(() => {
    if (cropTargetMode === 'image') {
      if (!cropTargetLayerId) return;
      onApplyCrop({
        mode: 'image',
        targetLayerId: cropTargetLayerId,
        cropArea: {
          x: Math.round(imageCropBox.x),
          y: Math.round(imageCropBox.y),
          width: Math.round(imageCropBox.width),
          height: Math.round(imageCropBox.height),
        },
      });
    } else {
      onApplyCrop({
        mode: 'canvas',
        cropArea: {
          x: Math.round(canvasCropBox.x),
          y: Math.round(canvasCropBox.y),
          width: Math.round(canvasCropBox.width),
          height: Math.round(canvasCropBox.height),
        },
      });
    }
  }, [cropTargetMode, cropTargetLayerId, imageCropBox, canvasCropBox, onApplyCrop]);

  // Keyboard shortcut: Enter to apply crop, Escape to cancel
  useEffect(() => {
    if (state.activeTool !== 'crop') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        handleApplyCropAction();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelCrop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.activeTool, handleApplyCropAction, handleCancelCrop]);

  // Synchronize or activate Freeform Crop tool (القص الحر)
  useEffect(() => {
    if (state.activeTool === 'freeform_crop') {
      setFreeformPoints([]);
      setIsFreeformDrawing(false);
      setFreeformHoverPoint(null);
      const selected = (state.layers || []).find((l) => l.id === state.selectedLayerId);
      if (!selected || selected.type !== 'image') {
        const topImg = [...(state.layers || [])].reverse().find((l) => l.type === 'image' && !l.locked);
        if (topImg) {
          onSelectLayer(topImg.id);
        }
      }
    }
  }, [state.activeTool]);

  // Freeform Crop Actions (القص الحر)
  const handleApplyFreeformCropAction = useCallback(() => {
    const targetImgLayer = (state.layers || []).find(
      (l) => l.id === state.selectedLayerId && l.type === 'image' && !l.locked
    );
    if (!targetImgLayer || freeformPoints.length < 3) return;

    if (onApplyFreeformCrop) {
      onApplyFreeformCrop({
        targetLayerId: targetImgLayer.id,
        points: freeformPoints,
        mode: freeformMode,
      });
    }
    setFreeformPoints([]);
    setIsFreeformDrawing(false);
    setFreeformHoverPoint(null);
  }, [state.layers, state.selectedLayerId, freeformPoints, freeformMode, onApplyFreeformCrop]);

  const handleResetFreeformCrop = useCallback(() => {
    setFreeformPoints([]);
    setIsFreeformDrawing(false);
    setFreeformHoverPoint(null);
  }, []);

  const handleCancelFreeformCrop = useCallback(() => {
    setFreeformPoints([]);
    setIsFreeformDrawing(false);
    setFreeformHoverPoint(null);
    onUpdateState((prev) => ({ ...prev, activeTool: 'select' }));
  }, [onUpdateState]);

  // Keyboard shortcut: Enter to apply freeform crop, Escape to cancel
  useEffect(() => {
    if (state.activeTool !== 'freeform_crop') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        handleApplyFreeformCropAction();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelFreeformCrop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.activeTool, handleApplyFreeformCropAction, handleCancelFreeformCrop]);

  // Convert Client Window (Screen) Coordinates to Canvas Space (Accounting for Zoom and Pan)
  const clientToCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const artboardCenterX = rect.left + rect.width / 2 + state.pan.x;
      const artboardCenterY = rect.top + rect.height / 2 + state.pan.y;

      const artboardLeft = artboardCenterX - (state.canvasWidth * state.zoom) / 2;
      const artboardTop = artboardCenterY - (state.canvasHeight * state.zoom) / 2;

      const x = (clientX - artboardLeft) / state.zoom;
      const y = (clientY - artboardTop) / state.zoom;

      return { x: Math.round(x), y: Math.round(y) };
    },
    [state.pan.x, state.pan.y, state.canvasWidth, state.canvasHeight, state.zoom]
  );

  // Quick Transformations for selected layer or canvas
  const handleQuickRotate = (deg: number) => {
    if (state.selectedLayerId) {
      onUpdateState((prev) => ({
        ...prev,
        layers: prev.layers.map((l) =>
          l.id === prev.selectedLayerId ? { ...l, rotation: ((l.rotation || 0) + deg + 360) % 360 } : l
        ),
      }));
    } else {
      // Rotate all layers and swap canvas w/h if 90/270
      onUpdateState((prev) => ({
        ...prev,
        canvasWidth: deg % 180 !== 0 ? prev.canvasHeight : prev.canvasWidth,
        canvasHeight: deg % 180 !== 0 ? prev.canvasWidth : prev.canvasHeight,
        layers: prev.layers.map((l) => ({
          ...l,
          rotation: ((l.rotation || 0) + deg + 360) % 360,
        })),
      }));
    }
  };

  const handleQuickFlip = (axis: 'h' | 'v') => {
    if (state.selectedLayerId) {
      onUpdateState((prev) => ({
        ...prev,
        layers: prev.layers.map((l) =>
          l.id === prev.selectedLayerId
            ? {
                ...l,
                flipHorizontal: axis === 'h' ? !l.flipHorizontal : l.flipHorizontal,
                flipVertical: axis === 'v' ? !l.flipVertical : l.flipVertical,
              }
            : l
        ),
      }));
    } else {
      onUpdateState((prev) => ({
        ...prev,
        layers: prev.layers.map((l) => ({
          ...l,
          flipHorizontal: axis === 'h' ? !l.flipHorizontal : l.flipHorizontal,
          flipVertical: axis === 'v' ? !l.flipVertical : l.flipVertical,
        })),
      }));
    }
  };

  // Perform real pixel erasure using Canvas 2D destination-out with accurate hardness and opacity
  const eraseOnCanvas = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    size: number,
    hardness: number,
    shape: 'round' | 'square',
    opacity: number = 1.0
  ) => {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = Math.max(0.01, Math.min(1.0, opacity));

    if (shape === 'square') {
      const half = size / 2;
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.max(1, Math.ceil(dist / Math.max(1, size / 4)));
      ctx.fillStyle = '#000000';
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const curX = x1 + (x2 - x1) * t;
        const curY = y1 + (y2 - y1) * t;
        ctx.fillRect(curX - half, curY - half, size, size);
      }
    } else {
      // Round tip
      if (hardness >= 0.9) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = size;
        ctx.strokeStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Ensure both endpoints are solidly covered
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x1, y1, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x2, y2, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Soft feather radial gradient erasure
        const dist = Math.hypot(x2 - x1, y2 - y1);
        const steps = Math.max(1, Math.ceil(dist / Math.max(1, size / 6)));
        const rad = size / 2;
        const innerRad = rad * Math.max(0, hardness);

        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const curX = x1 + (x2 - x1) * t;
          const curY = y1 + (y2 - y1) * t;
          const grad = ctx.createRadialGradient(curX, curY, innerRad, curX, curY, rad);
          grad.addColorStop(0, 'rgba(0,0,0,1)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(curX, curY, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  };

  // Hardware-accelerated restoration of original image pixels onto canvas (Restore Brush)
  const restoreOnCanvas = (
    ctx: CanvasRenderingContext2D,
    originalImg: HTMLImageElement | HTMLCanvasElement,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    size: number,
    hardness: number,
    shape: 'round' | 'square',
    opacity: number = 1.0,
    bw: number,
    bh: number
  ) => {
    const effectiveAlpha = Math.max(0.01, Math.min(1.0, opacity));
    const rad = size / 2;
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.ceil(dist / Math.max(1, size / 6)));

    if (shape === 'square') {
      const half = size / 2;
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = effectiveAlpha;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const curX = x1 + (x2 - x1) * t;
        const curY = y1 + (y2 - y1) * t;
        ctx.rect(curX - half, curY - half, size, size);
      }
      ctx.clip();
      ctx.drawImage(originalImg, 0, 0, bw, bh);
      ctx.restore();
      return;
    }

    // Round tip
    if (hardness >= 0.9) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = effectiveAlpha;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.arc(x1, y1, rad, 0, Math.PI * 2);
      ctx.arc(x2, y2, rad, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(originalImg, 0, 0, bw, bh);
      ctx.restore();
    } else {
      // Soft feather radial gradient restoration using offscreen stamp
      if (!stampCanvasRef.current) {
        stampCanvasRef.current = document.createElement('canvas');
      }
      const stampCanvas = stampCanvasRef.current;
      const stampSize = Math.max(4, Math.ceil(size));
      stampCanvas.width = stampSize;
      stampCanvas.height = stampSize;
      const stampCtx = stampCanvas.getContext('2d');
      if (!stampCtx) return;

      const stampRad = stampSize / 2;
      const stampInnerRad = stampRad * Math.max(0, hardness);

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const curX = x1 + (x2 - x1) * t;
        const curY = y1 + (y2 - y1) * t;

        stampCtx.clearRect(0, 0, stampSize, stampSize);
        stampCtx.globalCompositeOperation = 'source-over';
        // Extract matching original pixel patch
        stampCtx.drawImage(
          originalImg,
          curX - stampRad,
          curY - stampRad,
          stampSize,
          stampSize,
          0,
          0,
          stampSize,
          stampSize
        );

        // Feather the stamp with destination-in radial alpha mask
        stampCtx.globalCompositeOperation = 'destination-in';
        const grad = stampCtx.createRadialGradient(stampRad, stampRad, stampInnerRad, stampRad, stampRad, stampRad);
        grad.addColorStop(0, `rgba(0,0,0,${effectiveAlpha})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        stampCtx.fillStyle = grad;
        stampCtx.beginPath();
        stampCtx.arc(stampRad, stampRad, stampRad, 0, Math.PI * 2);
        stampCtx.fill();

        // Stamp onto target context
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(stampCanvas, curX - stampRad, curY - stampRad);
        ctx.restore();
      }
    }
  };

  // Pointer Down (Mouse / Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    // If double clicking text, avoid starting drag
    if (editingTextLayerId) return;

    const { x, y } = clientToCanvasCoords(e.clientX, e.clientY);

    // Eyedropper Color Picker Tool or Alt+Click Color Sampling (Highest Priority)
    if (
      isEyedropperActive ||
      (e.altKey && state.activeTool === 'draw' && brushConfig.tool !== 'eraser')
    ) {
      sampleCompositePixelColor(
        state.layers || [],
        state.background,
        state.canvasWidth,
        state.canvasHeight,
        x,
        y
      ).then((sampledHex) => {
        if (onSelectColor) {
          onSelectColor(sampledHex);
        } else if (setBrushConfig) {
          setBrushConfig((b) => ({ ...b, color: sampledHex }));
        }
        if (isEyedropperActive && onToggleEyedropper) {
          onToggleEyedropper();
        }
      });
      return;
    }

    // Pen Tool handles its own vector drawing and node manipulation directly in PenCanvasOverlay
    if (state.activeTool === 'pen') return;

    // Pan Tool or Middle Mouse Button
    if (state.activeTool === 'hand' || e.button === 1 || e.spaceKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - state.pan.x, y: e.clientY - state.pan.y });
      return;
    }

    // Zoom Tool Click
    if (state.activeTool === 'zoom') {
      const zoomFactor = e.shiftKey || e.button === 2 ? 0.8 : 1.25;
      onUpdateState((prev) => ({
        ...prev,
        zoom: Math.min(4.0, Math.max(0.2, Number((prev.zoom * zoomFactor).toFixed(2)))),
      }));
      return;
    }

    // Add Text Layer on click when Text Tool is active
    if (state.activeTool === 'text') {
      const clickedTextLayer = (state.layers || []).find((l) => {
        if (!l.visible || l.type !== 'text') return false;
        return x >= l.x && x <= l.x + l.width && y >= l.y && y <= l.y + l.height;
      });

      if (clickedTextLayer) {
        onSelectLayer(clickedTextLayer.id);
        if (onOpenTextInspector) onOpenTextInspector();
      } else {
        const currentLayers = Array.isArray(state?.layers) ? state.layers : [];
        const newLayer: Layer = {
          id: 'layer_text_' + Date.now(),
          name: isAr ? 'نص جديد' : 'Text Layer',
          type: 'text',
          x: Math.max(20, Math.min(state.canvasWidth - 280, x - 140)),
          y: Math.max(20, Math.min(state.canvasHeight - 60, y - 30)),
          width: 280,
          height: 70,
          rotation: 0,
          opacity: 100,
          visible: true,
          zIndex: currentLayers.length + 1,
          filters: { ...DEFAULT_FILTERS },
          textConfig: {
            text: isAr ? 'أدخل النص هنا' : 'Enter Text Here',
            fontSize: 36,
            fontFamily: 'Cairo',
            color: '#172033',
            opacity: 1,
            align: 'center',
            bold: true,
            italic: false,
            underline: false,
            direction: isAr ? 'rtl' : 'ltr',
          },
        };
        onUpdateState((prev) => ({
          ...prev,
          layers: [...(prev.layers || []), newLayer],
          selectedLayerId: newLayer.id,
        }));
        if (onOpenTextInspector) onOpenTextInspector();
      }
      return;
    }

    // Dedicated Remove Object Tool - Mask Painting
    if (state.activeTool === 'remove_object') {
      let targetLayer = (state.layers || []).find((l) => l.id === state.selectedLayerId);
      if (!targetLayer) {
        const hit = findLayerAt(x, y);
        if (hit && hit.type === 'image' && !hit.locked) {
          targetLayer = hit;
          onSelectLayer(hit.id);
        } else {
          const firstImg = (state.layers || []).find((l) => l.type === 'image' && !l.locked);
          if (firstImg) {
            targetLayer = firstImg;
            onSelectLayer(firstImg.id);
          }
        }
      }

      if (!targetLayer || targetLayer.locked || targetLayer.type !== 'image' || !targetLayer.source) {
        return;
      }

      // If in preview mode, exit preview when user starts painting new mask strokes
      if (removeObjectProps?.isPreviewing) {
        removeObjectProps.onTogglePreview();
      }

      setIsDrawing(true);
      lastPointRef.current = { x, y };

      const bw = targetLayer.bitmapWidth || targetLayer.width;
      const bh = targetLayer.bitmapHeight || targetLayer.height;
      const scaleX = bw / targetLayer.width;
      const scaleY = bh / targetLayer.height;
      const local = canvasToLayerLocalCoords(x, y, targetLayer);
      const localBitmapX = local.x * scaleX;
      const localBitmapY = local.y * scaleY;
      const bitmapBrushSize = (removeObjectProps?.brushSize || 28) * ((scaleX + scaleY) / 2);

      lastLocalPointRef.current = { x: localBitmapX, y: localBitmapY };

      if (removeObjectProps?.maskCanvasRef) {
        if (!removeObjectProps.maskCanvasRef.current) {
          const mCanvas = document.createElement('canvas');
          mCanvas.width = bw;
          mCanvas.height = bh;
          removeObjectProps.maskCanvasRef.current = mCanvas;
        } else if (
          removeObjectProps.maskCanvasRef.current.width !== bw ||
          removeObjectProps.maskCanvasRef.current.height !== bh
        ) {
          removeObjectProps.maskCanvasRef.current.width = bw;
          removeObjectProps.maskCanvasRef.current.height = bh;
        }

        const mCtx = removeObjectProps.maskCanvasRef.current.getContext('2d');
        if (mCtx) {
          drawOnMask(
            mCtx,
            localBitmapX,
            localBitmapY,
            localBitmapX,
            localBitmapY,
            bitmapBrushSize,
            removeObjectProps.hardness ?? 0.5,
            removeObjectProps.mode ?? 'add'
          );
          removeObjectProps.setHasMask(true);
          setRemoveObjectMaskTick((t) => t + 1);
        }
      }
      return;
    }

    // Background Removal Cutout Workflow (Restore Brush & Erase Brush)
    if (state.activeTool === 'bg_remove') {
      let targetLayer = (state.layers || []).find((l) => l.id === state.selectedLayerId);

      // Auto-select image layer under cursor if not selected or if current selection is not an image
      if (!targetLayer || targetLayer.type !== 'image') {
        const hit = findLayerAt(x, y);
        if (hit && hit.type === 'image' && !hit.locked) {
          targetLayer = hit;
          onSelectLayer(hit.id);
        }
      }

      if (!targetLayer || targetLayer.locked || targetLayer.type !== 'image' || !targetLayer.source) {
        return;
      }

      // Preserve original source URL
      if (!targetLayer.originalSource) {
        targetLayer.originalSource = targetLayer.source;
      }

      setIsDrawing(true);
      lastPointRef.current = { x, y };
      activeErasingLayerIdRef.current = targetLayer.id;
      setActiveErasingLayerId(targetLayer.id);

      const bw = targetLayer.bitmapWidth || targetLayer.width;
      const bh = targetLayer.bitmapHeight || targetLayer.height;
      const scaleX = bw / targetLayer.width;
      const scaleY = bh / targetLayer.height;
      const local = canvasToLayerLocalCoords(x, y, targetLayer);
      const localBitmapX = local.x * scaleX;
      const localBitmapY = local.y * scaleY;
      const bitmapBrushSize = brushConfig.size * ((scaleX + scaleY) / 2);

      lastLocalPointRef.current = { x: localBitmapX, y: localBitmapY };

      const offCanvas = document.createElement('canvas');
      offCanvas.width = bw;
      offCanvas.height = bh;
      const ctx = offCanvas.getContext('2d');

      if (ctx) {
        const isRestore = (cutoutProps?.mode ?? 'restore') === 'restore';
        const originalSourceUrl = targetLayer.originalSource || targetLayer.source;

        const applyInitialCutoutDab = (
          sourceImg: HTMLImageElement | HTMLCanvasElement,
          origImg?: HTMLImageElement | HTMLCanvasElement
        ) => {
          ctx.drawImage(sourceImg, 0, 0, bw, bh);
          if (isRestore && origImg) {
            restoreOnCanvas(
              ctx,
              origImg,
              localBitmapX,
              localBitmapY,
              localBitmapX,
              localBitmapY,
              bitmapBrushSize,
              brushConfig.hardness,
              brushConfig.tipShape,
              brushConfig.opacity,
              bw,
              bh
            );
          } else {
            eraseOnCanvas(
              ctx,
              localBitmapX,
              localBitmapY,
              localBitmapX,
              localBitmapY,
              bitmapBrushSize,
              brushConfig.hardness,
              brushConfig.tipShape,
              brushConfig.opacity
            );
          }
          activeErasingCanvasRef.current = offCanvas;

          if (liveErasingDisplayCanvasRef.current) {
            const displayCtx = liveErasingDisplayCanvasRef.current.getContext('2d');
            if (displayCtx) {
              displayCtx.clearRect(0, 0, bw, bh);
              displayCtx.drawImage(offCanvas, 0, 0);
            }
          }
        };

        const cachedCurrent = imageElementCache.current.get(targetLayer.source);
        const cachedOriginal = isRestore ? imageElementCache.current.get(originalSourceUrl) : undefined;

        if (
          cachedCurrent &&
          cachedCurrent.complete &&
          cachedCurrent.naturalWidth > 0 &&
          (!isRestore || (cachedOriginal && cachedOriginal.complete && cachedOriginal.naturalWidth > 0))
        ) {
          applyInitialCutoutDab(cachedCurrent, cachedOriginal);
        } else {
          const loadImg = (src: string) =>
            new Promise<HTMLImageElement>((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                imageElementCache.current.set(src, img);
                resolve(img);
              };
              img.onerror = () => resolve(img);
              img.src = src;
            });

          const currentPromise =
            cachedCurrent && cachedCurrent.complete
              ? Promise.resolve(cachedCurrent)
              : loadImg(targetLayer.source);
          const origPromise = !isRestore
            ? Promise.resolve(undefined)
            : cachedOriginal && cachedOriginal.complete
            ? Promise.resolve(cachedOriginal)
            : loadImg(originalSourceUrl);

          Promise.all([currentPromise, origPromise]).then(([cImg, oImg]) => {
            if (cImg) applyInitialCutoutDab(cImg, oImg);
          });
        }
      }
      return;
    }

    // Smart Layer-Aware Eraser Tool
    if (state.activeTool === 'eraser' || (state.activeTool === 'draw' && brushConfig.tool === 'eraser')) {
      let targetLayer = (state.layers || []).find((l) => l.id === state.selectedLayerId);

      // If no layer is currently selected, auto-select the topmost visible layer under cursor
      if (!targetLayer) {
        const hit = findLayerAt(x, y);
        if (hit && !hit.locked) {
          targetLayer = hit;
          onSelectLayer(hit.id);
        }
      }

      // If target layer is locked or not found, safely exit without modifying anything
      if (!targetLayer || targetLayer.locked) {
        return;
      }

      // If target layer is vector (text or shape), do not erase directly (preserve vector integrity)
      if (targetLayer.type === 'text' || targetLayer.type === 'shape') {
        return;
      }

      setIsDrawing(true);
      lastPointRef.current = { x, y };
      activeErasingLayerIdRef.current = targetLayer.id;
      setActiveErasingLayerId(targetLayer.id);

      // Case 1: Image Layer
      if (targetLayer.type === 'image' && targetLayer.source) {
        const bw = targetLayer.bitmapWidth || targetLayer.width;
        const bh = targetLayer.bitmapHeight || targetLayer.height;
        const scaleX = bw / targetLayer.width;
        const scaleY = bh / targetLayer.height;
        const local = canvasToLayerLocalCoords(x, y, targetLayer);
        const localBitmapX = local.x * scaleX;
        const localBitmapY = local.y * scaleY;
        const bitmapBrushSize = brushConfig.size * ((scaleX + scaleY) / 2);

        lastLocalPointRef.current = { x: localBitmapX, y: localBitmapY };

        const offCanvas = document.createElement('canvas');
        offCanvas.width = bw;
        offCanvas.height = bh;
        const ctx = offCanvas.getContext('2d');

        if (ctx) {
          const applyInitialDab = (sourceImg: HTMLImageElement | HTMLCanvasElement) => {
            ctx.drawImage(sourceImg, 0, 0, bw, bh);
            eraseOnCanvas(
              ctx,
              localBitmapX,
              localBitmapY,
              localBitmapX,
              localBitmapY,
              bitmapBrushSize,
              brushConfig.hardness,
              brushConfig.tipShape,
              brushConfig.opacity
            );
            activeErasingCanvasRef.current = offCanvas;

            // Immediately mirror to display canvas for zero lag
            if (liveErasingDisplayCanvasRef.current) {
              const displayCtx = liveErasingDisplayCanvasRef.current.getContext('2d');
              if (displayCtx) {
                displayCtx.clearRect(0, 0, bw, bh);
                displayCtx.drawImage(offCanvas, 0, 0);
              }
            }
          };

          const cachedImg = imageElementCache.current.get(targetLayer.source);
          if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
            applyInitialDab(cachedImg);
          } else {
            const newImg = new Image();
            newImg.crossOrigin = 'anonymous';
            newImg.onload = () => {
              imageElementCache.current.set(targetLayer.source!, newImg);
              applyInitialDab(newImg);
            };
            newImg.src = targetLayer.source;
          }
        }
      }

      // Case 2: Drawing Layer
      if (targetLayer.type === 'drawing') {
        const local = canvasToLayerLocalCoords(x, y, targetLayer);
        lastLocalPointRef.current = { x: local.x, y: local.y };
      }

      // Case 3: Effect Layer (Non-destructive Mask Erasing)
      if (targetLayer.type === 'effect') {
        const cw = Math.max(1, Math.round(state.canvasWidth));
        const ch = Math.max(1, Math.round(state.canvasHeight));
        lastLocalPointRef.current = { x, y };

        const offCanvas = document.createElement('canvas');
        offCanvas.width = cw;
        offCanvas.height = ch;
        const ctx = offCanvas.getContext('2d');

        if (ctx) {
          const applyInitialMaskDab = (existingMaskImg?: HTMLImageElement | HTMLCanvasElement) => {
            if (existingMaskImg) {
              ctx.drawImage(existingMaskImg, 0, 0, cw, ch);
            } else {
              // Full solid white mask: effect active everywhere initially
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, cw, ch);
            }

            eraseOnCanvas(
              ctx,
              x,
              y,
              x,
              y,
              brushConfig.size,
              brushConfig.hardness,
              brushConfig.tipShape,
              brushConfig.opacity
            );
            activeErasingCanvasRef.current = offCanvas;
            setLiveErasingTick((t) => t + 1);
          };

          if (targetLayer.effectMask) {
            const cachedMask = imageElementCache.current.get(targetLayer.effectMask);
            if (cachedMask && cachedMask.complete && cachedMask.naturalWidth > 0) {
              applyInitialMaskDab(cachedMask);
            } else {
              const newImg = new Image();
              newImg.crossOrigin = 'anonymous';
              newImg.onload = () => {
                imageElementCache.current.set(targetLayer.effectMask!, newImg);
                applyInitialMaskDab(newImg);
              };
              newImg.src = targetLayer.effectMask;
            }
          } else {
            applyInitialMaskDab();
          }
        }
      }

      // Construct live path
      const local = canvasToLayerLocalCoords(x, y, targetLayer);
      const newPath: DrawingPath = {
        points: targetLayer.type === 'drawing' ? [{ x: local.x, y: local.y }] : [{ x, y }],
        color: '#EF4444',
        size: brushConfig.size,
        opacity: brushConfig.opacity,
        hardness: brushConfig.hardness,
        tipShape: brushConfig.tipShape,
        tool: 'eraser',
      };
      setCurrentPath(newPath);
      return;
    }

    // Drawing / Pen / Brush Tool
    if (state.activeTool === 'draw') {
      setIsDrawing(true);
      const newPath: DrawingPath = {
        points: [{ x, y }],
        color: brushConfig.color,
        size: brushConfig.size,
        opacity: brushConfig.opacity,
        hardness: brushConfig.hardness,
        tipShape: brushConfig.tipShape,
        brushType: brushConfig.brushType || 'soft',
        tool: brushConfig.tool || 'brush',
      };
      setCurrentPath(newPath);
      return;
    }

    // Crop box interaction (distinguishing image layer vs canvas)
    if (state.activeTool === 'crop') {
      if (cropTargetMode === 'image') {
        const targetImgLayer = (state.layers || []).find((l) => l.id === cropTargetLayerId);
        if (targetImgLayer) {
          const { x: localX, y: localY } = canvasToLayerLocalCoords(x, y, targetImgLayer);
          if (
            localX >= imageCropBox.x &&
            localX <= imageCropBox.x + imageCropBox.width &&
            localY >= imageCropBox.y &&
            localY <= imageCropBox.y + imageCropBox.height
          ) {
            setIsDraggingCrop(true);
            setCropDragStart({ x: localX - imageCropBox.x, y: localY - imageCropBox.y });
            setCropInitialState({ ...imageCropBox });
          }
        }
      } else {
        if (
          x >= canvasCropBox.x &&
          x <= canvasCropBox.x + canvasCropBox.width &&
          y >= canvasCropBox.y &&
          y <= canvasCropBox.y + canvasCropBox.height
        ) {
          setIsDraggingCrop(true);
          setCropDragStart({ x: x - canvasCropBox.x, y: y - canvasCropBox.y });
          setCropInitialState({ ...canvasCropBox });
        }
      }
      return;
    }

    // Freeform Crop Interaction (القص الحر)
    if (state.activeTool === 'freeform_crop') {
      let targetImgLayer = (state.layers || []).find(
        (l) => l.id === state.selectedLayerId && l.type === 'image' && !l.locked
      );

      // If no layer is currently selected, try to select the topmost image under the cursor
      if (!targetImgLayer) {
        const reversedLayers = [...(state.layers || [])].reverse();
        const clickedImg = reversedLayers.find((l) => {
          if (!l.visible || l.type !== 'image' || l.locked) return false;
          return x >= l.x && x <= l.x + l.width && y >= l.y && y <= l.y + l.height;
        });
        if (clickedImg) {
          onSelectLayer(clickedImg.id);
          targetImgLayer = clickedImg;
        }
      }

      if (!targetImgLayer) return;

      const local = canvasToLayerLocalCoords(x, y, targetImgLayer);
      const clampedPt = {
        x: Math.max(0, Math.min(targetImgLayer.width, Math.round(local.x))),
        y: Math.max(0, Math.min(targetImgLayer.height, Math.round(local.y))),
      };

      if (freeformMode === 'freehand') {
        setIsFreeformDrawing(true);
        setFreeformPoints([clampedPt]);
      } else {
        // Polygon mode: If clicking near the first point and we have at least 3 points, close polygon
        if (freeformPoints.length >= 3) {
          const d0 = Math.hypot(clampedPt.x - freeformPoints[0].x, clampedPt.y - freeformPoints[0].y);
          if (d0 < 16) {
            return;
          }
        }
        setFreeformPoints((prev) => [...prev, clampedPt]);
      }
      return;
    }

    // Selection and Transform tools: Hit test layers from top to bottom with transparent cutout fall-through
    if (state.activeTool === 'select' || state.activeTool === 'transform') {
      const reversedLayers = [...(state.layers || [])].reverse();

      // 1. Try to find a layer with an opaque pixel under the cursor
      let clickedLayer = reversedLayers.find((l) => {
        if (!l.visible) return false;
        const inBounds = x >= l.x && x <= l.x + l.width && y >= l.y && y <= l.y + l.height;
        if (!inBounds) return false;
        return isLayerPixelOpaque(l, x, y);
      });

      // 2. If no opaque pixel was hit, fallback to the top bounding box
      if (!clickedLayer) {
        clickedLayer = reversedLayers.find((l) => {
          if (!l.visible) return false;
          return x >= l.x && x <= l.x + l.width && y >= l.y && y <= l.y + l.height;
        });
      }

      if (clickedLayer) {
        onSelectLayer(clickedLayer.id);
        if (!clickedLayer.locked && state.activeTool === 'select') {
          setIsDraggingLayer(true);
          setDragStartPos({ x, y });
          setInitialLayerPos({ x: clickedLayer.x, y: clickedLayer.y });
        }
      } else if (state.activeTool === 'select') {
        onSelectLayer(null);
      }
    }
  };

  // Pointer Move (Mouse + Touch + Stylus)
  const handlePointerMove = (e: React.PointerEvent) => {
    const { x, y } = clientToCanvasCoords(e.clientX, e.clientY);
    setMouseCanvasPos({ x, y, clientX: e.clientX, clientY: e.clientY, visible: true });

    // Live Color Sampling Preview if Eyedropper is active or Alt is held
    if (
      (isEyedropperActive || (e.altKey && state.activeTool === 'draw')) &&
      x >= 0 &&
      x <= state.canvasWidth &&
      y >= 0 &&
      y <= state.canvasHeight
    ) {
      sampleCompositePixelColor(
        state.layers || [],
        state.background,
        state.canvasWidth,
        state.canvasHeight,
        x,
        y
      ).then((hex) => {
        setHoveredSampleColor(hex);
      });
    }

    if (isPanning) {
      onUpdateState((prev) => ({
        ...prev,
        pan: { x: e.clientX - panStart.x, y: e.clientY - panStart.y },
      }));
      return;
    }

    // Freeform Crop Pointer Move (القص الحر)
    if (state.activeTool === 'freeform_crop') {
      const targetImgLayer = (state.layers || []).find(
        (l) => l.id === state.selectedLayerId && l.type === 'image' && !l.locked
      );
      if (targetImgLayer) {
        const local = canvasToLayerLocalCoords(x, y, targetImgLayer);
        const clampedPt = {
          x: Math.max(0, Math.min(targetImgLayer.width, Math.round(local.x))),
          y: Math.max(0, Math.min(targetImgLayer.height, Math.round(local.y))),
        };
        setFreeformHoverPoint(clampedPt);

        if (freeformMode === 'freehand' && isFreeformDrawing) {
          setFreeformPoints((prev) => {
            const last = prev[prev.length - 1];
            if (!last || Math.hypot(clampedPt.x - last.x, clampedPt.y - last.y) >= 3) {
              return [...prev, clampedPt];
            }
            return prev;
          });
        }
      }
      return;
    }

    // Dedicated Remove Object Tool - Mask Painting Drag
    if (isDrawing && state.activeTool === 'remove_object') {
      const targetLayer = (state.layers || []).find((l) => l.id === state.selectedLayerId);
      if (
        targetLayer &&
        targetLayer.type === 'image' &&
        targetLayer.source &&
        lastLocalPointRef.current &&
        removeObjectProps?.maskCanvasRef?.current
      ) {
        const bw = targetLayer.bitmapWidth || targetLayer.width;
        const bh = targetLayer.bitmapHeight || targetLayer.height;
        const scaleX = bw / targetLayer.width;
        const scaleY = bh / targetLayer.height;
        const local = canvasToLayerLocalCoords(x, y, targetLayer);
        const curBitmapX = local.x * scaleX;
        const curBitmapY = local.y * scaleY;
        const bitmapBrushSize = (removeObjectProps.brushSize || 28) * ((scaleX + scaleY) / 2);

        const mCtx = removeObjectProps.maskCanvasRef.current.getContext('2d');
        if (mCtx) {
          drawOnMask(
            mCtx,
            lastLocalPointRef.current.x,
            lastLocalPointRef.current.y,
            curBitmapX,
            curBitmapY,
            bitmapBrushSize,
            removeObjectProps.hardness ?? 0.5,
            removeObjectProps.mode ?? 'add'
          );
          lastLocalPointRef.current = { x: curBitmapX, y: curBitmapY };
          lastPointRef.current = { x, y };
          removeObjectProps.setHasMask(true);
          setRemoveObjectMaskTick((t) => t + 1);
        }
      }
      return;
    }

    // Background Removal Cutout Workflow - Painting (Restore Brush & Erase Brush)
    if (isDrawing && state.activeTool === 'bg_remove' && activeErasingLayerIdRef.current) {
      const targetLayer = (state.layers || []).find((l) => l.id === activeErasingLayerIdRef.current);
      if (targetLayer?.type === 'image' && activeErasingCanvasRef.current && lastLocalPointRef.current) {
        const bw = targetLayer.bitmapWidth || targetLayer.width;
        const bh = targetLayer.bitmapHeight || targetLayer.height;
        const scaleX = bw / targetLayer.width;
        const scaleY = bh / targetLayer.height;
        const local = canvasToLayerLocalCoords(x, y, targetLayer);
        const curBitmapX = local.x * scaleX;
        const curBitmapY = local.y * scaleY;
        const bitmapBrushSize = brushConfig.size * ((scaleX + scaleY) / 2);

        const ctx = activeErasingCanvasRef.current.getContext('2d');
        if (ctx) {
          const isRestore = (cutoutProps?.mode ?? 'restore') === 'restore';
          if (isRestore) {
            const originalSourceUrl = targetLayer.originalSource || targetLayer.source;
            const origImg = imageElementCache.current.get(originalSourceUrl);
            if (origImg && origImg.complete) {
              restoreOnCanvas(
                ctx,
                origImg,
                lastLocalPointRef.current.x,
                lastLocalPointRef.current.y,
                curBitmapX,
                curBitmapY,
                bitmapBrushSize,
                brushConfig.hardness,
                brushConfig.tipShape,
                brushConfig.opacity,
                bw,
                bh
              );
            }
          } else {
            eraseOnCanvas(
              ctx,
              lastLocalPointRef.current.x,
              lastLocalPointRef.current.y,
              curBitmapX,
              curBitmapY,
              bitmapBrushSize,
              brushConfig.hardness,
              brushConfig.tipShape,
              brushConfig.opacity
            );
          }

          if (liveErasingDisplayCanvasRef.current) {
            const displayCtx = liveErasingDisplayCanvasRef.current.getContext('2d');
            if (displayCtx) {
              displayCtx.clearRect(0, 0, bw, bh);
              displayCtx.drawImage(activeErasingCanvasRef.current, 0, 0);
            }
          }
        }

        lastLocalPointRef.current = { x: curBitmapX, y: curBitmapY };
      }
      lastPointRef.current = { x, y };
      return;
    }

    // Smart Eraser / Drawing Move
    if (isDrawing && currentPath) {
      const clampedX = Math.max(0, Math.min(state.canvasWidth, x));
      const clampedY = Math.max(0, Math.min(state.canvasHeight, y));

      if (state.activeTool === 'eraser' || brushConfig.tool === 'eraser') {
        if (activeErasingLayerIdRef.current) {
          const targetLayer = (state.layers || []).find((l) => l.id === activeErasingLayerIdRef.current);

          // Image layer live hardware-accelerated erasing
          if (
            targetLayer?.type === 'image' &&
            activeErasingCanvasRef.current &&
            lastLocalPointRef.current
          ) {
            const bw = targetLayer.bitmapWidth || targetLayer.width;
            const bh = targetLayer.bitmapHeight || targetLayer.height;
            const scaleX = bw / targetLayer.width;
            const scaleY = bh / targetLayer.height;
            const local = canvasToLayerLocalCoords(clampedX, clampedY, targetLayer);
            const curBitmapX = local.x * scaleX;
            const curBitmapY = local.y * scaleY;
            const bitmapBrushSize = brushConfig.size * ((scaleX + scaleY) / 2);

            const ctx = activeErasingCanvasRef.current.getContext('2d');
            if (ctx) {
              eraseOnCanvas(
                ctx,
                lastLocalPointRef.current.x,
                lastLocalPointRef.current.y,
                curBitmapX,
                curBitmapY,
                bitmapBrushSize,
                brushConfig.hardness,
                brushConfig.tipShape,
                brushConfig.opacity
              );

              // Update display canvas with zero latency
              if (liveErasingDisplayCanvasRef.current) {
                const displayCtx = liveErasingDisplayCanvasRef.current.getContext('2d');
                if (displayCtx) {
                  displayCtx.clearRect(0, 0, bw, bh);
                  displayCtx.drawImage(activeErasingCanvasRef.current, 0, 0);
                }
              }
            }

            lastLocalPointRef.current = { x: curBitmapX, y: curBitmapY };
          }

          // Effect layer live mask erasing
          if (targetLayer?.type === 'effect' && activeErasingCanvasRef.current && lastPointRef.current) {
            const ctx = activeErasingCanvasRef.current.getContext('2d');
            if (ctx) {
              eraseOnCanvas(
                ctx,
                lastPointRef.current.x,
                lastPointRef.current.y,
                clampedX,
                clampedY,
                brushConfig.size,
                brushConfig.hardness,
                brushConfig.tipShape,
                brushConfig.opacity
              );
              setLiveErasingTick((t) => t + 1);
            }
            lastLocalPointRef.current = { x: clampedX, y: clampedY };
          }

          // Drawing layer live erasing
          if (targetLayer?.type === 'drawing') {
            const local = canvasToLayerLocalCoords(clampedX, clampedY, targetLayer);
            setCurrentPath((prev) =>
              prev ? { ...prev, points: [...prev.points, { x: local.x, y: local.y }] } : null
            );
          } else {
            setCurrentPath((prev) =>
              prev ? { ...prev, points: [...prev.points, { x: clampedX, y: clampedY }] } : null
            );
          }
        }

        lastPointRef.current = { x: clampedX, y: clampedY };
        return;
      }

      // Normal Brush Drawing Move
      lastPointRef.current = { x: clampedX, y: clampedY };
      setCurrentPath((prev) =>
        prev ? { ...prev, points: [...prev.points, { x: clampedX, y: clampedY }] } : null
      );
      return;
    }

    // 1. Drag Crop Box (Image vs Canvas)
    if (isDraggingCrop) {
      if (cropTargetMode === 'image') {
        const targetImgLayer = (state.layers || []).find((l) => l.id === cropTargetLayerId);
        if (targetImgLayer) {
          const { x: localX, y: localY } = canvasToLayerLocalCoords(x, y, targetImgLayer);
          const maxW = targetImgLayer.width;
          const maxH = targetImgLayer.height;
          const newX = Math.max(0, Math.min(maxW - cropInitialState.width, localX - cropDragStart.x));
          const newY = Math.max(0, Math.min(maxH - cropInitialState.height, localY - cropDragStart.y));
          setImageCropBox((prev) => ({
            ...prev,
            x: Math.round(newX),
            y: Math.round(newY),
          }));
        }
      } else {
        const maxW = state.canvasWidth;
        const maxH = state.canvasHeight;
        const newX = Math.max(0, Math.min(maxW - cropInitialState.width, x - cropDragStart.x));
        const newY = Math.max(0, Math.min(maxH - cropInitialState.height, y - cropDragStart.y));
        setCanvasCropBox((prev) => ({
          ...prev,
          x: Math.round(newX),
          y: Math.round(newY),
        }));
      }
      return;
    }

    // 2. Resize Crop Box from handles
    if (cropResizeHandle) {
      const dx = x - dragStartPos.x;
      const dy = y - dragStartPos.y;
      const targetImgLayer = (state.layers || []).find((l) => l.id === cropTargetLayerId);
      const isImg = cropTargetMode === 'image' && !!targetImgLayer;
      const maxW = isImg ? targetImgLayer.width : state.canvasWidth;
      const maxH = isImg ? targetImgLayer.height : state.canvasHeight;
      const init = cropInitialState;
      const minW = 20;
      const minH = 20;

      let localDx = dx;
      let localDy = dy;
      if (isImg && targetImgLayer.rotation) {
        const rad = (targetImgLayer.rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        localDx = dx * cos + dy * sin;
        localDy = -dx * sin + dy * cos;
      }

      const ratioNum = getRatioValue(cropAspectRatio, cropTargetMode, targetImgLayer);

      let newX = init.x;
      let newY = init.y;
      let newW = init.width;
      let newH = init.height;

      if (!ratioNum) {
        // Free Aspect Ratio
        if (cropResizeHandle.includes('e')) {
          newW = Math.max(minW, Math.min(maxW - init.x, init.width + localDx));
        }
        if (cropResizeHandle.includes('w')) {
          const rawW = init.width - localDx;
          const clampedW = Math.max(minW, Math.min(init.x + init.width, rawW));
          newW = clampedW;
          newX = init.x + (init.width - clampedW);
        }
        if (cropResizeHandle.includes('s')) {
          newH = Math.max(minH, Math.min(maxH - init.y, init.height + localDy));
        }
        if (cropResizeHandle.includes('n')) {
          const rawH = init.height - localDy;
          const clampedH = Math.max(minH, Math.min(init.y + init.height, rawH));
          newH = clampedH;
          newY = init.y + (init.height - clampedH);
        }
      } else {
        // Fixed Aspect Ratio
        if (cropResizeHandle === 'se') {
          let w = Math.max(minW, init.width + localDx);
          let h = Math.round(w / ratioNum);
          if (init.x + w > maxW) {
            w = maxW - init.x;
            h = Math.round(w / ratioNum);
          }
          if (init.y + h > maxH) {
            h = maxH - init.y;
            w = Math.round(h * ratioNum);
          }
          newW = Math.max(minW, w);
          newH = Math.max(minH, h);
        } else if (cropResizeHandle === 'sw') {
          let w = Math.max(minW, init.width - localDx);
          let h = Math.round(w / ratioNum);
          if (w > init.x + init.width) {
            w = init.x + init.width;
            h = Math.round(w / ratioNum);
          }
          if (init.y + h > maxH) {
            h = maxH - init.y;
            w = Math.round(h * ratioNum);
          }
          newW = Math.max(minW, w);
          newH = Math.max(minH, h);
          newX = init.x + (init.width - newW);
        } else if (cropResizeHandle === 'ne') {
          let w = Math.max(minW, init.width + localDx);
          let h = Math.round(w / ratioNum);
          if (init.x + w > maxW) {
            w = maxW - init.x;
            h = Math.round(w / ratioNum);
          }
          if (h > init.y + init.height) {
            h = init.y + init.height;
            w = Math.round(h * ratioNum);
          }
          newW = Math.max(minW, w);
          newH = Math.max(minH, h);
          newY = init.y + (init.height - newH);
        } else if (cropResizeHandle === 'nw') {
          let w = Math.max(minW, init.width - localDx);
          let h = Math.round(w / ratioNum);
          if (w > init.x + init.width) {
            w = init.x + init.width;
            h = Math.round(w / ratioNum);
          }
          if (h > init.y + init.height) {
            h = init.y + init.height;
            w = Math.round(h * ratioNum);
          }
          newW = Math.max(minW, w);
          newH = Math.max(minH, h);
          newX = init.x + (init.width - newW);
          newY = init.y + (init.height - newH);
        } else if (cropResizeHandle === 'e') {
          let w = Math.max(minW, Math.min(maxW - init.x, init.width + localDx));
          let h = Math.round(w / ratioNum);
          if (h > maxH) {
            h = maxH;
            w = Math.round(h * ratioNum);
          }
          const cy = init.y + init.height / 2;
          const y = Math.max(0, Math.min(maxH - h, Math.round(cy - h / 2)));
          newW = w;
          newH = h;
          newY = y;
        } else if (cropResizeHandle === 'w') {
          let w = Math.max(minW, Math.min(init.x + init.width, init.width - localDx));
          let h = Math.round(w / ratioNum);
          if (h > maxH) {
            h = maxH;
            w = Math.round(h * ratioNum);
          }
          const cy = init.y + init.height / 2;
          const y = Math.max(0, Math.min(maxH - h, Math.round(cy - h / 2)));
          newW = w;
          newH = h;
          newX = init.x + (init.width - w);
          newY = y;
        } else if (cropResizeHandle === 's') {
          let h = Math.max(minH, Math.min(maxH - init.y, init.height + localDy));
          let w = Math.round(h * ratioNum);
          if (w > maxW) {
            w = maxW;
            h = Math.round(w / ratioNum);
          }
          const cx = init.x + init.width / 2;
          const x = Math.max(0, Math.min(maxW - w, Math.round(cx - w / 2)));
          newW = w;
          newH = h;
          newX = x;
        } else if (cropResizeHandle === 'n') {
          let h = Math.max(minH, Math.min(init.y + init.height, init.height - localDy));
          let w = Math.round(h * ratioNum);
          if (w > maxW) {
            w = maxW;
            h = Math.round(w / ratioNum);
          }
          const cx = init.x + init.width / 2;
          const x = Math.max(0, Math.min(maxW - w, Math.round(cx - w / 2)));
          newW = w;
          newH = h;
          newX = x;
          newY = init.y + (init.height - newH);
        }
      }

      newX = Math.max(0, Math.min(maxW - newW, Math.round(newX)));
      newY = Math.max(0, Math.min(maxH - newH, Math.round(newY)));
      newW = Math.max(minW, Math.min(maxW - newX, Math.round(newW)));
      newH = Math.max(minH, Math.min(maxH - newY, Math.round(newH)));

      if (isImg) {
        setImageCropBox({ x: newX, y: newY, width: newW, height: newH });
      } else {
        setCanvasCropBox({ x: newX, y: newY, width: newW, height: newH });
      }
      return;
    }

    // Decoupled Layer Resize (Calculated in layer coordinate space, fully supporting rotated & flipped layers)
    if (isResizing && selectedLayer) {
      const dx = x - dragStartPos.x;
      const dy = y - dragStartPos.y;

      const origW = initialLayerSize.width;
      const origH = initialLayerSize.height;
      const aspect = origW / Math.max(1, origH);
      const rotRad = ((initialLayerSize.rotation || 0) * Math.PI) / 180;
      const cos = Math.cos(rotRad);
      const sin = Math.sin(rotRad);

      // Project canvas delta (dx, dy) into the layer's local coordinate system
      let localDx = dx * cos + dy * sin;
      let localDy = -dx * sin + dy * cos;

      if (initialLayerSize.flipH) localDx = -localDx;
      if (initialLayerSize.flipV) localDy = -localDy;

      let newW = origW;
      let newH = origH;
      let shiftX = 0;
      let shiftY = 0;

      // Corner handles maintain aspect ratio unless Shift is held
      const keepRatio = !e.shiftKey;

      if (isResizing === 'se') {
        newW = Math.max(20, origW + localDx);
        newH = keepRatio ? Math.max(20, Math.round(newW / aspect)) : Math.max(20, origH + localDy);
        shiftX = (newW - origW) / 2;
        shiftY = (newH - origH) / 2;
      } else if (isResizing === 'sw') {
        newW = Math.max(20, origW - localDx);
        newH = keepRatio ? Math.max(20, Math.round(newW / aspect)) : Math.max(20, origH + localDy);
        shiftX = -(newW - origW) / 2;
        shiftY = (newH - origH) / 2;
      } else if (isResizing === 'ne') {
        newW = Math.max(20, origW + localDx);
        newH = keepRatio ? Math.max(20, Math.round(newW / aspect)) : Math.max(20, origH - localDy);
        shiftX = (newW - origW) / 2;
        shiftY = -(newH - origH) / 2;
      } else if (isResizing === 'nw') {
        newW = Math.max(20, origW - localDx);
        newH = keepRatio ? Math.max(20, Math.round(newW / aspect)) : Math.max(20, origH - localDy);
        shiftX = -(newW - origW) / 2;
        shiftY = -(newH - origH) / 2;
      }
      // Edge handles: Directional width & height resize
      else if (isResizing === 'e') {
        newW = Math.max(20, origW + localDx);
        shiftX = (newW - origW) / 2;
      } else if (isResizing === 'w') {
        newW = Math.max(20, origW - localDx);
        shiftX = -(newW - origW) / 2;
      } else if (isResizing === 's') {
        newH = Math.max(20, origH + localDy);
        shiftY = (newH - origH) / 2;
      } else if (isResizing === 'n') {
        newH = Math.max(20, origH - localDy);
        shiftY = -(newH - origH) / 2;
      }

      if (initialLayerSize.flipH) shiftX = -shiftX;
      if (initialLayerSize.flipV) shiftY = -shiftY;

      // Rotate local center shift back to canvas coordinates
      const canvasShiftX = shiftX * cos - shiftY * sin;
      const canvasShiftY = shiftX * sin + shiftY * cos;

      const origCenterX = initialLayerSize.x + origW / 2;
      const origCenterY = initialLayerSize.y + origH / 2;

      const newCenterX = origCenterX + canvasShiftX;
      const newCenterY = origCenterY + canvasShiftY;

      const newX = newCenterX - newW / 2;
      const newY = newCenterY - newH / 2;

      onUpdateState((prev) => ({
        ...prev,
        layers: prev.layers.map((l) =>
          l.id === prev.selectedLayerId
            ? {
                ...l,
                x: Math.round(newX),
                y: Math.round(newY),
                width: Math.round(newW),
                height: Math.round(newH),
              }
            : l
        ),
      }));
      return;
    }

    // Drag Selected Layer
    if (isDraggingLayer && selectedLayer) {
      const dx = x - dragStartPos.x;
      const dy = y - dragStartPos.y;
      onUpdateState((prev) => ({
        ...prev,
        layers: prev.layers.map((l) =>
          l.id === prev.selectedLayerId
            ? { ...l, x: Math.round(initialLayerPos.x + dx), y: Math.round(initialLayerPos.y + dy) }
            : l
        ),
      }));
    }
  };

  // Pointer Up
  const handlePointerUp = () => {
    setIsPanning(false);
    setIsDraggingLayer(false);
    setIsResizing(null);
    setIsDraggingCrop(false);
    setCropResizeHandle(null);
    lastPointRef.current = null;

    // Handle Freeform Crop Pointer Up
    if (state.activeTool === 'freeform_crop') {
      if (freeformMode === 'freehand' && isFreeformDrawing) {
        setIsFreeformDrawing(false);
      }
      return;
    }

    // Handle Remove Object Pointer Up
    if (state.activeTool === 'remove_object') {
      setIsDrawing(false);
      lastPointRef.current = null;
      lastLocalPointRef.current = null;
      const mCanvas = removeObjectProps?.maskCanvasRef?.current;
      if (mCanvas) {
        const mCtx = mCanvas.getContext('2d');
        if (mCtx) {
          const imgData = mCtx.getImageData(0, 0, mCanvas.width, mCanvas.height).data;
          let hasPixels = false;
          for (let i = 3; i < imgData.length; i += 32) {
            if (imgData[i] > 10) {
              hasPixels = true;
              break;
            }
          }
          removeObjectProps?.setHasMask(hasPixels);
        }
      }
      return;
    }

    // Handle Background Removal Cutout Completion (Restore Brush & Erase Brush)
    if (isDrawing && state.activeTool === 'bg_remove') {
      setIsDrawing(false);
      const targetId = activeErasingLayerIdRef.current;

      if (targetId && activeErasingCanvasRef.current) {
        const targetLayer = (state.layers || []).find((l) => l.id === targetId);
        if (targetLayer?.type === 'image') {
          const updatedDataUrl = activeErasingCanvasRef.current.toDataURL('image/png');
          const originalSourceUrl = targetLayer.originalSource || targetLayer.source;
          onUpdateState((prev) => ({
            ...prev,
            layers: (prev.layers || []).map((l) =>
              l.id === targetId
                ? {
                    ...l,
                    source: updatedDataUrl,
                    originalSource: l.originalSource || originalSourceUrl,
                  }
                : l
            ),
          }));
        }
      }

      setActiveErasingLayerId(null);
      activeErasingCanvasRef.current = null;
      activeErasingLayerIdRef.current = null;
      lastLocalPointRef.current = null;
      setCurrentPath(null);
      return;
    }

    // Handle Smart Eraser Completion
    if (isDrawing && currentPath && currentPath.tool === 'eraser') {
      setIsDrawing(false);
      const targetId = activeErasingLayerIdRef.current;

      if (targetId) {
        const targetLayer = (state.layers || []).find((l) => l.id === targetId);

        // Commit image erasure in a single clean state update (enables flawless undo/redo)
        if (targetLayer?.type === 'image' && activeErasingCanvasRef.current) {
          const updatedDataUrl = activeErasingCanvasRef.current.toDataURL('image/png');
          const originalSourceUrl = targetLayer.originalSource || targetLayer.source;
          onUpdateState((prev) => ({
            ...prev,
            layers: (prev.layers || []).map((l) =>
              l.id === targetId
                ? {
                    ...l,
                    source: updatedDataUrl,
                    originalSource: l.originalSource || originalSourceUrl,
                  }
                : l
            ),
          }));
        }

        // Commit drawing layer erasure stroke
        if (targetLayer?.type === 'drawing' && currentPath.points.length > 0) {
          onUpdateState((prev) => ({
            ...prev,
            layers: (prev.layers || []).map((l) =>
              l.id === targetId
                ? { ...l, drawingPaths: [...(l.drawingPaths || []), currentPath] }
                : l
            ),
          }));
        }

        // Commit effect layer mask erasure (non-destructive masking with full undo/redo)
        if (targetLayer?.type === 'effect' && activeErasingCanvasRef.current) {
          const updatedMaskDataUrl = activeErasingCanvasRef.current.toDataURL('image/png');
          const maskImg = new Image();
          maskImg.src = updatedMaskDataUrl;
          imageElementCache.current.set(updatedMaskDataUrl, maskImg);

          onUpdateState((prev) => ({
            ...prev,
            layers: (prev.layers || []).map((l) =>
              l.id === targetId ? { ...l, effectMask: updatedMaskDataUrl } : l
            ),
          }));
        }
      }

      setActiveErasingLayerId(null);
      activeErasingCanvasRef.current = null;
      activeErasingLayerIdRef.current = null;
      lastLocalPointRef.current = null;
      setCurrentPath(null);
      return;
    }

    activeErasingCanvasRef.current = null;
    activeErasingLayerIdRef.current = null;
    setActiveErasingLayerId(null);
    lastLocalPointRef.current = null;

    if (isDrawing && currentPath && currentPath.points.length > 1) {
      setIsDrawing(false);

      // If drawing (brush path), persist drawing path
      if (currentPath.tool !== 'eraser') {
        const existingDrawingLayer = (state.layers || []).find((l) => l.type === 'drawing');

        if (!existingDrawingLayer) {
          const newLayer: Layer = {
            id: 'drawing_layer_' + Date.now(),
            name: isAr ? 'طبقة رسم' : 'Drawing Layer',
            type: 'drawing',
            x: 0,
            y: 0,
            width: state.canvasWidth,
            height: state.canvasHeight,
            rotation: 0,
            opacity: 100,
            visible: true,
            zIndex: state.layers.length + 1,
            filters: { ...DEFAULT_FILTERS },
            drawingPaths: [currentPath],
          };
          onUpdateState((prev) => ({
            ...prev,
            layers: [...prev.layers, newLayer],
            selectedLayerId: newLayer.id,
          }));
        } else {
          onUpdateState((prev) => ({
            ...prev,
            layers: prev.layers.map((l) =>
              l.id === existingDrawingLayer.id
                ? { ...l, drawingPaths: [...(l.drawingPaths || []), currentPath] }
                : l
            ),
          }));
        }
      }
      setCurrentPath(null);
    } else if (isDrawing) {
      setIsDrawing(false);
      setCurrentPath(null);
    }
  };

  // Start resize from handle
  const handleResizeStart = (handle: string, e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedLayer || selectedLayer.locked) return;
    const { x, y } = clientToCanvasCoords(e.clientX, e.clientY);
    setIsResizing(handle);
    setDragStartPos({ x, y });
    setInitialLayerSize({
      width: selectedLayer.width,
      height: selectedLayer.height,
      x: selectedLayer.x,
      y: selectedLayer.y,
      rotation: selectedLayer.rotation || 0,
      flipH: !!selectedLayer.flipHorizontal,
      flipV: !!selectedLayer.flipVertical,
    });
  };

  // Background CSS generator
  const getCanvasBackgroundStyle = () => {
    const bg = state.background;
    if (bg.type === 'transparent') {
      return {};
    }
    if (bg.type === 'solid') {
      return { backgroundColor: bg.color || '#ffffff' };
    }
    if (bg.type === 'gradient' && bg.gradient) {
      return {
        backgroundImage: `linear-gradient(${bg.gradient.angle || 135}deg, ${
          bg.gradient.from || '#6C4DFF'
        }, ${bg.gradient.to || '#23B5D3'})`,
      };
    }
    if ((bg.type === 'library' || bg.type === 'custom_image') && bg.imageUrl) {
      return {
        backgroundImage: `url(${bg.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return { backgroundColor: '#ffffff' };
  };

  // Filter CSS generator with combined layer & filter opacity
  const getLayerRenderStyle = (layer: Layer): React.CSSProperties => {
    const layerOpacity = (layer.opacity !== undefined ? layer.opacity : 100) / 100;
    const filterOpacity = (layer.filters?.opacity !== undefined ? layer.filters.opacity : 100) / 100;
    const combinedOpacity = Math.max(0, Math.min(1, layerOpacity * filterOpacity));

    const isAdvanced = layer.filters ? hasAdvancedFilters(layer.filters) : false;
    let filterString = isAdvanced ? 'none' : (layer.filters ? buildCanvasFilterString(layer.filters) : 'none');

    // Add contour drop-shadow if enabled and type is 'drop'
    if (layer.shadow?.enabled && layer.shadow.type === 'drop') {
      const rad = ((layer.shadow.angle || 90) * Math.PI) / 180;
      const dist = layer.shadow.distance || 10;
      const ox = Math.round(dist * Math.cos(rad));
      const oy = Math.round(dist * Math.sin(rad));
      const blur = layer.shadow.blur || 20;
      const alpha = (layer.shadow.opacity || 50) / 100;
      const color = layer.shadow.color || '#000000';
      const shadowPart = `drop-shadow(${ox}px ${oy}px ${blur}px ${color})`;
      filterString = filterString === 'none' ? shadowPart : `${filterString} ${shadowPart}`;
    }

    return {
      filter: filterString,
      opacity: combinedOpacity,
    };
  };

  // Text layer rich styling
  const getTextLayerStyle = (tc: TextConfig): React.CSSProperties => {
    const isGradient = !!(tc.gradient?.enabled && tc.gradient.from && tc.gradient.to);

    const style: React.CSSProperties = {
      fontFamily: tc.fontFamily || 'Cairo',
      fontSize: `${tc.fontSize || 36}px`,
      fontWeight: tc.bold ? 'bold' : 'normal',
      fontStyle: tc.italic ? 'italic' : 'normal',
      textDecoration: [
        tc.underline ? 'underline' : '',
        tc.strikethrough ? 'line-through' : '',
      ]
        .filter(Boolean)
        .join(' ') || 'none',
      textTransform: tc.uppercase ? 'uppercase' : 'none',
      textAlign: tc.align || 'center',
      lineHeight: tc.lineHeight || 1.3,
      letterSpacing: tc.letterSpacing ? `${tc.letterSpacing}px` : 'normal',
      opacity: tc.opacity !== undefined ? tc.opacity : 1,
    };

    if (isGradient) {
      style.backgroundImage = `linear-gradient(${tc.gradient!.angle || 135}deg, ${tc.gradient!.from}, ${tc.gradient!.to})`;
      style.WebkitBackgroundClip = 'text';
      style.backgroundClip = 'text';
      style.WebkitTextFillColor = 'transparent';
      style.color = 'transparent';
      style.display = 'inline-block';
    } else {
      style.color = tc.color || '#172033';
      style.WebkitTextFillColor = tc.color || '#172033';
    }

    if (tc.stroke?.enabled && tc.stroke.width) {
      style.WebkitTextStroke = `${tc.stroke.width}px ${tc.stroke.color || '#ffffff'}`;
    }

    if (tc.shadow?.enabled && !isGradient) {
      const { color = '#000000', blur = 8, offsetX = 2, offsetY = 4 } = tc.shadow;
      style.textShadow = `${offsetX}px ${offsetY}px ${blur}px ${color}`;
    } else if (tc.shadow?.enabled && isGradient) {
      const { color = '#000000', blur = 8, offsetX = 2, offsetY = 4 } = tc.shadow;
      style.filter = `drop-shadow(${offsetX}px ${offsetY}px ${blur}px ${color})`;
    }

    return style;
  };

  const isCutoutRestoreActive =
    state.activeTool === 'bg_remove' && (cutoutProps?.mode ?? 'restore') === 'restore';
  const isCutoutEraseActive =
    state.activeTool === 'bg_remove' && cutoutProps?.mode === 'erase';

  const isEraserActive =
    state.activeTool === 'eraser' ||
    (state.activeTool === 'draw' && brushConfig.tool === 'eraser') ||
    isCutoutEraseActive;

  // Canvas wheel handling: Zoom with Ctrl/Cmd or Zoom tool, Pan with scroll
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || state.activeTool === 'zoom') {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      onUpdateState((prev) => ({
        ...prev,
        zoom: Math.min(5.0, Math.max(0.1, Number((prev.zoom * zoomFactor).toFixed(2)))),
      }));
    } else {
      const dx = e.shiftKey ? e.deltaY : e.deltaX;
      const dy = e.shiftKey ? 0 : e.deltaY;
      onUpdateState((prev) => ({
        ...prev,
        pan: {
          x: Math.round(prev.pan.x - dx * 0.75),
          y: Math.round(prev.pan.y - dy * 0.75),
        },
      }));
    }
  };

  return (
    <div
      ref={containerRef}
      id="pixelora-canvas-container"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        handlePointerUp();
        setMouseCanvasPos((prev) => ({ ...prev, visible: false }));
      }}
      className={`flex-1 relative overflow-hidden flex items-center justify-center p-4 select-none touch-none ${
        state.activeTool === 'hand' || isPanning
          ? 'cursor-grab active:cursor-grabbing'
          : isEyedropperActive || isAltPressed || state.activeTool === 'freeform_crop'
          ? 'cursor-crosshair'
          : isEraserActive || state.activeTool === 'draw' || isCutoutRestoreActive
          ? 'cursor-none'
          : state.activeTool === 'zoom'
          ? 'cursor-zoom-in'
          : 'cursor-default'
      } ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}
    >
      {/* Unified Contextual Toolbar (Crop, Brush, Eraser, Freeform Crop) */}
      <ContextualToolbar
        activeTool={state.activeTool}
        isEraserActive={isEraserActive}
        selectedLayer={selectedLayer}
        brushConfig={brushConfig}
        setBrushConfig={setBrushConfig || (() => {})}
        recentColors={recentColors}
        onSelectColor={
          onSelectColor ||
          ((c: string) => setBrushConfig && setBrushConfig((b) => ({ ...b, color: c })))
        }
        isEyedropperActive={isEyedropperActive}
        onToggleEyedropper={onToggleEyedropper || (() => {})}
        onPointerEnter={() => {
          setMouseCanvasPos((prev) => ({ ...prev, visible: false }));
        }}
        onPointerLeave={() => {
          setMouseCanvasPos((prev) => ({ ...prev, visible: true }));
        }}
        freeformCropProps={{
          mode: freeformMode,
          setMode: setFreeformMode,
          pointsCount: freeformPoints.length,
          canApply: freeformPoints.length >= 3,
          onApply: handleApplyFreeformCropAction,
          onReset: handleResetFreeformCrop,
          onCancel: handleCancelFreeformCrop,
          isDrawing: isFreeformDrawing,
        }}
        cropProps={{
          cropTargetMode,
          setCropTargetMode,
          cropTargetLayerId,
          setCropTargetLayerId,
          cropAspectRatio,
          setCropAspectRatio,
          cropDimensions:
            cropTargetMode === 'image'
              ? (() => {
                  const targetImg = (state.layers || []).find((l) => l.id === cropTargetLayerId);
                  if (!targetImg)
                    return {
                      width: Math.round(imageCropBox.width),
                      height: Math.round(imageCropBox.height),
                    };
                  const sx = (targetImg.bitmapWidth || targetImg.width) / targetImg.width;
                  const sy = (targetImg.bitmapHeight || targetImg.height) / targetImg.height;
                  return {
                    width: Math.round(imageCropBox.width * sx),
                    height: Math.round(imageCropBox.height * sy),
                  };
                })()
              : {
                  width: Math.round(canvasCropBox.width),
                  height: Math.round(canvasCropBox.height),
                },
          imageLayers: (state.layers || []).filter((l) => l.type === 'image' && l.source),
          onApplyCrop: handleApplyCropAction,
          onCancelCrop: handleCancelCrop,
          onResetCrop: handleResetCrop,
        }}
        transformProps={
          state.activeTool === 'transform'
            ? {
                layer: selectedLayer || null,
                onUpdateTransform: (updates) => {
                  if (!selectedLayer) return;
                  onUpdateState((prev) => ({
                    ...prev,
                    layers: prev.layers.map((l) => (l.id === selectedLayer.id ? { ...l, ...updates } : l)),
                  }));
                },
                onApplyTransform: () => transformProps?.onApplyTransform?.(),
                onCancelTransform: () => transformProps?.onCancelTransform?.(),
                onResetTransform: () => transformProps?.onResetTransform?.(),
              }
            : undefined
        }
        removeObjectProps={
          removeObjectProps
            ? {
                ...removeObjectProps,
                selectedLayer: selectedLayer || null,
              }
            : undefined
        }
        language={language}
        darkMode={darkMode}
      />

      {/* Target Layer Awareness Warning Banner for Remove Object */}
      {state.activeTool === 'remove_object' && (!selectedLayer || selectedLayer.locked || selectedLayer.type !== 'image') && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-amber-500/90 dark:bg-amber-900/90 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-md border border-amber-400/50">
          <AlertCircle className="w-4 h-4 shrink-0 text-white" />
          <span>
            {selectedLayer?.locked
              ? isAr
                ? 'الطبقة مقفلة. يرجى إلغاء قفل الطبقة لاستخدام أداة إزالة الكائن'
                : 'The layer is locked. Please unlock it to use the Remove Object tool'
              : isAr
              ? 'تعمل أداة إزالة الكائن على طبقات الصور فقط. يرجى تحديد طبقة صورة قابلة للتعديل.'
              : 'Remove Object works on raster/image content. Select an editable image layer.'}
          </span>
        </div>
      )}



      {/* Main Interactive Canvas Artboard */}
      <div
        id="pixelora-main-artboard"
        style={{
          width: `${state.canvasWidth}px`,
          height: `${state.canvasHeight}px`,
          transform: `translate(${state.pan.x}px, ${state.pan.y}px) scale(${state.zoom})`,
          transformOrigin: 'center center',
          ...getCanvasBackgroundStyle(),
        }}
        className={`relative shadow-2xl transition-transform duration-75 shrink-0 overflow-hidden ${
          state.background.type === 'transparent'
            ? darkMode
              ? 'canvas-checkerboard-dark'
              : 'canvas-checkerboard'
            : ''
        }`}
      >
        {/* Render Layers */}
        {state.layers
          .filter((l) => l.visible)
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .map((layer) => {
            const isSelected = layer.id === state.selectedLayerId;

            return (
              <div
                key={layer.id}
                onDoubleClick={() => {
                  if (layer.type === 'text') {
                    setEditingTextLayerId(layer.id);
                  }
                }}
                style={{
                  position: 'absolute',
                  left: `${layer.x}px`,
                  top: `${layer.y}px`,
                  width: `${layer.width}px`,
                  height: `${layer.height}px`,
                  transform: `rotate(${layer.rotation || 0}deg) skewX(${layer.skewX || 0}deg) skewY(${
                    layer.skewY || 0
                  }deg) scaleX(${layer.flipHorizontal ? -1 : 1}) scaleY(${layer.flipVertical ? -1 : 1})`,
                  transformOrigin: `${(layer.pivotX !== undefined ? layer.pivotX : 0.5) * 100}% ${(layer.pivotY !== undefined ? layer.pivotY : 0.5) * 100}%`,
                  ...getLayerRenderStyle(layer),
                  pointerEvents: state.activeTool === 'select' || state.activeTool === 'text' || state.activeTool === 'transform' ? 'auto' : 'none',
                }}
                className={`transition-shadow ${
                  isSelected && state.activeTool === 'select'
                    ? 'ring-2 ring-[#6C4DFF] ring-offset-1 z-50'
                    : ''
                }`}
              >
                {/* Image layer */}
                {layer.type === 'image' && layer.source && (
                  <div className="w-full h-full relative">
                    {/* Contact or Floating Shadow under product */}
                    {layer.shadow?.enabled && (layer.shadow.type === 'contact' || layer.shadow.type === 'floating') && (() => {
                      const isFloating = layer.shadow.type === 'floating';
                      const rad = ((layer.shadow.angle || 90) * Math.PI) / 180;
                      const dist = layer.shadow.distance || (isFloating ? 35 : 8);
                      const ox = Math.round(dist * Math.cos(rad));
                      const oy = Math.round(dist * Math.sin(rad));
                      const blur = layer.shadow.blur || (isFloating ? 28 : 20);
                      const alpha = (layer.shadow.opacity || 50) / 100;
                      const color = layer.shadow.color || '#000000';
                      const shadowW = isFloating ? layer.width * 0.75 : layer.width * 0.88;
                      const shadowH = isFloating ? Math.max(12, layer.height * 0.12) : Math.max(8, layer.height * 0.10);
                      const left = (layer.width - shadowW) / 2 + ox;
                      const top = isFloating
                        ? layer.height + oy + dist * 0.5
                        : layer.height - shadowH * 0.55 + oy;

                      return (
                        <div
                          className="absolute pointer-events-none rounded-full"
                          style={{
                            left: `${left}px`,
                            top: `${top}px`,
                            width: `${shadowW}px`,
                            height: `${shadowH}px`,
                            background: `radial-gradient(ellipse at center, ${color} 0%, transparent 75%)`,
                            opacity: alpha,
                            filter: `blur(${Math.max(1, blur / 2)}px)`,
                            zIndex: 0,
                          }}
                        />
                      );
                    })()}

                    <ProcessedImageLayer
                      layer={layer}
                      className={`w-full h-full object-contain pointer-events-none relative z-1 ${
                        activeErasingLayerId === layer.id ||
                        (state.activeTool === 'remove_object' &&
                          state.selectedLayerId === layer.id &&
                          removeObjectProps?.isPreviewing &&
                          removeObjectProps.previewCanvas)
                          ? 'invisible'
                          : ''
                      }`}
                    />
                    {activeErasingLayerId === layer.id && (
                      <canvas
                        ref={liveErasingDisplayCanvasRef}
                        width={layer.bitmapWidth || layer.width}
                        height={layer.bitmapHeight || layer.height}
                        className="w-full h-full object-contain absolute inset-0 pointer-events-none z-10"
                      />
                    )}

                    {/* Remove Object Live Mask Overlay or Inpainting Preview Canvas */}
                    {state.activeTool === 'remove_object' && state.selectedLayerId === layer.id && (
                      removeObjectProps?.isPreviewing && removeObjectProps.previewCanvas ? (
                        <canvas
                          ref={(canvas) => {
                            if (canvas && removeObjectProps.previewCanvas) {
                              canvas.width = removeObjectProps.previewCanvas.width;
                              canvas.height = removeObjectProps.previewCanvas.height;
                              const ctx = canvas.getContext('2d');
                              ctx?.drawImage(removeObjectProps.previewCanvas, 0, 0);
                            }
                          }}
                          className="w-full h-full object-contain absolute inset-0 pointer-events-none z-10 shadow-lg"
                        />
                      ) : (
                        <canvas
                          ref={removeObjectMaskDisplayCanvasRef}
                          width={layer.bitmapWidth || layer.width}
                          height={layer.bitmapHeight || layer.height}
                          className="w-full h-full object-contain absolute inset-0 pointer-events-none z-10 opacity-80"
                        />
                      )
                    )}
                    {(() => {
                      const vAmt =
                        typeof layer.filters?.vignette === 'number'
                          ? layer.filters.vignette
                          : typeof layer.filters?.vignette === 'object'
                          ? layer.filters.vignette?.amount || 0
                          : 0;
                      if (!vAmt) return null;
                      const isDark = vAmt > 0;
                      const alpha = (Math.abs(vAmt) / 100) * 0.85;
                      const color = isDark ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`;
                      const midColor = isDark ? `rgba(0,0,0,${alpha * 0.25})` : `rgba(255,255,255,${alpha * 0.25})`;
                      return (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 25%, ${midColor} 60%, ${color} 100%)`,
                          }}
                        />
                      );
                    })()}

                    {/* Film Grain Live Preview Overlay */}
                    {layer.filters?.grain?.amount && layer.filters.grain.amount > 0 ? (
                      <div
                        className="absolute inset-0 pointer-events-none mix-blend-overlay"
                        style={{
                          opacity: Math.min(0.7, (layer.filters.grain.amount / 100) * 0.5),
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grainNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grainNoise)'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'repeat',
                        }}
                      />
                    ) : null}
                  </div>
                )}

                {/* Text layer with Full Rich Styling & Inline Editing */}
                {layer.type === 'text' && layer.textConfig && (
                  <div
                    className="w-full h-full relative flex items-center justify-center p-1"
                    style={{
                      backgroundColor: layer.textConfig.backgroundColor || 'transparent',
                      borderRadius: layer.textConfig.backgroundColor ? '8px' : undefined,
                    }}
                  >
                    {editingTextLayerId === layer.id ? (
                      <textarea
                        autoFocus
                        value={layer.textConfig.text}
                        onChange={(e) => {
                          const val = e.target.value;
                          onUpdateState((prev) => ({
                            ...prev,
                            layers: prev.layers.map((l) =>
                              l.id === layer.id
                                ? {
                                    ...l,
                                    textConfig: { ...l.textConfig!, text: val },
                                  }
                                : l
                            ),
                          }));
                        }}
                        onBlur={() => setEditingTextLayerId(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') setEditingTextLayerId(null);
                        }}
                        dir={layer.textConfig.direction || (isAr ? 'rtl' : 'ltr')}
                        style={{
                          fontFamily: layer.textConfig.fontFamily || 'Cairo',
                          fontSize: `${layer.textConfig.fontSize || 36}px`,
                          fontWeight: layer.textConfig.bold ? 'bold' : 'normal',
                          textAlign: layer.textConfig.align || 'center',
                          color: layer.textConfig.color || '#172033',
                        }}
                        className="w-full h-full bg-white/95 dark:bg-slate-900/95 rounded-lg border-2 border-[#6C4DFF] p-2 outline-none resize-none leading-tight shadow-xl"
                      />
                    ) : (
                      <div
                        dir={layer.textConfig.direction || (isAr ? 'rtl' : 'ltr')}
                        className="w-full h-full flex items-center justify-center select-none cursor-pointer leading-tight transition-all"
                      >
                        <span
                          style={getTextLayerStyle(layer.textConfig)}
                          className="inline-block max-w-full break-words select-none pointer-events-none"
                        >
                          {layer.textConfig.text}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Shape layer using comprehensive SVG path definitions */}
                {layer.type === 'shape' && layer.shapeConfig && (
                  <svg className="w-full h-full overflow-visible pointer-events-none">
                    {(() => {
                      const svgData = getShapeSvgContent(
                        layer.shapeConfig.shapeType,
                        layer.width,
                        layer.height,
                        layer.shapeConfig.fillColor,
                        layer.shapeConfig.strokeColor,
                        layer.shapeConfig.strokeWidth,
                        layer.shapeConfig.borderRadius
                      );

                      if (svgData.type === 'rect') return <rect {...svgData.props} />;
                      if (svgData.type === 'ellipse') return <ellipse {...svgData.props} />;
                      if (svgData.type === 'polygon') return <polygon {...svgData.props} />;
                      if (svgData.type === 'path') return <path {...svgData.props} />;
                      if (svgData.type === 'line') return <line {...svgData.props} />;
                      return null;
                    })()}
                  </svg>
                )}

                {/* Drawing Paths Layer with Canvas destination-out Smart Eraser */}
                {layer.type === 'drawing' && (
                  <DrawingCanvasLayer
                    layer={layer}
                    livePath={
                      isDrawing &&
                      currentPath &&
                      (activeErasingLayerIdRef.current === layer.id ||
                        (state.selectedLayerId === layer.id && currentPath.tool === 'eraser') ||
                        (state.activeTool === 'draw' && currentPath.tool !== 'eraser'))
                        ? currentPath
                        : null
                    }
                  />
                )}

                {/* Effect Layer with Non-Destructive Photographic Pipeline and Live Mask Canvas */}
                {layer.type === 'effect' && (
                  <EffectCanvasLayer
                    layer={layer}
                    layers={state.layers}
                    canvasWidth={state.canvasWidth}
                    canvasHeight={state.canvasHeight}
                    background={state.background}
                    isErasing={activeErasingLayerId === layer.id}
                    liveErasingCanvasRef={activeErasingCanvasRef}
                    liveTick={liveErasingTick}
                  />
                )}

                {/* Vector Path Layer */}
                {layer.type === 'path' && layer.pathConfig && (
                  <svg
                    viewBox={`0 0 ${layer.pathConfig.viewBoxWidth || layer.width} ${layer.pathConfig.viewBoxHeight || layer.height}`}
                    className="w-full h-full overflow-visible pointer-events-none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d={pathPointsToSvgD(layer.pathConfig.points, layer.pathConfig.closed)}
                      fill={layer.pathConfig.fillColor === 'transparent' ? 'none' : layer.pathConfig.fillColor}
                      stroke={layer.pathConfig.strokeColor}
                      strokeWidth={layer.pathConfig.strokeWidth}
                      strokeLinecap={layer.pathConfig.strokeCap || 'round'}
                      strokeLinejoin={layer.pathConfig.strokeJoin || 'round'}
                      strokeDasharray={layer.pathConfig.strokeDashArray}
                    />
                  </svg>
                )}

                {/* Interactive Resize Handles (Proper Bounding Box with 8 Handles & Real-Time Dimension Badge) */}
                {isSelected && state.activeTool === 'select' && (
                  layer.locked ? (
                    /* Locked layer indicator bounding box */
                    <div className="absolute inset-0 border-2 border-amber-500/80 pointer-events-none shadow-xs">
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-600 text-white rounded-md text-[10px] font-bold tracking-tight shadow-md whitespace-nowrap pointer-events-none z-50 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>{isAr ? 'الطبقة مقفلة' : 'Layer Locked'}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Bounding Box Border */}
                      <div className="absolute inset-0 border-2 border-[#6C4DFF] pointer-events-none shadow-xs" />

                      {/* Real-time dimension badge */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900/90 text-white rounded-md text-[10px] font-mono font-bold tracking-tight shadow-md whitespace-nowrap pointer-events-none z-50 flex items-center gap-1 border border-slate-700">
                        <span>
                          {Math.round(layer.width)} × {Math.round(layer.height)} px
                        </span>
                      </div>

                      {/* 4 Corner Handles (Proportional Resize with Locked Aspect Ratio) */}
                      <div
                        onPointerDown={(e) => handleResizeStart('nw', e)}
                        className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-[#6C4DFF] rounded-xs cursor-nwse-resize shadow-md z-50 hover:scale-125 transition-transform touch-none"
                        title={isAr ? 'تغيير الحجم مع الحفاظ على النسبة' : 'Proportional Resize'}
                      />
                      <div
                        onPointerDown={(e) => handleResizeStart('ne', e)}
                        className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-[#6C4DFF] rounded-xs cursor-nesw-resize shadow-md z-50 hover:scale-125 transition-transform touch-none"
                        title={isAr ? 'تغيير الحجم مع الحفاظ على النسبة' : 'Proportional Resize'}
                      />
                      <div
                        onPointerDown={(e) => handleResizeStart('se', e)}
                        className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-[#6C4DFF] rounded-xs cursor-nwse-resize shadow-md z-50 hover:scale-125 transition-transform touch-none"
                        title={isAr ? 'تغيير الحجم مع الحفاظ على النسبة' : 'Proportional Resize'}
                      />
                      <div
                        onPointerDown={(e) => handleResizeStart('sw', e)}
                        className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-[#6C4DFF] rounded-xs cursor-nesw-resize shadow-md z-50 hover:scale-125 transition-transform touch-none"
                        title={isAr ? 'تغيير الحجم مع الحفاظ على النسبة' : 'Proportional Resize'}
                      />

                      {/* 4 Edge Handles (Directional Width & Height Resize) */}
                      <div
                        onPointerDown={(e) => handleResizeStart('n', e)}
                        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border-2 border-[#6C4DFF] rounded-xs cursor-ns-resize shadow-xs z-50 hover:scale-125 transition-transform touch-none"
                        title={isAr ? 'تغيير الارتفاع' : 'Resize Height'}
                      />
                      <div
                        onPointerDown={(e) => handleResizeStart('s', e)}
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border-2 border-[#6C4DFF] rounded-xs cursor-ns-resize shadow-xs z-50 hover:scale-125 transition-transform touch-none"
                        title={isAr ? 'تغيير الارتفاع' : 'Resize Height'}
                      />
                      <div
                        onPointerDown={(e) => handleResizeStart('e', e)}
                        className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-4 bg-white border-2 border-[#6C4DFF] rounded-xs cursor-ew-resize shadow-xs z-50 hover:scale-125 transition-transform touch-none"
                        title={isAr ? 'تغيير العرض' : 'Resize Width'}
                      />
                      <div
                        onPointerDown={(e) => handleResizeStart('w', e)}
                        className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-4 bg-white border-2 border-[#6C4DFF] rounded-xs cursor-ew-resize shadow-xs z-50 hover:scale-125 transition-transform touch-none"
                        title={isAr ? 'تغيير العرض' : 'Resize Width'}
                      />
                    </>
                  )
                )}
              </div>
            );
          })}

        {/* Live Drawing Active Path Preview for brush */}
        {isDrawing && currentPath && currentPath.tool !== 'eraser' && (
          <svg className="w-full h-full absolute inset-0 pointer-events-none z-40 overflow-visible">
            <defs>
              <filter id="airbrush-soft-filter-live" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
              <filter id="feather-soft-brush-live" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" />
              </filter>
            </defs>
            {renderSvgDrawingPath(currentPath, 0, 0, 'live_path')}
          </svg>
        )}

        {/* Vector Pen Tool Interactive Canvas Overlay */}
        {state.activeTool === 'pen' && penProps && (
          <div className={isEyedropperActive ? 'pointer-events-none' : ''}>
            <PenCanvasOverlay
              canvasWidth={state.canvasWidth}
              canvasHeight={state.canvasHeight}
              zoom={state.zoom}
              activePathLayer={penProps.activePathLayer}
              onUpdateActivePath={penProps.onUpdateActivePath}
              onCreateNewPathLayer={penProps.onCreateNewPathLayer}
              language={language}
              darkMode={darkMode}
              selectedPointId={penProps.selectedPointId}
              setSelectedPointId={penProps.setSelectedPointId}
            />
          </div>
        )}

        {/* Marching Ants Path Selection Overlay */}
        {penProps?.activeSelectionSvgD && (
          <PathSelectionOverlay
            canvasWidth={state.canvasWidth}
            canvasHeight={state.canvasHeight}
            zoom={state.zoom}
            svgD={penProps.activeSelectionSvgD}
            onFillSelection={penProps.onFillSelection || (() => {})}
            onStrokeSelection={penProps.onStrokeSelection || (() => {})}
            onClearSelection={penProps.onClearSelection || (() => {})}
            language={language}
            darkMode={darkMode}
          />
        )}

        {/* Unified Advanced Transform Interactive Bounding Box & Handles */}
        {state.activeTool === 'transform' && selectedLayer && (
          <TransformBoundingBox
            layer={selectedLayer}
            zoom={state.zoom}
            clientToCanvasCoords={clientToCanvasCoords}
            onUpdateLayer={(updates) => {
              onUpdateState((prev) => ({
                ...prev,
                layers: prev.layers.map((l) => (l.id === selectedLayer.id ? { ...l, ...updates } : l)),
              }));
            }}
            onUpdateTransform={(updates) => {
              onUpdateState((prev) => ({
                ...prev,
                layers: prev.layers.map((l) => (l.id === selectedLayer.id ? { ...l, ...updates } : l)),
              }));
            }}
            onApplyTransform={() => transformProps?.onApplyTransform?.()}
            onCancelTransform={() => transformProps?.onCancelTransform?.()}
            onResetTransform={() => transformProps?.onResetTransform?.()}
            canvasWidth={state.canvasWidth}
            canvasHeight={state.canvasHeight}
            language={language}
            darkMode={darkMode}
          />
        )}

        {/* Visual Crop Overlay inside Artboard */}
        {state.activeTool === 'crop' && (
          <>
            {cropTargetMode === 'image' ? (
              (() => {
                const targetImgLayer = (state.layers || []).find((l) => l.id === cropTargetLayerId);
                if (!targetImgLayer) {
                  return (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40">
                      <div className="bg-slate-900/90 text-slate-200 px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold">
                        {isAr ? 'يرجى تحديد طبقة صورة لقصها' : 'Please select an image layer to crop'}
                      </div>
                    </div>
                  );
                }

                const sx = (targetImgLayer.bitmapWidth || targetImgLayer.width) / targetImgLayer.width;
                const sy = (targetImgLayer.bitmapHeight || targetImgLayer.height) / targetImgLayer.height;
                const pw = Math.round(imageCropBox.width * sx);
                const ph = Math.round(imageCropBox.height * sy);

                return (
                  <>
                    {/* Ambient canvas dimming */}
                    <div className="absolute inset-0 bg-black/50 pointer-events-none z-30" />

                    {/* Target Image Layer-Aligned Crop Container */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${targetImgLayer.x}px`,
                        top: `${targetImgLayer.y}px`,
                        width: `${targetImgLayer.width}px`,
                        height: `${targetImgLayer.height}px`,
                        transform: targetImgLayer.rotation ? `rotate(${targetImgLayer.rotation}deg)` : undefined,
                        transformOrigin: 'center center',
                        zIndex: 45,
                      }}
                    >
                      {/* SVG mask that dims everything outside the crop rectangle within the image layer */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <path
                          fillRule="evenodd"
                          d={`M 0 0 H ${targetImgLayer.width} V ${targetImgLayer.height} H 0 Z M ${imageCropBox.x} ${imageCropBox.y} V ${imageCropBox.y + imageCropBox.height} H ${imageCropBox.x + imageCropBox.width} V ${imageCropBox.y} Z`}
                          fill="rgba(0, 0, 0, 0.6)"
                        />
                      </svg>

                      {/* Interactive Crop Rectangle */}
                      <div
                        style={{
                          position: 'absolute',
                          left: `${imageCropBox.x}px`,
                          top: `${imageCropBox.y}px`,
                          width: `${imageCropBox.width}px`,
                          height: `${imageCropBox.height}px`,
                        }}
                        className="border-2 border-[#2DD4BF] shadow-[0_0_0_1px_rgba(0,0,0,0.6)] cursor-move select-none"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const pt = clientToCanvasCoords(e.clientX, e.clientY);
                          const { x: localX, y: localY } = canvasToLayerLocalCoords(pt.x, pt.y, targetImgLayer);
                          setIsDraggingCrop(true);
                          setCropDragStart({ x: localX - imageCropBox.x, y: localY - imageCropBox.y });
                          setCropInitialState({ ...imageCropBox });
                        }}
                      >
                        {/* Rule-of-Thirds Grid */}
                        <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/40 pointer-events-none" />
                        <div className="absolute top-0 bottom-0 left-2/3 w-px bg-white/40 pointer-events-none" />
                        <div className="absolute left-0 right-0 top-1/3 h-px bg-white/40 pointer-events-none" />
                        <div className="absolute left-0 right-0 top-2/3 h-px bg-white/40 pointer-events-none" />

                        {/* Pixel Resolution Badge */}
                        <div className="absolute -top-7 right-0 bg-slate-900/90 text-[#2DD4BF] text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border border-slate-700 shadow-md pointer-events-none whitespace-nowrap">
                          {pw} × {ph} px
                        </div>

                        {/* Corner Handles */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const pt = clientToCanvasCoords(e.clientX, e.clientY);
                            setCropResizeHandle('nw');
                            setDragStartPos(pt);
                            setCropInitialState({ ...imageCropBox });
                          }}
                          className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-[#2DD4BF] rounded-xs cursor-nwse-resize shadow-lg z-10 hover:scale-110 transition-transform"
                        />
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const pt = clientToCanvasCoords(e.clientX, e.clientY);
                            setCropResizeHandle('ne');
                            setDragStartPos(pt);
                            setCropInitialState({ ...imageCropBox });
                          }}
                          className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-[#2DD4BF] rounded-xs cursor-nesw-resize shadow-lg z-10 hover:scale-110 transition-transform"
                        />
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const pt = clientToCanvasCoords(e.clientX, e.clientY);
                            setCropResizeHandle('se');
                            setDragStartPos(pt);
                            setCropInitialState({ ...imageCropBox });
                          }}
                          className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-[#2DD4BF] rounded-xs cursor-nwse-resize shadow-lg z-10 hover:scale-110 transition-transform"
                        />
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const pt = clientToCanvasCoords(e.clientX, e.clientY);
                            setCropResizeHandle('sw');
                            setDragStartPos(pt);
                            setCropInitialState({ ...imageCropBox });
                          }}
                          className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-[#2DD4BF] rounded-xs cursor-nesw-resize shadow-lg z-10 hover:scale-110 transition-transform"
                        />

                        {/* Edge Handles */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const pt = clientToCanvasCoords(e.clientX, e.clientY);
                            setCropResizeHandle('n');
                            setDragStartPos(pt);
                            setCropInitialState({ ...imageCropBox });
                          }}
                          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white border-2 border-[#2DD4BF] rounded-xs cursor-ns-resize shadow-md z-10 hover:scale-110 transition-transform"
                          title={isAr ? 'قص من الأعلى' : 'Crop Top'}
                        />
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const pt = clientToCanvasCoords(e.clientX, e.clientY);
                            setCropResizeHandle('s');
                            setDragStartPos(pt);
                            setCropInitialState({ ...imageCropBox });
                          }}
                          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white border-2 border-[#2DD4BF] rounded-xs cursor-ns-resize shadow-md z-10 hover:scale-110 transition-transform"
                          title={isAr ? 'قص من الأسفل' : 'Crop Bottom'}
                        />
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const pt = clientToCanvasCoords(e.clientX, e.clientY);
                            setCropResizeHandle('e');
                            setDragStartPos(pt);
                            setCropInitialState({ ...imageCropBox });
                          }}
                          className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-6 bg-white border-2 border-[#2DD4BF] rounded-xs cursor-ew-resize shadow-md z-10 hover:scale-110 transition-transform"
                          title={isAr ? 'قص من اليمين' : 'Crop Right'}
                        />
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const pt = clientToCanvasCoords(e.clientX, e.clientY);
                            setCropResizeHandle('w');
                            setDragStartPos(pt);
                            setCropInitialState({ ...imageCropBox });
                          }}
                          className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-6 bg-white border-2 border-[#2DD4BF] rounded-xs cursor-ew-resize shadow-md z-10 hover:scale-110 transition-transform"
                          title={isAr ? 'قص من اليسار' : 'Crop Left'}
                        />
                      </div>
                    </div>
                  </>
                );
              })()
            ) : (
              /* Canvas Crop Mode */
              <div className="absolute inset-0 z-40">
                {/* SVG mask that dims everything outside the canvas crop rectangle */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    fillRule="evenodd"
                    d={`M 0 0 H ${state.canvasWidth} V ${state.canvasHeight} H 0 Z M ${canvasCropBox.x} ${canvasCropBox.y} V ${canvasCropBox.y + canvasCropBox.height} H ${canvasCropBox.x + canvasCropBox.width} V ${canvasCropBox.y} Z`}
                    fill="rgba(0, 0, 0, 0.6)"
                  />
                </svg>

                {/* Interactive Crop Rectangle */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${canvasCropBox.x}px`,
                    top: `${canvasCropBox.y}px`,
                    width: `${canvasCropBox.width}px`,
                    height: `${canvasCropBox.height}px`,
                  }}
                  className="border-2 border-[#2DD4BF] shadow-[0_0_0_1px_rgba(0,0,0,0.6)] cursor-move select-none"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const pt = clientToCanvasCoords(e.clientX, e.clientY);
                    setIsDraggingCrop(true);
                    setCropDragStart({ x: pt.x - canvasCropBox.x, y: pt.y - canvasCropBox.y });
                    setCropInitialState({ ...canvasCropBox });
                  }}
                >
                  {/* Rule-of-Thirds Grid */}
                  <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/40 pointer-events-none" />
                  <div className="absolute top-0 bottom-0 left-2/3 w-px bg-white/40 pointer-events-none" />
                  <div className="absolute left-0 right-0 top-1/3 h-px bg-white/40 pointer-events-none" />
                  <div className="absolute left-0 right-0 top-2/3 h-px bg-white/40 pointer-events-none" />

                  {/* Pixel Resolution Badge */}
                  <div className="absolute -top-7 right-0 bg-slate-900/90 text-[#2DD4BF] text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border border-slate-700 shadow-md pointer-events-none whitespace-nowrap">
                    {Math.round(canvasCropBox.width)} × {Math.round(canvasCropBox.height)} px
                  </div>

                  {/* Corner Handles */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      const pt = clientToCanvasCoords(e.clientX, e.clientY);
                      setCropResizeHandle('nw');
                      setDragStartPos(pt);
                      setCropInitialState({ ...canvasCropBox });
                    }}
                    className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-[#2DD4BF] rounded-xs cursor-nwse-resize shadow-lg z-10 hover:scale-110 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      const pt = clientToCanvasCoords(e.clientX, e.clientY);
                      setCropResizeHandle('ne');
                      setDragStartPos(pt);
                      setCropInitialState({ ...canvasCropBox });
                    }}
                    className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-[#2DD4BF] rounded-xs cursor-nesw-resize shadow-lg z-10 hover:scale-110 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      const pt = clientToCanvasCoords(e.clientX, e.clientY);
                      setCropResizeHandle('se');
                      setDragStartPos(pt);
                      setCropInitialState({ ...canvasCropBox });
                    }}
                    className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-[#2DD4BF] rounded-xs cursor-nwse-resize shadow-lg z-10 hover:scale-110 transition-transform"
                  />
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      const pt = clientToCanvasCoords(e.clientX, e.clientY);
                      setCropResizeHandle('sw');
                      setDragStartPos(pt);
                      setCropInitialState({ ...canvasCropBox });
                    }}
                    className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-[#2DD4BF] rounded-xs cursor-nesw-resize shadow-lg z-10 hover:scale-110 transition-transform"
                  />

                  {/* Edge Handles */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      const pt = clientToCanvasCoords(e.clientX, e.clientY);
                      setCropResizeHandle('n');
                      setDragStartPos(pt);
                      setCropInitialState({ ...canvasCropBox });
                    }}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white border-2 border-[#2DD4BF] rounded-xs cursor-ns-resize shadow-md z-10 hover:scale-110 transition-transform"
                    title={isAr ? 'قص من الأعلى' : 'Crop Top'}
                  />
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      const pt = clientToCanvasCoords(e.clientX, e.clientY);
                      setCropResizeHandle('s');
                      setDragStartPos(pt);
                      setCropInitialState({ ...canvasCropBox });
                    }}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white border-2 border-[#2DD4BF] rounded-xs cursor-ns-resize shadow-md z-10 hover:scale-110 transition-transform"
                    title={isAr ? 'قص من الأسفل' : 'Crop Bottom'}
                  />
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      const pt = clientToCanvasCoords(e.clientX, e.clientY);
                      setCropResizeHandle('e');
                      setDragStartPos(pt);
                      setCropInitialState({ ...canvasCropBox });
                    }}
                    className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-6 bg-white border-2 border-[#2DD4BF] rounded-xs cursor-ew-resize shadow-md z-10 hover:scale-110 transition-transform"
                    title={isAr ? 'قص من اليمين' : 'Crop Right'}
                  />
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      const pt = clientToCanvasCoords(e.clientX, e.clientY);
                      setCropResizeHandle('w');
                      setDragStartPos(pt);
                      setCropInitialState({ ...canvasCropBox });
                    }}
                    className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-6 bg-white border-2 border-[#2DD4BF] rounded-xs cursor-ew-resize shadow-md z-10 hover:scale-110 transition-transform"
                    title={isAr ? 'قص من اليسار' : 'Crop Left'}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Visual Freeform Crop Overlay (القص الحر) */}
        {state.activeTool === 'freeform_crop' && (
          <>
            {(() => {
              const targetImgLayer = (state.layers || []).find(
                (l) => l.id === state.selectedLayerId && l.type === 'image' && !l.locked
              );

              if (!targetImgLayer) {
                return (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40">
                    <div className="bg-slate-900/95 text-slate-100 px-5 py-3.5 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center gap-3">
                      <LassoSelect className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">
                          {isAr ? 'حدد طبقة صورة للقص الحر' : 'Select an Image Layer to Freeform Crop'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {isAr
                            ? 'انقر على أي صورة في لوحة العمل لتحديدها وبدء رسم حدود القص'
                            : 'Click any image layer on the canvas to select it and draw boundary'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Path strings for SVG
              const hasClosed = freeformPoints.length >= 3;
              const pointsSvgD = freeformPoints
                .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
                .join(' ');
              const closedPathD = hasClosed ? `${pointsSvgD} Z` : pointsSvgD;

              return (
                <>
                  {/* Ambient canvas dimming */}
                  <div className="absolute inset-0 bg-black/40 pointer-events-none z-30" />

                  {/* Target Image Layer-Aligned Freeform Container */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${targetImgLayer.x}px`,
                      top: `${targetImgLayer.y}px`,
                      width: `${targetImgLayer.width}px`,
                      height: `${targetImgLayer.height}px`,
                      transform: targetImgLayer.rotation ? `rotate(${targetImgLayer.rotation}deg)` : undefined,
                      transformOrigin: 'center center',
                      zIndex: 45,
                      pointerEvents: 'none',
                    }}
                  >
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                      viewBox={`0 0 ${targetImgLayer.width} ${targetImgLayer.height}`}
                    >
                      {/* Darkened mask covering outside the drawn path */}
                      {hasClosed && (
                        <path
                          fillRule="evenodd"
                          d={`M 0 0 H ${targetImgLayer.width} V ${targetImgLayer.height} H 0 Z ${closedPathD}`}
                          fill="rgba(0, 0, 0, 0.55)"
                        />
                      )}

                      {/* Drop-shadow outline for boundary contrast */}
                      {freeformPoints.length > 1 && (
                        <path
                          d={hasClosed ? closedPathD : pointsSvgD}
                          fill="none"
                          stroke="rgba(0, 0, 0, 0.5)"
                          strokeWidth={4 / state.zoom}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Bright boundary stroke */}
                      {freeformPoints.length > 1 && (
                        <path
                          d={hasClosed ? closedPathD : pointsSvgD}
                          fill={hasClosed ? 'rgba(16, 185, 129, 0.08)' : 'none'}
                          stroke="#10B981"
                          strokeWidth={2 / state.zoom}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* In polygon mode, dotted guide line from last point to cursor */}
                      {freeformMode === 'polygon' && freeformHoverPoint && freeformPoints.length > 0 && (
                        <line
                          x1={freeformPoints[freeformPoints.length - 1].x}
                          y1={freeformPoints[freeformPoints.length - 1].y}
                          x2={freeformHoverPoint.x}
                          y2={freeformHoverPoint.y}
                          stroke="#34D399"
                          strokeWidth={1.5 / state.zoom}
                          strokeDasharray={`${5 / state.zoom},${4 / state.zoom}`}
                        />
                      )}

                      {/* Polygon vertex nodes */}
                      {freeformMode === 'polygon' &&
                        freeformPoints.map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={pt.x}
                            cy={pt.y}
                            r={(idx === 0 ? 5 : 3.5) / state.zoom}
                            fill={idx === 0 ? '#10B981' : '#FFFFFF'}
                            stroke="#0F172A"
                            strokeWidth={1.5 / state.zoom}
                          />
                        ))}
                    </svg>

                    {/* Hint badge near layer */}
                    <div
                      style={{
                        position: 'absolute',
                        top: -30,
                        [isAr ? 'right' : 'left']: 0,
                      }}
                      className="bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-md pointer-events-none whitespace-nowrap flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>
                        {freeformPoints.length >= 3
                          ? isAr
                            ? `المسار جاهز (${freeformPoints.length} نقطة) — اضغط Enter أو تطبيق القص`
                            : `Path ready (${freeformPoints.length} pts) — Press Enter or Apply`
                          : freeformMode === 'freehand'
                          ? isAr
                            ? 'انقر واسحب بالماوس للرسم حول الجزء المطلوب'
                            : 'Click & drag around the desired area'
                          : isAr
                          ? 'انقر لتحديد زوايا المضلع'
                          : 'Click to place polygon vertices'}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </>
        )}

        {/* Empty Canvas Callout */}
        {state.layers.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white/40 dark:bg-gray-900/40 backdrop-blur-xs">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-gray-800 text-[#6C4DFF] dark:text-[#2DD4BF] flex items-center justify-center mb-3">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-1">
              {isAr ? 'لوحة العمل جاهزة للتصميم' : 'Canvas is Ready'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs">
              {isAr
                ? 'ارفع صورة للبدء بالتعديل أو أضف نصوصًا وأشكالًا هندسية وخلفيات'
                : 'Upload an image or add text, shapes, and backgrounds to start designing.'}
            </p>
            <label className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C4DFF] to-[#4B32C3] hover:opacity-95 cursor-pointer shadow-xs">
              <span>{isAr ? 'رفع صورة للوحة' : 'Upload Image'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => onImageUpload(e.target.files)}
              />
            </label>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* LIVE BRUSH CURSOR INDICATOR                                                */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* LIVE BRUSH CURSOR INDICATOR                                                */}
      {/* ========================================================================= */}
      {state.activeTool === 'draw' &&
        brushConfig.tool !== 'eraser' &&
        !isEyedropperActive &&
        !isAltPressed &&
        mouseCanvasPos.visible && (
          <div
            style={{
              position: 'fixed',
              left: `${mouseCanvasPos.clientX}px`,
              top: `${mouseCanvasPos.clientY}px`,
              width: `${Math.max(4, brushConfig.size * state.zoom)}px`,
              height: `${Math.max(4, brushConfig.size * state.zoom)}px`,
              transform: 'translate(-50%, -50%)',
              borderRadius: brushConfig.tipShape === 'square' ? '2px' : '50%',
              borderColor: brushConfig.color,
              borderWidth: '1.5px',
              borderStyle: 'solid',
              backgroundColor: `${brushConfig.color}25`,
              boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.9), 0 0 4px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
            className="flex items-center justify-center pointer-events-none"
          >
            {brushConfig.brushType === 'stars' ? (
              <span className="text-[10px] pointer-events-none" style={{ color: brushConfig.color }}>
                ★
              </span>
            ) : brushConfig.brushType === 'hearts' ? (
              <span className="text-[10px] pointer-events-none" style={{ color: brushConfig.color }}>
                ♥
              </span>
            ) : (
              <div
                className="w-1 h-1 rounded-full pointer-events-none shadow-xs"
                style={{ backgroundColor: brushConfig.color }}
              />
            )}
          </div>
        )}

      {/* ========================================================================= */}
      {/* PROFESSIONAL RED ERASER CURSOR (Visual Indicator Only)                    */}
      {/* ========================================================================= */}
      {isEraserActive &&
        mouseCanvasPos.visible && (
          <div
            style={{
              position: 'fixed',
              left: `${mouseCanvasPos.clientX}px`,
              top: `${mouseCanvasPos.clientY}px`,
              width: `${Math.max(4, brushConfig.size * state.zoom)}px`,
              height: `${Math.max(4, brushConfig.size * state.zoom)}px`,
              transform: 'translate(-50%, -50%)',
              borderRadius: brushConfig.tipShape === 'square' ? '2px' : '50%',
              borderColor: '#EF4444',
              borderWidth: '2px',
              borderStyle: 'solid',
              backgroundColor: 'rgba(239, 68, 68, 0.22)',
              boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.9), 0 0 6px rgba(0, 0, 0, 0.45)',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
            className="flex items-center justify-center pointer-events-none"
          >
            {/* Precise Red Center Dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-xs pointer-events-none" />

            {/* Soft hardness indicator inner ring if hardness < 0.9 */}
            {brushConfig.hardness < 0.9 && (
              <div
                style={{
                  width: `${Math.max(2, brushConfig.size * state.zoom * Math.max(0.1, brushConfig.hardness))}px`,
                  height: `${Math.max(2, brushConfig.size * state.zoom * Math.max(0.1, brushConfig.hardness))}px`,
                  borderRadius: brushConfig.tipShape === 'square' ? '1px' : '50%',
                  borderColor: 'rgba(239, 68, 68, 0.75)',
                  borderWidth: '1px',
                  borderStyle: 'dashed',
                }}
                className="pointer-events-none absolute"
              />
            )}
          </div>
        )}

      {/* ========================================================================= */}
      {/* PROFESSIONAL RESTORE BRUSH CURSOR (Visual Indicator For Cutout Recovery)  */}
      {/* ========================================================================= */}
      {isCutoutRestoreActive &&
        mouseCanvasPos.visible && (
          <div
            style={{
              position: 'fixed',
              left: `${mouseCanvasPos.clientX}px`,
              top: `${mouseCanvasPos.clientY}px`,
              width: `${Math.max(4, brushConfig.size * state.zoom)}px`,
              height: `${Math.max(4, brushConfig.size * state.zoom)}px`,
              transform: 'translate(-50%, -50%)',
              borderRadius: brushConfig.tipShape === 'square' ? '2px' : '50%',
              borderColor: '#10B981',
              borderWidth: '2px',
              borderStyle: 'solid',
              backgroundColor: 'rgba(16, 185, 129, 0.22)',
              boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.9), 0 0 6px rgba(0, 0, 0, 0.45)',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
            className="flex items-center justify-center pointer-events-none"
          >
            {/* Emerald Center Dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-xs pointer-events-none" />

            {/* Soft hardness indicator inner ring if hardness < 0.9 */}
            {brushConfig.hardness < 0.9 && (
              <div
                style={{
                  width: `${Math.max(2, brushConfig.size * state.zoom * Math.max(0.1, brushConfig.hardness))}px`,
                  height: `${Math.max(2, brushConfig.size * state.zoom * Math.max(0.1, brushConfig.hardness))}px`,
                  borderRadius: brushConfig.tipShape === 'square' ? '1px' : '50%',
                  borderColor: 'rgba(16, 185, 129, 0.75)',
                  borderWidth: '1px',
                  borderStyle: 'dashed',
                }}
                className="pointer-events-none absolute"
              />
            )}
          </div>
        )}

      {/* ========================================================================= */}
      {/* REMOVE OBJECT MASK BRUSH CURSOR                                           */}
      {/* ========================================================================= */}
      {state.activeTool === 'remove_object' &&
        removeObjectProps &&
        mouseCanvasPos.visible && (
          <div
            style={{
              position: 'fixed',
              left: `${mouseCanvasPos.clientX}px`,
              top: `${mouseCanvasPos.clientY}px`,
              width: `${Math.max(4, removeObjectProps.brushSize * state.zoom)}px`,
              height: `${Math.max(4, removeObjectProps.brushSize * state.zoom)}px`,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              borderColor: removeObjectProps.mode === 'remove' ? '#3B82F6' : '#EC4899',
              borderWidth: '2px',
              borderStyle: 'solid',
              backgroundColor:
                removeObjectProps.mode === 'remove'
                  ? 'rgba(59, 130, 246, 0.15)'
                  : 'rgba(236, 72, 153, 0.22)',
              boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.9), 0 0 8px rgba(0, 0, 0, 0.5)',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
            className="flex items-center justify-center pointer-events-none"
          >
            {/* Center Dot */}
            <div
              className={`w-1.5 h-1.5 rounded-full shadow-xs pointer-events-none ${
                removeObjectProps.mode === 'remove' ? 'bg-blue-600' : 'bg-pink-600'
              }`}
            />

            {/* Hardness inner ring if < 0.9 */}
            {removeObjectProps.hardness < 0.9 && (
              <div
                style={{
                  width: `${Math.max(
                    2,
                    removeObjectProps.brushSize *
                      state.zoom *
                      Math.max(0.1, removeObjectProps.hardness)
                  )}px`,
                  height: `${Math.max(
                    2,
                    removeObjectProps.brushSize *
                      state.zoom *
                      Math.max(0.1, removeObjectProps.hardness)
                  )}px`,
                  borderRadius: '50%',
                  borderColor:
                    removeObjectProps.mode === 'remove'
                      ? 'rgba(59, 130, 246, 0.75)'
                      : 'rgba(236, 72, 153, 0.75)',
                  borderWidth: '1px',
                  borderStyle: 'dashed',
                }}
                className="pointer-events-none absolute"
              />
            )}
          </div>
        )}

      {/* ========================================================================= */}
      {/* EYEDROPPER COLOR SAMPLING LOUPE CURSOR                                    */}
      {/* ========================================================================= */}
      {(isEyedropperActive || (isAltPressed && state.activeTool === 'draw')) &&
        mouseCanvasPos.visible &&
        mouseCanvasPos.x >= 0 &&
        mouseCanvasPos.x <= state.canvasWidth &&
        mouseCanvasPos.y >= 0 &&
        mouseCanvasPos.y <= state.canvasHeight && (
          <div
            style={{
              position: 'fixed',
              left: `${mouseCanvasPos.clientX}px`,
              top: `${mouseCanvasPos.clientY}px`,
              transform: 'translate(-50%, -100%) translateY(-12px)',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
            className="flex flex-col items-center gap-1 pointer-events-none animate-in fade-in zoom-in-75 duration-75 select-none"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/95 text-white shadow-xl border border-white/20 backdrop-blur-md">
              <div
                className="w-4 h-4 rounded-full border border-white/90 shadow-inner shrink-0"
                style={{ backgroundColor: hoveredSampleColor || brushConfig.color }}
              />
              <span className="font-mono text-[10px] font-bold tracking-wider">
                {hoveredSampleColor || brushConfig.color}
              </span>
            </div>
            <Pipette className="w-4 h-4 text-white drop-shadow-md" />
          </div>
        )}
    </div>
  );
};
