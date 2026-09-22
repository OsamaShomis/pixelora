import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Link2,
  Unlink2,
  Check,
  X,
  Rotate3d,
  Layers,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Move,
  Lock,
} from 'lucide-react';
import { Layer } from '../../../types';

export interface TransformInspectorProps {
  selectedLayer: Layer | null;
  onUpdateTransform: (updates: Partial<Layer>) => void;
  onApplyTransform: () => void;
  onCancelTransform: () => void;
  onResetTransform: () => void;
  language: 'ar' | 'en';
  darkMode: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export const TransformInspector: React.FC<TransformInspectorProps> = ({
  selectedLayer,
  onUpdateTransform,
  onApplyTransform,
  onCancelTransform,
  onResetTransform,
  language,
  darkMode,
  canvasWidth,
  canvasHeight,
}) => {
  const isAr = language === 'ar';
  const [aspectLocked, setAspectLocked] = useState(true);

  if (!selectedLayer) {
    return (
      <div
        id="pixelora-transform-empty-state"
        className="p-6 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-3 h-full select-none"
      >
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-slate-800 border border-purple-100 dark:border-slate-700 flex items-center justify-center text-[#6C4DFF] dark:text-[#2DD4BF] shadow-xs">
          <Maximize2 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {isAr ? 'التحويل المتقدم' : 'Advanced Transform'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[220px] leading-relaxed">
            {isAr
              ? 'يرجى تحديد أي عنصر (صورة، شكل، نص، رسم، أو مسار متجهات) للتحويل والتدوير والانحراف.'
              : 'Please select any element (Image, Shape, Text, Drawing, or Pen Path) to scale, rotate, and skew.'}
          </p>
        </div>
      </div>
    );
  }

  const posX = Math.round(selectedLayer.x);
  const posY = Math.round(selectedLayer.y);
  const width = Math.max(1, Math.round(selectedLayer.width));
  const height = Math.max(1, Math.round(selectedLayer.height));
  const rotation = Math.round(selectedLayer.rotation || 0);
  const skewX = Math.round(selectedLayer.skewX || 0);
  const skewY = Math.round(selectedLayer.skewY || 0);
  const pivotX = selectedLayer.pivotX !== undefined ? selectedLayer.pivotX : 0.5;
  const pivotY = selectedLayer.pivotY !== undefined ? selectedLayer.pivotY : 0.5;

  // Handle Dimension Change
  const handleWidthChange = (newW: number) => {
    const validW = Math.max(5, newW);
    if (aspectLocked && width > 0) {
      const ratio = height / width;
      const validH = Math.max(5, Math.round(validW * ratio));
      onUpdateTransform({ width: validW, height: validH });
    } else {
      onUpdateTransform({ width: validW });
    }
  };

  const handleHeightChange = (newH: number) => {
    const validH = Math.max(5, newH);
    if (aspectLocked && height > 0) {
      const ratio = width / height;
      const validW = Math.max(5, Math.round(validH * ratio));
      onUpdateTransform({ width: validW, height: validH });
    } else {
      onUpdateTransform({ height: validH });
    }
  };

  // 9-Point Pivot Grid (0, 0.5, 1)
  const pivotGrid = [
    { label: isAr ? 'أعلى اليسار' : 'Top Left', x: 0, y: 0 },
    { label: isAr ? 'أعلى الوسط' : 'Top Center', x: 0.5, y: 0 },
    { label: isAr ? 'أعلى اليمين' : 'Top Right', x: 1, y: 0 },
    { label: isAr ? 'وسط اليسار' : 'Middle Left', x: 0, y: 0.5 },
    { label: isAr ? 'المركز' : 'Center', x: 0.5, y: 0.5 },
    { label: isAr ? 'وسط اليمين' : 'Middle Right', x: 1, y: 0.5 },
    { label: isAr ? 'أسفل اليسار' : 'Bottom Left', x: 0, y: 1 },
    { label: isAr ? 'أسفل الوسط' : 'Bottom Center', x: 0.5, y: 1 },
    { label: isAr ? 'أسفل اليمين' : 'Bottom Right', x: 1, y: 1 },
  ];

  const isPivotMatch = (px: number, py: number) => {
    return Math.abs(pivotX - px) < 0.05 && Math.abs(pivotY - py) < 0.05;
  };

  return (
    <div
      id="pixelora-advanced-transform-inspector"
      className="p-4 space-y-4 text-slate-800 dark:text-slate-100 overflow-y-auto h-full scrollbar-thin select-none"
    >
      {/* Element Header Card */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-850 border border-purple-100 dark:border-slate-700 shadow-2xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6C4DFF] dark:text-[#2DD4BF] flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'التحويل المتقدم' : 'Advanced Transform'}</span>
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-purple-100 dark:border-slate-650">
            {selectedLayer.type.toUpperCase()}
          </span>
        </div>
        <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
          {selectedLayer.name}
        </div>
      </div>

      {/* Action Commitment Controls (Apply / Cancel / Reset) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          id="btn-apply-transform"
          onClick={onApplyTransform}
          title={isAr ? 'تطبيق التحويل (Enter)' : 'Apply Transform (Enter)'}
          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#6C4DFF] hover:bg-[#5839EE] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all active:scale-98"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{isAr ? 'تطبيق (Enter)' : 'Apply (Enter)'}</span>
        </button>
        <button
          id="btn-cancel-transform"
          onClick={onCancelTransform}
          title={isAr ? 'إلغاء واستعادة الحالة السابقة (Esc)' : 'Cancel & Revert (Esc)'}
          className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-650 transition-all active:scale-98"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
          <span>{isAr ? 'إلغاء (Esc)' : 'Cancel (Esc)'}</span>
        </button>
      </div>

      {/* SECTION 1: Transform Origin / Pivot Point */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>{isAr ? 'نقطة الارتكاز (Pivot)' : 'Transform Origin / Pivot'}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {Math.round(pivotX * 100)}%, {Math.round(pivotY * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700">
          {/* 9-Point Visual Anchor Grid */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
            {pivotGrid.map((pt, idx) => {
              const active = isPivotMatch(pt.x, pt.y);
              return (
                <button
                  key={idx}
                  onClick={() => onUpdateTransform({ pivotX: pt.x, pivotY: pt.y })}
                  title={pt.label}
                  className={`w-3.5 h-3.5 rounded-xs transition-all flex items-center justify-center ${
                    active
                      ? 'bg-[#6C4DFF] dark:bg-[#2DD4BF] ring-1 ring-purple-300 scale-110 shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                />
              );
            })}
          </div>
          <div className="flex-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            {isAr
              ? 'تحدد المركز الذي يدور حوله العنصر ويتسع انطلاقاً منه.'
              : 'Defines the anchor point for rotation, scale, and skew.'}
          </div>
        </div>
      </div>

      {/* SECTION 2: Position (X & Y) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>{isAr ? 'الموضع في اللوحة' : 'Position'}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">px</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* X coordinate */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus-within:border-[#6C4DFF] transition-all">
            <span className="text-[11px] font-bold text-slate-400">X:</span>
            <input
              type="number"
              value={posX}
              onChange={(e) => onUpdateTransform({ x: Number(e.target.value) || 0 })}
              className="w-full bg-transparent text-xs font-mono text-slate-900 dark:text-white outline-none"
            />
          </div>
          {/* Y coordinate */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus-within:border-[#6C4DFF] transition-all">
            <span className="text-[11px] font-bold text-slate-400">Y:</span>
            <input
              type="number"
              value={posY}
              onChange={(e) => onUpdateTransform({ y: Number(e.target.value) || 0 })}
              className="w-full bg-transparent text-xs font-mono text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Dimensions (Width & Height) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>{isAr ? 'الأبعاد والأحجام' : 'Dimensions & Scale'}</span>
          <button
            onClick={() => setAspectLocked(!aspectLocked)}
            className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-bold transition-all ${
              aspectLocked
                ? 'bg-purple-100 dark:bg-purple-950/60 text-[#6C4DFF] dark:text-[#2DD4BF] border border-purple-200 dark:border-purple-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
            }`}
            title={
              aspectLocked
                ? isAr
                  ? 'النسبة مقفلة (تناسبي)'
                  : 'Aspect Ratio Locked (Proportional)'
                : isAr
                ? 'النسبة حرة (غير تناسبي)'
                : 'Aspect Ratio Unlocked (Free)'
            }
          >
            {aspectLocked ? <Link2 className="w-3 h-3" /> : <Unlink2 className="w-3 h-3" />}
            <span>{aspectLocked ? (isAr ? 'تناسبي' : 'Locked') : isAr ? 'حر' : 'Free'}</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* Width */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus-within:border-[#6C4DFF] transition-all">
            <span className="text-[11px] font-bold text-slate-400">W:</span>
            <input
              type="number"
              min="1"
              value={width}
              onChange={(e) => handleWidthChange(Number(e.target.value) || 1)}
              className="w-full bg-transparent text-xs font-mono text-slate-900 dark:text-white outline-none"
            />
            <span className="text-[10px] text-slate-400 font-mono">px</span>
          </div>
          {/* Height */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus-within:border-[#6C4DFF] transition-all">
            <span className="text-[11px] font-bold text-slate-400">H:</span>
            <input
              type="number"
              min="1"
              value={height}
              onChange={(e) => handleHeightChange(Number(e.target.value) || 1)}
              className="w-full bg-transparent text-xs font-mono text-slate-900 dark:text-white outline-none"
            />
            <span className="text-[10px] text-slate-400 font-mono">px</span>
          </div>
        </div>
      </div>

      {/* SECTION 4: Rotation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>{isAr ? 'زاوية التدوير' : 'Rotation'}</span>
          </span>
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5">
            <input
              type="number"
              value={rotation}
              onChange={(e) => onUpdateTransform({ rotation: Number(e.target.value) || 0 })}
              className="w-12 bg-transparent text-xs font-mono text-center text-slate-900 dark:text-white outline-none"
            />
            <span className="text-[10px] text-slate-400">°</span>
          </div>
        </div>

        {/* Rotation Slider */}
        <input
          type="range"
          min="-180"
          max="180"
          value={((((rotation + 180) % 360) + 360) % 360) - 180}
          onChange={(e) => onUpdateTransform({ rotation: Number(e.target.value) })}
          className="w-full accent-[#6C4DFF] cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
        />

        {/* Quick Rotation Buttons (0°, 90°, 180°, 270°) */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[0, 90, 180, 270].map((deg) => (
            <button
              key={deg}
              onClick={() => onUpdateTransform({ rotation: deg })}
              className={`py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                rotation % 360 === deg
                  ? 'bg-[#6C4DFF] text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {deg}°
            </button>
          ))}
        </div>

        {/* CCW & CW Step Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onUpdateTransform({ rotation: (((rotation - 90) % 360) + 360) % 360 })}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>-90°</span>
          </button>
          <button
            onClick={() => onUpdateTransform({ rotation: (rotation + 90) % 360 })}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>+90°</span>
          </button>
        </div>
      </div>

      {/* SECTION 5: Skew / Shear (الانحراف) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>{isAr ? 'الانحراف (Skew)' : 'Skew / Shear'}</span>
          </span>
          {(skewX !== 0 || skewY !== 0) && (
            <button
              onClick={() => onUpdateTransform({ skewX: 0, skewY: 0 })}
              className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-bold"
            >
              {isAr ? 'تصفير' : 'Reset'}
            </button>
          )}
        </div>

        {/* Skew X */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span>{isAr ? 'انحراف أفقي (Skew X)' : 'Horizontal Skew (X)'}</span>
            <span className="font-mono text-[10px] font-bold">{skewX}°</span>
          </div>
          <input
            type="range"
            min="-80"
            max="80"
            value={skewX}
            onChange={(e) => onUpdateTransform({ skewX: Number(e.target.value) })}
            className="w-full accent-[#6C4DFF] cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />
        </div>

        {/* Skew Y */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span>{isAr ? 'انحراف رأسي (Skew Y)' : 'Vertical Skew (Y)'}</span>
            <span className="font-mono text-[10px] font-bold">{skewY}°</span>
          </div>
          <input
            type="range"
            min="-80"
            max="80"
            value={skewY}
            onChange={(e) => onUpdateTransform({ skewY: Number(e.target.value) })}
            className="w-full accent-[#6C4DFF] cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />
        </div>
      </div>

      {/* SECTION 6: Flip / Negative Scale */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {isAr ? 'القلب الأفقي والرأسي' : 'Flip / Invert'}
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onUpdateTransform({ flipHorizontal: !selectedLayer.flipHorizontal })}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
              selectedLayer.flipHorizontal
                ? 'bg-purple-100 dark:bg-purple-950/60 text-[#6C4DFF] dark:text-[#2DD4BF] border-purple-300 dark:border-purple-700 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
            <span>{isAr ? 'قلب أفقي' : 'Flip Horiz'}</span>
          </button>
          <button
            onClick={() => onUpdateTransform({ flipVertical: !selectedLayer.flipVertical })}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
              selectedLayer.flipVertical
                ? 'bg-purple-100 dark:bg-purple-950/60 text-[#6C4DFF] dark:text-[#2DD4BF] border-purple-300 dark:border-purple-700 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FlipVertical className="w-4 h-4" />
            <span>{isAr ? 'قلب رأسي' : 'Flip Vert'}</span>
          </button>
        </div>
      </div>

      {/* Reset to Original Button */}
      <div className="pt-2">
        <button
          onClick={onResetTransform}
          title={isAr ? 'إعادة ضبط الموضع والحجم والتدوير' : 'Reset all transformations'}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{isAr ? 'استعادة الأبعاد الأصلية' : 'Reset All Transforms'}</span>
        </button>
      </div>
    </div>
  );
};
