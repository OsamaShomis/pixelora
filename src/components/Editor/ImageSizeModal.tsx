import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Maximize2,
  Lock,
  Unlock,
  Info,
  Layers,
  FileText,
  Check,
  ChevronDown,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Layer, BackgroundConfig, ResampleAlgorithm, DocumentResizeConfig } from '../../types';
import { renderCompositeCanvas } from '../../utils/compositeRenderer';
import {
  MAX_SAFE_IMAGE_DIMENSION,
  MAX_SAFE_MEGAPIXELS,
  WARNING_IMAGE_DIMENSION,
} from '../../utils/imageResizer';

type SizeUnit = 'px' | '%' | 'in' | 'cm' | 'mm';
type ResolutionUnit = 'ppi' | 'ppcm';

interface ImageSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasWidth: number;
  canvasHeight: number;
  resolution?: number; // default 72
  layers: Layer[];
  background: BackgroundConfig;
  onApplyImageSize: (config: DocumentResizeConfig) => Promise<void> | void;
  language: 'ar' | 'en';
}

export const ImageSizeModal: React.FC<ImageSizeModalProps> = ({
  isOpen,
  onClose,
  canvasWidth,
  canvasHeight,
  resolution = 72,
  layers,
  background,
  onApplyImageSize,
  language,
}) => {
  const isAr = language === 'ar';

  // Unit conversions relative to pixels at given PPI
  const currentPPI = resolution || 72;
  const [unit, setUnit] = useState<SizeUnit>('px');
  const [resolutionUnit, setResolutionUnit] = useState<ResolutionUnit>('ppi');

  // Input states in currently selected unit
  const [widthInput, setWidthInput] = useState<string>(canvasWidth.toString());
  const [heightInput, setHeightInput] = useState<string>(canvasHeight.toString());
  const [resInput, setResInput] = useState<string>(currentPPI.toString());

  // Numerical pixel values
  const [targetWidthPx, setTargetWidthPx] = useState<number>(canvasWidth);
  const [targetHeightPx, setTargetHeightPx] = useState<number>(canvasHeight);
  const [targetPPI, setTargetPPI] = useState<number>(currentPPI);

  // Settings
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
  const [resample, setResample] = useState<boolean>(true);
  const [resamplingMethod, setResamplingMethod] = useState<ResampleAlgorithm>('automatic');
  const [scaleLayerStyles, setScaleLayerStyles] = useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  // Preview thumbnail
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  // Original aspect ratio
  const origAspectRatio = useMemo(() => {
    return canvasWidth / Math.max(1, canvasHeight);
  }, [canvasWidth, canvasHeight]);

  // Convert pixels to current unit
  const pxToUnit = (px: number, u: SizeUnit, ppi: number): number => {
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
  const unitToPx = (val: number, u: SizeUnit, ppi: number, isWidth: boolean): number => {
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

  // Synchronize inputs when modal opens or canvas dimensions change
  useEffect(() => {
    if (isOpen) {
      setTargetWidthPx(canvasWidth);
      setTargetHeightPx(canvasHeight);
      setTargetPPI(resolution || 72);
      setWidthInput(pxToUnit(canvasWidth, unit, resolution || 72).toString());
      setHeightInput(pxToUnit(canvasHeight, unit, resolution || 72).toString());
      setResInput((resolution || 72).toString());
      setIsApplying(false);

      // Generate preview thumbnail
      (async () => {
        try {
          const maxDim = 480;
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
          console.warn('Failed to render preview canvas for ImageSizeModal:', e);
        }
      })();
    }
  }, [isOpen, canvasWidth, canvasHeight, resolution, unit]);

  // Handle Width change
  const handleWidthChange = (valStr: string) => {
    setWidthInput(valStr);
    const num = parseFloat(valStr);
    if (isNaN(num) || num <= 0) return;

    const newPxW = Math.max(1, Math.min(MAX_SAFE_IMAGE_DIMENSION, unitToPx(num, unit, targetPPI, true)));
    setTargetWidthPx(newPxW);

    if (keepAspectRatio) {
      const newPxH = Math.max(1, Math.min(MAX_SAFE_IMAGE_DIMENSION, Math.round(newPxW / origAspectRatio)));
      setTargetHeightPx(newPxH);
      setHeightInput(pxToUnit(newPxH, unit, targetPPI).toString());
    }
  };

  // Handle Height change
  const handleHeightChange = (valStr: string) => {
    setHeightInput(valStr);
    const num = parseFloat(valStr);
    if (isNaN(num) || num <= 0) return;

    const newPxH = Math.max(1, Math.min(MAX_SAFE_IMAGE_DIMENSION, unitToPx(num, unit, targetPPI, false)));
    setTargetHeightPx(newPxH);

    if (keepAspectRatio) {
      const newPxW = Math.max(1, Math.min(MAX_SAFE_IMAGE_DIMENSION, Math.round(newPxH * origAspectRatio)));
      setTargetWidthPx(newPxW);
      setWidthInput(pxToUnit(newPxW, unit, targetPPI).toString());
    }
  };

  // Handle Unit change
  const handleUnitChange = (newUnit: SizeUnit) => {
    setUnit(newUnit);
    setWidthInput(pxToUnit(targetWidthPx, newUnit, targetPPI).toString());
    setHeightInput(pxToUnit(targetHeightPx, newUnit, targetPPI).toString());
  };

  // Handle Resolution change
  const handleResolutionChange = (valStr: string) => {
    setResInput(valStr);
    const num = parseFloat(valStr);
    if (isNaN(num) || num <= 0) return;

    const actualPPI = resolutionUnit === 'ppcm' ? Math.round(num * 2.54) : Math.round(num);
    setTargetPPI(actualPPI);

    if (!resample) {
      // When Resample is disabled, pixel dimensions remain identical, physical units update
      if (unit !== 'px' && unit !== '%') {
        setWidthInput(pxToUnit(targetWidthPx, unit, actualPPI).toString());
        setHeightInput(pxToUnit(targetHeightPx, unit, actualPPI).toString());
      }
    }
  };

  // Current Megapixels
  const currentMP = ((canvasWidth * canvasHeight) / 1_000_000).toFixed(1);
  const targetMP = ((targetWidthPx * targetHeightPx) / 1_000_000).toFixed(1);

  // Approximate file size calculation (RGBA uncompressed estimate * compression factor)
  const estimatedMB = useMemo(() => {
    const bytes = targetWidthPx * targetHeightPx * 2.2;
    return (bytes / (1024 * 1024)).toFixed(1);
  }, [targetWidthPx, targetHeightPx]);

  const handleApply = async () => {
    if (isApplying) return;
    setIsApplying(true);
    try {
      await onApplyImageSize({
        targetWidth: targetWidthPx,
        targetHeight: targetHeightPx,
        resample,
        algorithm: resamplingMethod,
        resolution: targetPPI,
        scaleLayerStyles,
      });
      onClose();
    } catch (err) {
      console.error('Failed to apply image size:', err);
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
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isAr ? 'حجم الصورة / Image Size' : 'Image Size / حجم الصورة'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'تغيير أبعاد المستند الفعلية وعدد البكسلات'
                  : 'Change document pixel dimensions and resolution'}
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
            {/* Section: Pixel Dimensions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isAr ? 'أبعاد البكسل' : 'Pixel Dimensions'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-purple-50 dark:bg-purple-950/50 text-[#6338E8] dark:text-purple-300 font-mono">
                  {targetWidthPx} × {targetHeightPx} px
                </span>
              </div>

              {/* Dimensions Box with linked ratio */}
              <div className="relative p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                {/* Width row */}
                <div className="flex items-center gap-3">
                  <label className="w-20 text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0">
                    {isAr ? '(W) العرض:' : '(W) Width:'}
                  </label>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      disabled={!resample && (unit === 'px' || unit === '%')}
                      value={widthInput}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#6338E8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {isAr ? '(H) الإرتفاع:' : '(H) Height:'}
                  </label>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      disabled={!resample && (unit === 'px' || unit === '%')}
                      value={heightInput}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#6338E8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                {/* Aspect Ratio Lock Toggle */}
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
                  <button
                    type="button"
                    onClick={() => setKeepAspectRatio(!keepAspectRatio)}
                    className="p-1 rounded-md text-slate-500 hover:text-[#6338E8] transition-colors"
                    title={isAr ? 'قفل / فك قفل النسبة' : 'Lock / Unlock Ratio'}
                  >
                    {keepAspectRatio ? (
                      <Lock className="w-3.5 h-3.5 text-[#6338E8]" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Resolution Section */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center gap-3">
                <label className="w-20 text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0">
                  {isAr ? 'الدقة (Resolution):' : 'Resolution:'}
                </label>
                <div className="flex-1">
                  <input
                    type="number"
                    value={resInput}
                    onChange={(e) => handleResolutionChange(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-[#6338E8]"
                  />
                </div>
                <select
                  value={resolutionUnit}
                  onChange={(e) => setResolutionUnit(e.target.value as ResolutionUnit)}
                  className="w-20 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#6338E8]"
                >
                  <option value="ppi">PPI</option>
                  <option value="ppcm">PPCM</option>
                </select>
              </div>

              {/* Resample Checkbox */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-800 dark:text-slate-200 font-bold">
                  <input
                    type="checkbox"
                    checked={resample}
                    onChange={(e) => setResample(e.target.checked)}
                    className="w-4 h-4 rounded text-[#6338E8] focus:ring-purple-500 accent-[#6338E8]"
                  />
                  <span>{isAr ? 'إعادة أخذ العينات (Resample)' : 'Resample Image Pixels'}</span>
                </label>
                <div
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help"
                  title={
                    isAr
                      ? 'عند التفعيل، يتم تغيير عدد البكسلات الفعلي في الصورة. عند الإلغاء، تتغير أبعاد الطباعة الفيزيائية فقط دون المساس بالبكسلات.'
                      : 'When checked, changes the actual number of pixels. When unchecked, changes physical print size only.'
                  }
                >
                  <Info className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Resampling Method Dropdown */}
              {resample && (
                <div className="pt-2 space-y-1.5 animate-in fade-in duration-150">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {isAr ? 'طريقة إعادة التحجيم (Interpolation):' : 'Resampling Method:'}
                  </label>
                  <select
                    value={resamplingMethod}
                    onChange={(e) => setResamplingMethod(e.target.value as ResampleAlgorithm)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#6338E8]"
                  >
                    <option value="automatic">
                      {isAr ? 'Automatic (تلقائي ذكي)' : 'Automatic (Smart choice)'}
                    </option>
                    <option value="bicubic">
                      {isAr ? 'Bicubic (تكعيبي مزدوج - تدرجات ناعمة)' : 'Bicubic (Smooth gradients)'}
                    </option>
                    <option value="bicubic_sharper">
                      {isAr ? 'Bicubic Sharper (تكعيبي أنعم مع حدة - مثالي للتصغير)' : 'Bicubic Sharper (Reduction)'}
                    </option>
                    <option value="bicubic_smoother">
                      {isAr ? 'Bicubic Smoother (تكعيبي أملس - مثالي للتكبير)' : 'Bicubic Smoother (Enlargement)'}
                    </option>
                    <option value="bilinear">
                      {isAr ? 'Bilinear (ثنائي خطي)' : 'Bilinear'}
                    </option>
                    <option value="nearest">
                      {isAr ? 'Nearest Neighbor (أقرب جار - للمحافظة على الحواف الحادة وفن البكسل)' : 'Nearest Neighbor (Hard edges / Pixel art)'}
                    </option>
                  </select>
                </div>
              )}
            </div>

            {/* Advanced Settings Collapsible */}
            <div className="border border-slate-200 dark:border-slate-700/80 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-[#6338E8]" />
                  <span>{isAr ? 'إعدادات متقدمة' : 'Advanced Settings'}</span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    showAdvanced ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showAdvanced && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700/60 space-y-2.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={scaleLayerStyles}
                      onChange={(e) => setScaleLayerStyles(e.target.checked)}
                      className="w-4 h-4 rounded text-[#6338E8] focus:ring-purple-500 accent-[#6338E8]"
                    />
                    <span>
                      {isAr
                        ? 'تحجيم أنماط الطبقات وأحجام الخطوط نسبياً'
                        : 'Scale layer styles and font sizes proportionally'}
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Info note box */}
            <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 flex items-start gap-2.5 text-xs text-purple-900 dark:text-purple-200">
              <Sparkles className="w-4 h-4 text-[#6338E8] shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'تغيير حجم الصورة (Image Size) يغيّر عدد البكسلات الفعلي للصورة وللمستند بأكمله، وليس مجرد تكبير أو تصغير للعرض.'
                  : 'Image Size alters the actual pixel count and coordinate system of the document, not just viewport zoom.'}
              </span>
            </div>
          </div>

          {/* Right Column: Live Preview & Details (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Live Preview Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col items-center">
              <div className="w-full aspect-16/10 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-900 flex items-center justify-center border border-slate-300 dark:border-slate-700 relative">
                {previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt="Document preview"
                    className="max-w-full max-h-full object-contain shadow-xs"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Layers className="w-8 h-8 opacity-40 animate-pulse" />
                    <span className="text-xs">{isAr ? 'جاري تجهيز المعاينة...' : 'Generating preview...'}</span>
                  </div>
                )}
              </div>

              {/* Status Comparison Table */}
              <div className="w-full mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">{isAr ? 'الحجم الحالي:' : 'Current Size:'}</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {canvasWidth} × {canvasHeight} px ({currentMP} MP)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isAr ? 'الحجم الجديد:' : 'New Size:'}</span>
                  <span className="font-mono font-bold text-[#6338E8] dark:text-purple-400">
                    {targetWidthPx} × {targetHeightPx} px ({targetMP} MP)
                  </span>
                </div>
              </div>
            </div>

            {/* Estimated File Size Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <FileText className="w-4 h-4 text-[#6338E8]" />
                <span>{isAr ? 'حجم الملف التقريبي:' : 'Estimated File Size:'}</span>
              </div>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                ~{estimatedMB} MB
              </span>
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
