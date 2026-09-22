import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCw,
  Check,
  X,
  FlipHorizontal,
  FlipVertical,
  Crosshair,
  SlidersHorizontal,
} from 'lucide-react';
import { Layer } from '../../../types';

export interface TransformBoundingBoxProps {
  layer: Layer;
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
  onUpdateLayer?: (updates: Partial<Layer>) => void;
  onUpdateTransform?: (updates: Partial<Layer>) => void;
  onApplyTransform: () => void;
  onCancelTransform: () => void;
  onResetTransform?: () => void;
  clientToCanvasCoords?: (clientX: number, clientY: number) => { x: number; y: number };
  language: 'ar' | 'en';
  darkMode: boolean;
}

type ActiveHandleType =
  | 'move'
  | 'nw'
  | 'ne'
  | 'se'
  | 'sw'
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'rotate'
  | 'pivot'
  | 'skew_x'
  | 'skew_y'
  | null;

export const TransformBoundingBox: React.FC<TransformBoundingBoxProps> = ({
  layer,
  zoom,
  canvasWidth,
  canvasHeight,
  onUpdateLayer,
  onUpdateTransform,
  onApplyTransform,
  onCancelTransform,
  onResetTransform,
  clientToCanvasCoords,
  language,
  darkMode,
}) => {
  const isAr = language === 'ar';
  const [activeHandle, setActiveHandle] = useState<ActiveHandleType>(null);
  const [liveAngle, setLiveAngle] = useState<number | null>(null);

  const updateLayer = useCallback(
    (updates: Partial<Layer>) => {
      if (typeof onUpdateLayer === 'function') {
        onUpdateLayer(updates);
      } else if (typeof onUpdateTransform === 'function') {
        onUpdateTransform(updates);
      }
    },
    [onUpdateLayer, onUpdateTransform]
  );

  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (typeof clientToCanvasCoords === 'function') {
        return clientToCanvasCoords(clientX, clientY);
      }
      return { x: clientX, y: clientY };
    },
    [clientToCanvasCoords]
  );

  // Drag interaction snapshot
  const dragSnapshotRef = useRef<{
    startX: number;
    startY: number;
    layerX: number;
    layerY: number;
    layerW: number;
    layerH: number;
    rotation: number;
    skewX: number;
    skewY: number;
    pivotX: number;
    pivotY: number;
    flipH: boolean;
    flipV: boolean;
  }>({
    startX: 0,
    startY: 0,
    layerX: 0,
    layerY: 0,
    layerW: 0,
    layerH: 0,
    rotation: 0,
    skewX: 0,
    skewY: 0,
    pivotX: 0.5,
    pivotY: 0.5,
    flipH: false,
    flipV: false,
  });

  const pivotX = layer.pivotX !== undefined ? layer.pivotX : 0.5;
  const pivotY = layer.pivotY !== undefined ? layer.pivotY : 0.5;

  // Handle start pointer down
  const handlePointerDown = (handle: ActiveHandleType, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    dragSnapshotRef.current = {
      startX: x,
      startY: y,
      layerX: layer.x,
      layerY: layer.y,
      layerW: layer.width,
      layerH: layer.height,
      rotation: layer.rotation || 0,
      skewX: layer.skewX || 0,
      skewY: layer.skewY || 0,
      pivotX: layer.pivotX !== undefined ? layer.pivotX : 0.5,
      pivotY: layer.pivotY !== undefined ? layer.pivotY : 0.5,
      flipH: !!layer.flipHorizontal,
      flipV: !!layer.flipVertical,
    };

    setActiveHandle(handle);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Pointer move handler
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!activeHandle) return;

      const { x, y } = getCanvasCoords(e.clientX, e.clientY);
      const snap = dragSnapshotRef.current;
      const dx = x - snap.startX;
      const dy = y - snap.startY;

      // 1. MOVE (Dragging inside bounding box)
      if (activeHandle === 'move') {
        updateLayer({
          x: Math.round(snap.layerX + dx),
          y: Math.round(snap.layerY + dy),
        });
        return;
      }

      // 2. PIVOT (Dragging the transform origin anchor)
      if (activeHandle === 'pivot') {
        const rad = -((snap.rotation || 0) * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // Center of layer
        const cx = snap.layerX + snap.layerW / 2;
        const cy = snap.layerY + snap.layerH / 2;

        // Un-rotate current pointer around layer center
        const unrotX = (x - cx) * cos - (y - cy) * sin + cx;
        const unrotY = (x - cx) * sin + (y - cy) * cos + cy;

        // Normalized relative to layer box (can be outside 0..1 if user drags outside)
        const newPivotX = Number(((unrotX - snap.layerX) / snap.layerW).toFixed(3));
        const newPivotY = Number(((unrotY - snap.layerY) / snap.layerH).toFixed(3));

        updateLayer({
          pivotX: newPivotX,
          pivotY: newPivotY,
        });
        return;
      }

      // 3. ROTATION (Dragging rotation handle)
      if (activeHandle === 'rotate') {
        const pivotCanvasX = snap.layerX + snap.layerW * snap.pivotX;
        const pivotCanvasY = snap.layerY + snap.layerH * snap.pivotY;

        const startAngle = Math.atan2(snap.startY - pivotCanvasY, snap.startX - pivotCanvasX) * (180 / Math.PI);
        const currentAngle = Math.atan2(y - pivotCanvasY, x - pivotCanvasX) * (180 / Math.PI);

        let deltaAngle = currentAngle - startAngle;
        let newAngle = (snap.rotation + deltaAngle) % 360;

        // If Shift is pressed during rotation, snap to 15-degree increments
        if (e.shiftKey) {
          newAngle = Math.round(newAngle / 15) * 15;
        }

        const normalizedAngle = Math.round(((newAngle % 360) + 360) % 360);
        setLiveAngle(normalizedAngle);
        updateLayer({ rotation: normalizedAngle });
        return;
      }

      // 4. SKEW X & SKEW Y (Dedicated skew edge handles or with Alt/Ctrl)
      if (activeHandle === 'skew_x') {
        const rad = ((snap.rotation || 0) * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const localDx = dx * cos + dy * sin;
        const newSkewX = Math.max(-80, Math.min(80, Math.round(snap.skewX + (localDx / (snap.layerH || 1)) * 45)));
        updateLayer({ skewX: newSkewX });
        return;
      }

      if (activeHandle === 'skew_y') {
        const rad = ((snap.rotation || 0) * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const localDy = -dx * sin + dy * cos;
        const newSkewY = Math.max(-80, Math.min(80, Math.round(snap.skewY + (localDy / (snap.layerW || 1)) * 45)));
        updateLayer({ skewY: newSkewY });
        return;
      }

      // 5. SCALING & RESIZING (Corner & Side Handles)
      const rotRad = ((snap.rotation || 0) * Math.PI) / 180;
      const cos = Math.cos(rotRad);
      const sin = Math.sin(rotRad);

      let localDx = dx * cos + dy * sin;
      let localDy = -dx * sin + dy * cos;

      if (snap.flipH) localDx = -localDx;
      if (snap.flipV) localDy = -localDy;

      const origW = snap.layerW;
      const origH = snap.layerH;
      const aspect = origW / Math.max(1, origH);

      let newW = origW;
      let newH = origH;
      let shiftX = 0;
      let shiftY = 0;

      // CORNER SCALING (Requirement 4 & 5):
      // Default: Corner dragging PRESERVES aspect ratio.
      // Shift Modifier: When dragging with Shift pressed, allow NON-PROPORTIONAL / free scaling!
      const isCorner = ['nw', 'ne', 'se', 'sw'].includes(activeHandle);
      const keepAspectRatio = isCorner && !e.shiftKey;

      if (activeHandle === 'se') {
        newW = Math.max(10, origW + localDx);
        newH = keepAspectRatio ? Math.max(10, Math.round(newW / aspect)) : Math.max(10, origH + localDy);
        shiftX = (newW - origW) / 2;
        shiftY = (newH - origH) / 2;
      } else if (activeHandle === 'sw') {
        newW = Math.max(10, origW - localDx);
        newH = keepAspectRatio ? Math.max(10, Math.round(newW / aspect)) : Math.max(10, origH + localDy);
        shiftX = -(newW - origW) / 2;
        shiftY = (newH - origH) / 2;
      } else if (activeHandle === 'ne') {
        newW = Math.max(10, origW + localDx);
        newH = keepAspectRatio ? Math.max(10, Math.round(newW / aspect)) : Math.max(10, origH - localDy);
        shiftX = (newW - origW) / 2;
        shiftY = -(newH - origH) / 2;
      } else if (activeHandle === 'nw') {
        newW = Math.max(10, origW - localDx);
        newH = keepAspectRatio ? Math.max(10, Math.round(newW / aspect)) : Math.max(10, origH - localDy);
        shiftX = -(newW - origW) / 2;
        shiftY = -(newH - origH) / 2;
      }
      // SIDE HANDLES (Requirement 6):
      // Left / Right handles: changes width only!
      // Top / Bottom handles: changes height only!
      else if (activeHandle === 'e') {
        newW = Math.max(10, origW + localDx);
        shiftX = (newW - origW) / 2;
      } else if (activeHandle === 'w') {
        newW = Math.max(10, origW - localDx);
        shiftX = -(newW - origW) / 2;
      } else if (activeHandle === 's') {
        newH = Math.max(10, origH + localDy);
        shiftY = (newH - origH) / 2;
      } else if (activeHandle === 'n') {
        newH = Math.max(10, origH - localDy);
        shiftY = -(newH - origH) / 2;
      }

      if (snap.flipH) shiftX = -shiftX;
      if (snap.flipV) shiftY = -shiftY;

      // Project back to document coordinates
      const canvasShiftX = shiftX * cos - shiftY * sin;
      const canvasShiftY = shiftX * sin + shiftY * cos;

      const origCenterX = snap.layerX + origW / 2;
      const origCenterY = snap.layerY + origH / 2;

      const newCenterX = origCenterX + canvasShiftX;
      const newCenterY = origCenterY + canvasShiftY;

      updateLayer({
        x: Math.round(newCenterX - newW / 2),
        y: Math.round(newCenterY - newH / 2),
        width: Math.round(newW),
        height: Math.round(newH),
      });
    },
    [activeHandle, getCanvasCoords, updateLayer]
  );

  const handlePointerUp = useCallback(() => {
    setActiveHandle(null);
    setLiveAngle(null);
  }, []);

  useEffect(() => {
    if (!activeHandle) return;
    const onMove = (e: PointerEvent) => handlePointerMove(e);
    const onUp = () => handlePointerUp();

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [activeHandle, handlePointerMove, handlePointerUp]);

  // Scaled dimensions for handles so they remain comfortable to grab regardless of zoom
  const handleSize = Math.max(8, Math.min(14, 11 / Math.max(0.2, zoom)));
  const handleHalf = handleSize / 2;

  // Pivot coordinates relative to layer box
  const pivotPixelX = layer.width * pivotX;
  const pivotPixelY = layer.height * pivotY;

  return (
    <div
      id="pixelora-transform-bounding-box-container"
      style={{
        position: 'absolute',
        left: `${layer.x}px`,
        top: `${layer.y}px`,
        width: `${layer.width}px`,
        height: `${layer.height}px`,
        transform: `rotate(${layer.rotation || 0}deg) skewX(${layer.skewX || 0}deg) skewY(${
          layer.skewY || 0
        }deg) scaleX(${layer.flipHorizontal ? -1 : 1}) scaleY(${layer.flipVertical ? -1 : 1})`,
        transformOrigin: `${pivotX * 100}% ${pivotY * 100}%`,
        pointerEvents: 'none',
        zIndex: 90,
      }}
      className="select-none"
    >
      {/* 1. Sleek Outer Bounding Box Border */}
      <div
        className="absolute inset-0 border-2 border-[#6C4DFF] pointer-events-auto cursor-move shadow-xs"
        onPointerDown={(e) => handlePointerDown('move', e)}
        title={isAr ? 'اسحب لنقل العنصر في مساحة العمل' : 'Drag to Move Element'}
      />

      {/* 2. Real-Time Dimension, Angle & Skew Badge */}
      <div
        style={{
          transform: `scaleX(${layer.flipHorizontal ? -1 : 1}) scaleY(${layer.flipVertical ? -1 : 1})`,
        }}
        className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-950/90 text-white rounded-lg text-[10px] font-mono font-bold tracking-tight shadow-lg whitespace-nowrap pointer-events-none z-100 flex items-center gap-2 border border-slate-700/80 backdrop-blur-xs"
      >
        <span>
          {Math.round(layer.width)} × {Math.round(layer.height)} px
        </span>
        {layer.rotation !== 0 && (
          <span className="text-[#2DD4BF] flex items-center gap-0.5">
            <RotateCw className="w-2.5 h-2.5" />
            <span>{Math.round(layer.rotation || 0)}°</span>
          </span>
        )}
        {(layer.skewX !== 0 || layer.skewY !== 0) && (
          <span className="text-amber-400">
            Sk: {Math.round(layer.skewX || 0)}°, {Math.round(layer.skewY || 0)}°
          </span>
        )}
      </div>

      {/* 3. ROTATION HANDLE WITH STEM */}
      <div
        className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing z-100"
        onPointerDown={(e) => handlePointerDown('rotate', e)}
        title={isAr ? 'اسحب لتدوير العنصر بحرية (اضغط Shift للمحاذاة بزوايا 15°)' : 'Drag to Rotate (Hold Shift to snap 15°)'}
      >
        {/* Circular Rotation Knob */}
        <div
          style={{ width: `${handleSize + 4}px`, height: `${handleSize + 4}px` }}
          className="rounded-full bg-white border-2 border-[#6C4DFF] shadow-md flex items-center justify-center hover:scale-125 hover:bg-purple-50 transition-transform"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#6C4DFF]" />
        </div>
        {/* Connecting Stem */}
        <div className="w-0.5 h-3 bg-[#6C4DFF]" />
      </div>

      {/* 4. TRANSFORM PIVOT / ORIGIN (Movable ⊕ Target) */}
      <div
        style={{
          position: 'absolute',
          left: `${pivotPixelX}px`,
          top: `${pivotPixelY}px`,
          transform: 'translate(-50%, -50%)',
          width: '18px',
          height: '18px',
        }}
        onPointerDown={(e) => handlePointerDown('pivot', e)}
        className="pointer-events-auto cursor-crosshair z-100 flex items-center justify-center group"
        title={isAr ? 'نقطة الارتكاز (Pivot) — اسحب لتغيير مركز التدوير والتحجيم' : 'Transform Origin / Pivot — Drag to relocate'}
      >
        <div className="w-4 h-4 rounded-full bg-white/95 border-2 border-[#20BFC4] shadow-md flex items-center justify-center group-hover:scale-125 group-hover:bg-[#20BFC4] group-hover:text-white transition-all">
          <div className="w-1.5 h-1.5 rounded-full bg-[#20BFC4] group-hover:bg-white" />
        </div>
      </div>

      {/* 5. 4 CORNER HANDLES (Preserves aspect ratio; Shift = Free distort) */}
      {/* NW Corner */}
      <div
        onPointerDown={(e) => handlePointerDown('nw', e)}
        style={{
          width: `${handleSize}px`,
          height: `${handleSize}px`,
          left: `-${handleHalf}px`,
          top: `-${handleHalf}px`,
        }}
        className="absolute bg-white border-2 border-[#6C4DFF] rounded-xs cursor-nwse-resize shadow-md pointer-events-auto z-100 hover:scale-125 transition-transform"
        title={isAr ? 'تحجيم تناسبي (Shift للتحجيم الحر)' : 'Proportional Scale (Shift for Free)'}
      />
      {/* NE Corner */}
      <div
        onPointerDown={(e) => handlePointerDown('ne', e)}
        style={{
          width: `${handleSize}px`,
          height: `${handleSize}px`,
          right: `-${handleHalf}px`,
          top: `-${handleHalf}px`,
        }}
        className="absolute bg-white border-2 border-[#6C4DFF] rounded-xs cursor-nesw-resize shadow-md pointer-events-auto z-100 hover:scale-125 transition-transform"
        title={isAr ? 'تحجيم تناسبي (Shift للتحجيم الحر)' : 'Proportional Scale (Shift for Free)'}
      />
      {/* SE Corner */}
      <div
        onPointerDown={(e) => handlePointerDown('se', e)}
        style={{
          width: `${handleSize}px`,
          height: `${handleSize}px`,
          right: `-${handleHalf}px`,
          bottom: `-${handleHalf}px`,
        }}
        className="absolute bg-white border-2 border-[#6C4DFF] rounded-xs cursor-nwse-resize shadow-md pointer-events-auto z-100 hover:scale-125 transition-transform"
        title={isAr ? 'تحجيم تناسبي (Shift للتحجيم الحر)' : 'Proportional Scale (Shift for Free)'}
      />
      {/* SW Corner */}
      <div
        onPointerDown={(e) => handlePointerDown('sw', e)}
        style={{
          width: `${handleSize}px`,
          height: `${handleSize}px`,
          left: `-${handleHalf}px`,
          bottom: `-${handleHalf}px`,
        }}
        className="absolute bg-white border-2 border-[#6C4DFF] rounded-xs cursor-nesw-resize shadow-md pointer-events-auto z-100 hover:scale-125 transition-transform"
        title={isAr ? 'تحجيم تناسبي (Shift للتحجيم الحر)' : 'Proportional Scale (Shift for Free)'}
      />

      {/* 6. 4 SIDE HANDLES (Directional Width & Height Resize) */}
      {/* North Handle (Height) */}
      <div
        onPointerDown={(e) => handlePointerDown('n', e)}
        style={{
          width: `${handleSize * 1.5}px`,
          height: `${handleSize * 0.75}px`,
          top: `-${handleHalf * 0.75}px`,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        className="absolute bg-white border-2 border-[#6C4DFF] rounded-xs cursor-ns-resize shadow-xs pointer-events-auto z-100 hover:scale-125 transition-transform"
        title={isAr ? 'تغيير الارتفاع فقط' : 'Resize Height'}
      />
      {/* South Handle (Height) */}
      <div
        onPointerDown={(e) => handlePointerDown('s', e)}
        style={{
          width: `${handleSize * 1.5}px`,
          height: `${handleSize * 0.75}px`,
          bottom: `-${handleHalf * 0.75}px`,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        className="absolute bg-white border-2 border-[#6C4DFF] rounded-xs cursor-ns-resize shadow-xs pointer-events-auto z-100 hover:scale-125 transition-transform"
        title={isAr ? 'تغيير الارتفاع فقط' : 'Resize Height'}
      />
      {/* East Handle (Width) */}
      <div
        onPointerDown={(e) => handlePointerDown('e', e)}
        style={{
          width: `${handleSize * 0.75}px`,
          height: `${handleSize * 1.5}px`,
          right: `-${handleHalf * 0.75}px`,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        className="absolute bg-white border-2 border-[#6C4DFF] rounded-xs cursor-ew-resize shadow-xs pointer-events-auto z-100 hover:scale-125 transition-transform"
        title={isAr ? 'تغيير العرض فقط' : 'Resize Width'}
      />
      {/* West Handle (Width) */}
      <div
        onPointerDown={(e) => handlePointerDown('w', e)}
        style={{
          width: `${handleSize * 0.75}px`,
          height: `${handleSize * 1.5}px`,
          left: `-${handleHalf * 0.75}px`,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        className="absolute bg-white border-2 border-[#6C4DFF] rounded-xs cursor-ew-resize shadow-xs pointer-events-auto z-100 hover:scale-125 transition-transform"
        title={isAr ? 'تغيير العرض فقط' : 'Resize Width'}
      />

      {/* 7. FLOATING QUICK ACTION PILL (Apply / Cancel / Flip) */}
      <div
        style={{
          transform: `scaleX(${layer.flipHorizontal ? -1 : 1}) scaleY(${layer.flipVertical ? -1 : 1})`,
        }}
        className="absolute -bottom-11 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-700 rounded-xl shadow-xl backdrop-blur-md pointer-events-auto z-100"
      >
        {/* Apply (Enter) */}
        <button
          onClick={onApplyTransform}
          title={isAr ? 'تطبيق التحويل (Enter)' : 'Apply Transform (Enter)'}
          className="p-1.5 rounded-lg bg-[#6C4DFF] hover:bg-[#5839EE] text-white shadow-2xs hover:scale-105 active:scale-95 transition-all"
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Cancel (Esc) */}
        <button
          onClick={onCancelTransform}
          title={isAr ? 'إلغاء واستعادة الحالة الأصلية (Esc)' : 'Cancel & Revert (Esc)'}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:scale-105 active:scale-95 transition-all"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />

        {/* Quick Flip H */}
        <button
          onClick={() => updateLayer({ flipHorizontal: !layer.flipHorizontal })}
          title={isAr ? 'قلب أفقي' : 'Flip Horizontal'}
          className={`p-1.5 rounded-lg transition-all ${
            layer.flipHorizontal
              ? 'bg-purple-100 text-[#6C4DFF] dark:bg-purple-950/60 dark:text-[#2DD4BF]'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <FlipHorizontal className="w-3.5 h-3.5" />
        </button>

        {/* Quick Flip V */}
        <button
          onClick={() => updateLayer({ flipVertical: !layer.flipVertical })}
          title={isAr ? 'قلب رأسي' : 'Flip Vertical'}
          className={`p-1.5 rounded-lg transition-all ${
            layer.flipVertical
              ? 'bg-purple-100 text-[#6C4DFF] dark:bg-purple-950/60 dark:text-[#2DD4BF]'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <FlipVertical className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
