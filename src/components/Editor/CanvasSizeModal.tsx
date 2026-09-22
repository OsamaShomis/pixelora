import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Crop,
  Lock,
  Unlock,
  Info,
  Layers,
  Check,
  ArrowUpLeft,
  ArrowUp,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  ArrowDownLeft,
  ArrowDown,
  ArrowDownRight,
  Circle,
  Maximize,
  Frame,
} from 'lucide-react';
import { CanvasAnchorPosition, CanvasResizeConfig, Layer, BackgroundConfig } from '../../types';
import { renderCompositeCanvas } from '../../utils/compositeRenderer';
import { MAX_SAFE_IMAGE_DIMENSION } from '../../utils/imageResizer';

type SizeUnit = 'px' | '%' | 'in' | 'cm' | 'mm';

interface CanvasSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasWidth: number;
  canvasHeight: number;
  resolution?: number;
  layers: Layer[];
  background: BackgroundConfig;
  onApplyCanvasSize: (config: CanvasResizeConfig) => Promise<void> | void;
  language: 'ar' | 'en';
}

export const CanvasSizeModal: React.FC<CanvasSizeModalProps> = ({
  isOpen,
  onClose,
  canvasWidth,
  canvasHeight,
  resolution = 72,
  layers,
  background,
  onApplyCanvasSize,
  language,
}) => {
  const isAr = language === 'ar';
  const ppi = resolution || 72;

  // Unit conversions
  const [unit, setUnit] = useState<SizeUnit>('px');

  // Input states in current unit
  const [widthInput, setWidthInput] = useState<string>(canvasWidth.toString());
  const [heightInput, setHeightInput] = useState<string>(canvasHeight.toString());

  // Numerical pixel values
  const [targetWidthPx, setTargetWidthPx] = useState<number>(canvasWidth);
  const [targetHeightPx, setTargetHeightPx] = useState<number>(canvasHeight);

  // Keep aspect ratio
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(false);

  // 9-point Anchor Position
  const [anchor, setAnchor] = useState<CanvasAnchorPosition>('center');

  // Canvas Background selection
  const [bgType, setBgType] = useState<'solid' | 'transparent'>('solid');
  const [bgColor, setBgColor] = useState<string>(
    background.type === 'solid' && background.color ? background.color : '#F1F5F9'
  );

  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const origAspectRatio = useMemo(() => {
    return canvasWidth / Math.max(1, canvasHeight);
  }, [canvasWidth, canvasHeight]);

  // Convert pixels to current unit
  const pxToUnit = (px: number, u: SizeUnit): number => {
    switch (u) {
      case 'px':
        return Math.round(px);
      case '%':
        return Number(((px / canvasWidth) * 100).toFixed(1));
      case 'in':
        return Number((px / ppi).toFixed(2));
      case 'cm':
        return Number(((px / ppi) * 2.54).toFixed(2));
      case 'mm':
        return Number(((px / ppi) * 25.4).toFixed(1));
    }
  };

  // Convert current unit to pixels
  const unitToPx = (val: number, u: SizeUnit, isWidth: boolean): number => {
    switch (u) {
      case 'px':
        return Math.round(val);
      case '%': {
        const base = isWidth ? canvasWidth : canvasHeight;
        return Math.round((val / 100) * base);
      }
      case 'in':
        return Math.round(val * ppi);
      case 'cm':
        return Math.round((val / 2.54) * ppi);
      case 'mm':
        return Math.round((val / 25.4) * ppi);
    }
  };

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTargetWidthPx(canvasWidth);
      setTargetHeightPx(canvasHeight);
      setWidthInput(pxToUnit(canvasWidth, unit).toString());
      setHeightInput(pxToUnit(canvasHeight, unit).toString());
      setAnchor('center');
      if (background.type === 'transparent') {
        setBgType('transparent');
      } else {
        setBgType('solid');
        setBgColor(background.color || '#F1F5F9');
      }
      setIsApplying(false);

      // Render fast thumbnail of existing composition
      (async () => {
        try {
          const maxDim = 400;
          let previewW = canvasWidth;
          let previewH = canvasHeight;
          if (previewW > maxDim || previewH > maxDim) {
            if (previewW > previewH) {
              previewH = Math.round((previewH * maxDim) / previewW);
              previewW = maxDim;
            } else {
              previewW = Math.round((previewW * maxDim) / previewH);
              previewH = maxDim;
            }
          }
          const canvas = await renderCompositeCanvas(layers, background, canvasWidth, canvasHeight, previewW, previewH);
          setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.85));
        } catch (e) {
          console.warn('Failed to render preview for CanvasSizeModal:', e);
        }
      })();
    }
  }, [isOpen, canvasWidth, canvasHeight, background, unit]);

  // Handle Width change
  const handleWidthChange = (valStr: string) => {
    setWidthInput(valStr);
    const num = parseFloat(valStr);
    if (isNaN(num) || num <= 0) return;

    const newPxW = Math.max(1, Math.min(MAX_SAFE_IMAGE_DIMENSION, unitToPx(num, unit, true)));
    setTargetWidthPx(newPxW);

    if (keepAspectRatio) {
      const newPxH = Math.max(1, Math.min(MAX_SAFE_IMAGE_DIMENSION, Math.round(newPxW / origAspectRatio)));
      setTargetHeightPx(newPxH);
      setHeightInput(pxToUnit(newPxH, unit).toString());
    }
  };

  // Handle Height change
  const handleHeightChange = (valStr: string) => {
    setHeightInput(valStr);
    const num = parseFloat(valStr);
    if (isNaN(num) || num <= 0) return;

    const newPxH = Math.max(1, Math.min(MAX_SAFE_IMAGE_DIMENSION, unitToPx(num, unit, false)));
    setTargetHeightPx(newPxH);

    if (keepAspectRatio) {
      const newPxW = Math.max(1, Math.min(MAX_SAFE_IMAGE_DIMENSION, Math.round(newPxH * origAspectRatio)));
      setTargetWidthPx(newPxW);
      setWidthInput(pxToUnit(newPxW, unit).toString());
    }
  };

  // Handle Unit change
  const handleUnitChange = (newUnit: SizeUnit) => {
    setUnit(newUnit);
    setWidthInput(pxToUnit(targetWidthPx, newUnit).toString());
    setHeightInput(pxToUnit(targetHeightPx, newUnit).toString());
  };

  // Dynamic Anchor Description Text
  const anchorDescription = useMemo(() => {
    if (isAr) {
      switch (anchor) {
        case 'center':
          return 'الموضع المحدد: ستبقى الصورة في المنتصف مع توسيع أو تقليص اللوحة بالتساوي من جميع الجهات.';
        case 'top_left':
          return 'الموضع المحدد: ستبقى الصورة في الزاوية العلوية اليسرى مع التوسيع نحو اليمين والأسفل.';
        case 'top':
          return 'الموضع المحدد: ستبقى الصورة في الأعلى والوسط مع التوسيع أفقياً ونحو الأسفل.';
        case 'top_right':
          return 'الموضع المحدد: ستبقى الصورة في الزاوية العلوية اليمنى مع التوسيع نحو اليسار والأسفل.';
        case 'left':
          return 'الموضع المحدد: ستبقى الصورة في المنتصف الأيسر مع التوسيع رأسياً ونحو اليمين.';
        case 'right':
          return 'الموضع المحدد: ستبقى الصورة في المنتصف الأيمن مع التوسيع رأسياً ونحو اليسار.';
        case 'bottom_left':
          return 'الموضع المحدد: ستبقى الصورة في الزاوية السفلية اليسرى مع التوسيع نحو الأعلى واليمين.';
        case 'bottom':
          return 'الموضع المحدد: ستبقى الصورة في الأسفل والوسط مع التوسيع أفقياً ونحو الأعلى.';
        case 'bottom_right':
          return 'الموضع المحدد: ستبقى الصورة في الزاوية السفلية اليمنى مع التوسيع نحو الأعلى واليسار.';
      }
    } else {
      switch (anchor) {
        case 'center':
          return 'Selected: Content remains centered; canvas extends or crops equally on all sides.';
        case 'top_left':
          return 'Selected: Anchored at Top-Left; canvas extends toward bottom and right.';
        case 'top':
          return 'Selected: Anchored at Top-Center; canvas extends horizontally and downward.';
        case 'top_right':
          return 'Selected: Anchored at Top-Right; canvas extends toward bottom and left.';
        case 'left':
          return 'Selected: Anchored at Center-Left; canvas extends vertically and to the right.';
        case 'right':
          return 'Selected: Anchored at Center-Right; canvas extends vertically and to the left.';
        case 'bottom_left':
          return 'Selected: Anchored at Bottom-Left; canvas extends upward and to the right.';
        case 'bottom':
          return 'Selected: Anchored at Bottom-Center; canvas extends horizontally and upward.';
        case 'bottom_right':
          return 'Selected: Anchored at Bottom-Right; canvas extends upward and to the left.';
      }
    }
  }, [anchor, isAr]);

  // Dimension Differences
  const diffW = targetWidthPx - canvasWidth;
  const diffH = targetHeightPx - canvasHeight;

  // Megapixels
  const currentMP = ((canvasWidth * canvasHeight) / 1_000_000).toFixed(1);
  const targetMP = ((targetWidthPx * targetHeightPx) / 1_000_000).toFixed(1);

  // Position ratios for preview visual box
  const previewAlignment = useMemo(() => {
    let justify = 'justify-center';
    let items = 'items-center';

    if (anchor.includes('top')) items = 'items-start';
    if (anchor.includes('bottom')) items = 'items-end';
    if (anchor.includes('left')) justify = 'justify-start';
    if (anchor.includes('right')) justify = 'justify-end';

    return `${items} ${justify}`;
  }, [anchor]);

  const handleApply = async () => {
    if (isApplying) return;
    const w = Math.round(Number(targetWidthPx));
    const h = Math.round(Number(targetHeightPx));
    if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0) {
      return;
    }
    setIsApplying(true);
    try {
      await onApplyCanvasSize({
        targetWidth: w,
        targetHeight: h,
        anchor,
        background: {
          type: bgType,
          color: bgType === 'solid' ? bgColor : undefined,
        },
      });
      onClose();
    } catch (err) {
      console.error('Failed to apply canvas size:', err);
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-[#6338E8] dark:text-[#a78bfa] flex items-center justify-center shadow-xs">
              <Frame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isAr ? 'حجم اللوحة / Canvas Size' : 'Canvas Size / حجم اللوحة'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'تعديل مساحة اللوحة المحيطة بالصورة دون تحجيم البكسلات'
                  : 'Adjust canvas bounds and margins without resampling image pixels'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: 2 Columns */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Current Canvas Badge */}
            <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-slate-800/80 border border-purple-100 dark:border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#6338E8]" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {isAr ? 'الحجم الحالي للوحة:' : 'Current Canvas Size:'}
                </span>
              </div>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {canvasWidth} × {canvasHeight} px ({currentMP} MP)
              </span>
            </div>

            {/* Section: New Canvas Size */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isAr ? 'الحجم الجديد للوحة' : 'New Canvas Size'}
              </div>

              {/* Width row */}
              <div className="flex items-center gap-3">
                <label className="w-20 text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0">
                  {isAr ? 'العرض:' : 'Width:'}
                </label>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={widthInput}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#6338E8] transition-colors"
                  />
                </div>
                <select
                  value={unit}
                  onChange={(e) => handleUnitChange(e.target.value as SizeUnit)}
                  className="w-20 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#6338E8]"
                >
                  <option value="px">px</option>
                  <option value="%">%</option>
                  <option value="in">in</option>
                  <option value="cm">cm</option>
                  <option value="mm">mm</option>
                </select>
              </div>

              {/* Height row */}
              <div className="flex items-center gap-3">
                <label className="w-20 text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0">
                  {isAr ? 'الارتفاع:' : 'Height:'}
                </label>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    value={heightInput}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#6338E8] transition-colors"
                  />
                </div>
                <select
                  value={unit}
                  onChange={(e) => handleUnitChange(e.target.value as SizeUnit)}
                  className="w-20 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#6338E8]"
                >
                  <option value="px">px</option>
                  <option value="%">%</option>
                  <option value="in">in</option>
                  <option value="cm">cm</option>
                  <option value="mm">mm</option>
                </select>
              </div>

              {/* Aspect Ratio Lock */}
              <div className="pt-1 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/50 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={keepAspectRatio}
                    onChange={(e) => setKeepAspectRatio(e.target.checked)}
                    className="w-4 h-4 rounded text-[#6338E8] focus:ring-purple-500 accent-[#6338E8]"
                  />
                  <span>{isAr ? 'الحفاظ على نسبة الأبعاد' : 'Lock Aspect Ratio'}</span>
                </label>
                {keepAspectRatio ? (
                  <Lock className="w-3.5 h-3.5 text-[#6338E8]" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </div>

            {/* Section: Anchor Grid (موضع الصورة داخل اللوحة) */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isAr ? 'موضع الصورة داخل اللوحة (Anchor):' : 'Image Position (Anchor):'}
                </span>
                <div
                  className="text-slate-400 hover:text-slate-600 cursor-help"
                  title={
                    isAr
                      ? 'حدد نقطة ارتكاز الصورة الحالية لتحديد اتجاه إضافة أو اقتطاع مساحة اللوحة.'
                      : 'Choose where the existing content stays anchored as canvas expands or contracts.'
                  }
                >
                  <Info className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 3x3 Anchor Grid */}
              <div className="flex items-center gap-6">
                <div className="grid grid-cols-3 gap-1.5 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 w-36 h-36">
                  {/* Row 1 */}
                  <button
                    type="button"
                    onClick={() => setAnchor('top_left')}
                    className={`rounded-lg flex items-center justify-center transition-all ${
                      anchor === 'top_left'
                        ? 'bg-[#6338E8] text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50 hover:text-[#6338E8]'
                    }`}
                  >
                    <ArrowUpLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnchor('top')}
                    className={`rounded-lg flex items-center justify-center transition-all ${
                      anchor === 'top'
                        ? 'bg-[#6338E8] text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50 hover:text-[#6338E8]'
                    }`}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnchor('top_right')}
                    className={`rounded-lg flex items-center justify-center transition-all ${
                      anchor === 'top_right'
                        ? 'bg-[#6338E8] text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50 hover:text-[#6338E8]'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  {/* Row 2 */}
                  <button
                    type="button"
                    onClick={() => setAnchor('left')}
                    className={`rounded-lg flex items-center justify-center transition-all ${
                      anchor === 'left'
                        ? 'bg-[#6338E8] text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50 hover:text-[#6338E8]'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnchor('center')}
                    className={`rounded-lg flex items-center justify-center transition-all ${
                      anchor === 'center'
                        ? 'bg-[#6338E8] text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50 hover:text-[#6338E8]'
                    }`}
                  >
                    <Circle className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnchor('right')}
                    className={`rounded-lg flex items-center justify-center transition-all ${
                      anchor === 'right'
                        ? 'bg-[#6338E8] text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50 hover:text-[#6338E8]'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Row 3 */}
                  <button
                    type="button"
                    onClick={() => setAnchor('bottom_left')}
                    className={`rounded-lg flex items-center justify-center transition-all ${
                      anchor === 'bottom_left'
                        ? 'bg-[#6338E8] text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50 hover:text-[#6338E8]'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnchor('bottom')}
                    className={`rounded-lg flex items-center justify-center transition-all ${
                      anchor === 'bottom'
                        ? 'bg-[#6338E8] text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50 hover:text-[#6338E8]'
                    }`}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnchor('bottom_right')}
                    className={`rounded-lg flex items-center justify-center transition-all ${
                      anchor === 'bottom_right'
                        ? 'bg-[#6338E8] text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-50 hover:text-[#6338E8]'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <p>{anchorDescription}</p>
                </div>
              </div>
            </div>

            {/* Section: Canvas Background (لون الخلفية) */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isAr ? 'لون الخلفية (Canvas Background)' : 'Canvas Background'}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Color input swatch */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <input
                    type="color"
                    disabled={bgType === 'transparent'}
                    value={bgColor}
                    onChange={(e) => {
                      setBgType('solid');
                      setBgColor(e.target.value);
                    }}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    disabled={bgType === 'transparent'}
                    value={bgType === 'transparent' ? (isAr ? 'شفاف' : 'Transparent') : bgColor}
                    onChange={(e) => {
                      setBgType('solid');
                      setBgColor(e.target.value);
                    }}
                    className="w-20 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  />
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setBgType('solid');
                      setBgColor('#FFFFFF');
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
                      bgType === 'solid' && bgColor.toUpperCase() === '#FFFFFF'
                        ? 'border-[#6338E8] text-[#6338E8] bg-purple-50 dark:bg-purple-950/40'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {isAr ? 'أبيض' : 'White'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBgType('solid');
                      setBgColor('#F1F5F9');
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
                      bgType === 'solid' && bgColor.toUpperCase() === '#F1F5F9'
                        ? 'border-[#6338E8] text-[#6338E8] bg-purple-50 dark:bg-purple-950/40'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    #F1F5F9
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBgType('solid');
                      setBgColor('#1E293B');
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
                      bgType === 'solid' && bgColor.toUpperCase() === '#1E293B'
                        ? 'border-[#6338E8] text-[#6338E8] bg-purple-50 dark:bg-purple-950/40'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {isAr ? 'داكن' : 'Dark'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgType('transparent')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all flex items-center gap-1 ${
                      bgType === 'transparent'
                        ? 'border-[#6338E8] text-[#6338E8] bg-purple-50 dark:bg-purple-950/40'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-xs bg-[conic-gradient(#cbd5e1_90deg,#94a3b8_90deg_180deg,#cbd5e1_180deg_270deg,#94a3b8_270deg)] bg-[length:6px_6px] inline-block border border-slate-300" />
                    <span>{isAr ? 'شفاف' : 'Transparent'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'ملاحظة: تغيير حجم اللوحة لا يؤثر على أبعاد أو دقة الصورة الأصلية، بل يضيف مساحة إضافية حولها أو يقتطع من أطرافها.'
                  : 'Notice: Canvas Size does not modify original layer pixel content or scale, but adds margins or crops canvas bounds.'}
              </span>
            </div>
          </div>

          {/* Right Column: Live Visual Layout (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Visual Canvas Layout representation */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col items-center">
              {/* Simulated Canvas Box */}
              <div
                className="w-full aspect-16/10 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 p-2 flex relative"
                style={{
                  backgroundColor: bgType === 'solid' ? bgColor : '#ffffff',
                  backgroundImage:
                    bgType === 'transparent'
                      ? 'conic-gradient(#e2e8f0 90deg, #cbd5e1 90deg 180deg, #e2e8f0 180deg 270deg, #cbd5e1 270deg)'
                      : undefined,
                  backgroundSize: '12px 12px',
                }}
              >
                <div className={`w-full h-full flex ${previewAlignment}`}>
                  {/* Existing content representation box */}
                  <div
                    className="relative rounded-sm shadow-md border border-purple-400/80 bg-white overflow-hidden flex items-center justify-center transition-all duration-200"
                    style={{
                      width: `${Math.min(100, Math.max(20, (canvasWidth / targetWidthPx) * 100))}%`,
                      height: `${Math.min(100, Math.max(20, (canvasHeight / targetHeightPx) * 100))}%`,
                    }}
                  >
                    {previewDataUrl ? (
                      <img
                        src={previewDataUrl}
                        alt="Current Canvas"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-[10px] text-slate-400 font-mono">Original</div>
                    )}
                    <div className="absolute inset-0 ring-1 ring-inset ring-purple-600/50 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Status Details */}
              <div className="w-full mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">{isAr ? 'حجم الصورة الأصلي:' : 'Original Image:'}</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {canvasWidth} × {canvasHeight} px
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isAr ? 'حجم اللوحة الجديد:' : 'New Canvas Size:'}</span>
                  <span className="font-mono font-bold text-[#6338E8] dark:text-purple-400">
                    {targetWidthPx} × {targetHeightPx} px
                  </span>
                </div>
              </div>

              {/* Difference Banner */}
              <div className="w-full mt-3 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 text-center text-xs font-medium">
                {diffW >= 0 && diffH >= 0 ? (
                  <span>
                    {isAr
                      ? `سيتم إضافة مساحة فارغة حول الصورة بحجم +${diffW} × +${diffH} px`
                      : `Canvas will expand with +${diffW} × +${diffH} px margin`}
                  </span>
                ) : (
                  <span>
                    {isAr
                      ? `سيتم اقتطاع مساحة من اللوحة بحجم ${Math.abs(diffW)} × ${Math.abs(diffH)} px`
                      : `Canvas will crop by ${Math.abs(diffW)} × ${Math.abs(diffH)} px`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isApplying}
            className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-[#6338E8] hover:bg-[#5229d6] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isApplying ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isAr ? 'جاري التطبيق...' : 'Applying...'}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isAr ? 'تطبيق' : 'Apply'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
