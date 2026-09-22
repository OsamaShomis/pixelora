import React, { useState, useEffect } from 'react';
import {
  X,
  Maximize2,
  Lock,
  Unlock,
  Sparkles,
  AlertTriangle,
  Check,
  Cpu,
  Layers,
  Info,
  RefreshCw,
  Sliders,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Layer, ResampleAlgorithm, ImageResizeConfig, ResampleResult } from '../../types';
import {
  getImageBitmapDimensions,
  resampleImageBitmap,
  ImageBitmapInfo,
  RESOLUTION_PRESETS,
  PERCENTAGE_PRESETS,
  MAX_SAFE_IMAGE_DIMENSION,
  MAX_SAFE_MEGAPIXELS,
  WARNING_IMAGE_DIMENSION,
  WARNING_MEGAPIXELS,
} from '../../utils/imageResizer';

interface ImageResizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  layer: Layer | null;
  canvasWidth: number;
  canvasHeight: number;
  onApplyResize: (layerId: string, result: ResampleResult, config: ImageResizeConfig) => void;
  language: 'ar' | 'en';
}

export const ImageResizeModal: React.FC<ImageResizeModalProps> = ({
  isOpen,
  onClose,
  layer,
  canvasWidth,
  canvasHeight,
  onApplyResize,
  language,
}) => {
  const isAr = language === 'ar';

  // Original bitmap info
  const [originalInfo, setOriginalInfo] = useState<ImageBitmapInfo | null>(null);
  const [isLoadingOriginal, setIsLoadingOriginal] = useState(true);

  // Resize form states
  const [mode, setMode] = useState<'pixels' | 'percent'>('pixels');
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [percentScale, setPercentScale] = useState<number>(100);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
  const [algorithm, setAlgorithm] = useState<ResampleAlgorithm>('bicubic');
  const [updateDisplayBounds, setUpdateDisplayBounds] = useState<
    'match_pixels' | 'keep_canvas_size'
  >('match_pixels');
  const [resizeCanvasToFit, setResizeCanvasToFit] = useState<boolean>(true);

  // Processing state & error
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch real intrinsic bitmap dimensions when modal opens or layer source changes
  useEffect(() => {
    if (!isOpen || !layer?.source) return;
    let isCancelled = false;
    setIsLoadingOriginal(true);
    setErrorMessage(null);

    getImageBitmapDimensions(layer.source)
      .then((info) => {
        if (!isCancelled) {
          setOriginalInfo(info);
          setTargetWidth(info.width);
          setTargetHeight(info.height);
          setPercentScale(100);
          setIsLoadingOriginal(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error('Failed to load image bitmap dimensions:', err);
          // Fallback to layer display width/height if inspection failed
          const fallbackW = layer.bitmapWidth || Math.round(layer.width);
          const fallbackH = layer.bitmapHeight || Math.round(layer.height);
          const fallbackInfo: ImageBitmapInfo = {
            width: fallbackW,
            height: fallbackH,
            megapixels: Number(((fallbackW * fallbackH) / 1_000_000).toFixed(2)),
            aspectRatio: fallbackW / fallbackH,
            aspectRatioStr: `${fallbackW}:${fallbackH}`,
            byteSize: 0,
          };
          setOriginalInfo(fallbackInfo);
          setTargetWidth(fallbackW);
          setTargetHeight(fallbackH);
          setIsLoadingOriginal(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, layer?.source, layer?.id]);

  if (!isOpen || !layer || !layer.source) return null;

  // Width change handler
  const handleWidthChange = (newW: number) => {
    setErrorMessage(null);
    setTargetWidth(newW);

    if (keepAspectRatio && originalInfo && originalInfo.width > 0 && newW > 0) {
      const calculatedH = Math.round((newW / originalInfo.width) * originalInfo.height);
      setTargetHeight(calculatedH);
      setPercentScale(Math.round((newW / originalInfo.width) * 100));
    }
  };

  // Height change handler
  const handleHeightChange = (newH: number) => {
    setErrorMessage(null);
    setTargetHeight(newH);

    if (keepAspectRatio && originalInfo && originalInfo.height > 0 && newH > 0) {
      const calculatedW = Math.round((newH / originalInfo.height) * originalInfo.width);
      setTargetWidth(calculatedW);
      setPercentScale(Math.round((newH / originalInfo.height) * 100));
    }
  };

  // Percent change handler
  const handlePercentChange = (pct: number) => {
    setErrorMessage(null);
    const validPct = Math.max(1, Math.min(1000, Math.round(pct)));
    setPercentScale(validPct);

    if (originalInfo) {
      const newW = Math.max(1, Math.round((originalInfo.width * validPct) / 100));
      const newH = Math.max(1, Math.round((originalInfo.height * validPct) / 100));
      setTargetWidth(newW);
      setTargetHeight(newH);
    }
  };

  // Preset Resolution Selected
  const handleSelectPreset = (presetW: number, presetH: number) => {
    setErrorMessage(null);
    if (keepAspectRatio && originalInfo) {
      // Fit within preset box while preserving aspect ratio
      const scaleFactor = Math.min(presetW / originalInfo.width, presetH / originalInfo.height);
      const scaledW = Math.max(1, Math.round(originalInfo.width * scaleFactor));
      const scaledH = Math.max(1, Math.round(originalInfo.height * scaleFactor));
      setTargetWidth(scaledW);
      setTargetHeight(scaledH);
      setPercentScale(Math.round(scaleFactor * 100));
    } else {
      setTargetWidth(presetW);
      setTargetHeight(presetH);
      if (originalInfo) {
        setPercentScale(Math.round((presetW / originalInfo.width) * 100));
      }
    }
  };

  // Calculate target statistics
  const isInvalidDimension =
    !targetWidth ||
    !targetHeight ||
    targetWidth <= 0 ||
    targetHeight <= 0 ||
    isNaN(targetWidth) ||
    isNaN(targetHeight);

  const targetMegapixels =
    !isInvalidDimension
      ? Number(((targetWidth * targetHeight) / 1_000_000).toFixed(2))
      : 0;

  const isOomDanger =
    !isInvalidDimension &&
    (targetWidth > MAX_SAFE_IMAGE_DIMENSION ||
      targetHeight > MAX_SAFE_IMAGE_DIMENSION ||
      targetMegapixels > MAX_SAFE_MEGAPIXELS);

  const isHighResolutionWarning =
    !isOomDanger &&
    !isInvalidDimension &&
    (targetWidth > WARNING_IMAGE_DIMENSION ||
      targetHeight > WARNING_IMAGE_DIMENSION ||
      targetMegapixels > WARNING_MEGAPIXELS);

  // Scale ratio compared to original
  const pixelCountChange =
    originalInfo && originalInfo.width > 0 && !isInvalidDimension
      ? Math.round(((targetWidth * targetHeight) / (originalInfo.width * originalInfo.height) - 1) * 100)
      : 0;

  // Execute real bitmap resampling
  const handleApply = async () => {
    if (!layer || !layer.source) return;
    if (isInvalidDimension) {
      setErrorMessage(
        isAr
          ? 'يجب أن يكون العرض والارتفاع أرقاماً موجبة أكبر من الصفر.'
          : 'Width and height must be positive numbers greater than zero.'
      );
      return;
    }
    if (isOomDanger) {
      setErrorMessage(
        isAr
          ? 'أبعاد الصورة كبيرة جداً.'
          : 'Image dimensions are too large.'
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Perform true pixel dimension resampling
      const result = await resampleImageBitmap(layer.source, {
        targetWidth,
        targetHeight,
        algorithm,
        outputFormat: 'image/png', // Guarantees 100% alpha transparency preservation
        quality: 0.95,
      });

      const config: ImageResizeConfig = {
        targetWidth,
        targetHeight,
        keepAspectRatio,
        algorithm,
        updateDisplayBounds,
        resizeCanvasToFit,
      };

      onApplyResize(layer.id, result, config);
      onClose();
    } catch (err: any) {
      console.error('Real Image Resize Failed:', err);
      setErrorMessage(err.message || (isAr ? 'فشلت عملية تغيير الأبعاد الحقيقية للصورة' : 'Failed to resample image bitmap'));
    } finally {
      setIsProcessing(false);
    }
  };

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div
        id="image-resize-modal"
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col my-auto max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-750 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#6C4DFF]/10 text-[#6C4DFF] dark:text-[#2DD4BF]">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {isAr ? 'تغيير حجم الصورة' : 'Image Resize'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#6C4DFF]/15 text-[#6C4DFF] dark:text-[#2DD4BF]">
                  Real Bitmap
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'تغيير أبعاد البكسل الحقيقية للصورة مع الحفاظ على الشفافية وجودة التنعيم'
                  : 'Change true pixel dimensions of the underlying image bitmap'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4.5 flex-1">
          {/* Comparison Preview Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-750 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Original */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                {layer.source ? (
                  <img
                    src={layer.source}
                    alt={layer.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Layers className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">
                  {isAr ? 'الأبعاد الحالية (Current):' : 'Current Dimensions:'}
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-sm">
                  {originalInfo ? `${originalInfo.width} × ${originalInfo.height}` : '...'} {isAr ? 'بكسل' : 'Pixels'}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                  <span>{isAr ? 'العرض الحالي:' : 'Current Width:'} {originalInfo?.width || 0} px</span>
                  <span>•</span>
                  <span>{isAr ? 'الارتفاع الحالي:' : 'Current Height:'} {originalInfo?.height || 0} px</span>
                </div>
              </div>
            </div>

            {/* Directional Indicator */}
            <div className="flex items-center gap-1 text-[#6C4DFF] dark:text-[#2DD4BF] font-mono font-bold shrink-0">
              <ArrowIcon className="w-4 h-4" />
              <span className="text-[11px]">
                {pixelCountChange > 0 ? `+${pixelCountChange}%` : `${pixelCountChange}%`}
              </span>
            </div>

            {/* Target New Bitmap */}
            <div className="text-right sm:text-left rtl:sm:text-right w-full sm:w-auto">
              <span className="text-[11px] text-slate-400 block font-medium">
                {isAr ? 'الأبعاد الجديدة (New):' : 'New Dimensions:'}
              </span>
              <span className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] text-sm">
                {targetWidth} × {targetHeight} {isAr ? 'بكسل' : 'Pixels'}
              </span>
              <span className="text-[11px] text-slate-500 block font-mono">
                {targetMegapixels} MP
              </span>
            </div>
          </div>

          {/* Mode Selector & Quick Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'طريقة تحديد المقاس الجديد' : 'Resize Input Mode'}
              </label>

              {/* Mode Toggle (Pixels / Percent) */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setMode('pixels')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    mode === 'pixels'
                      ? 'bg-white dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {isAr ? 'بالبكسل (px)' : 'Pixels (px)'}
                </button>
                <button
                  type="button"
                  onClick={() => setMode('percent')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    mode === 'percent'
                      ? 'bg-white dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}
                </button>
              </div>
            </div>

            {/* Quick Percentage Presets Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] text-slate-400 font-medium shrink-0">
                {isAr ? 'نسب جاهزة:' : 'Quick %:'}
              </span>
              {PERCENTAGE_PRESETS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentChange(pct)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 border ${
                    percentScale === pct
                      ? 'border-[#6C4DFF] bg-[#6C4DFF]/15 text-[#6C4DFF] dark:text-[#2DD4BF]'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Dimension Inputs */}
          {mode === 'pixels' ? (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
              <div className="flex items-center gap-3">
                {/* Width input */}
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isAr ? 'العرض الجديد (New Width)' : 'New Width'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={targetWidth || ''}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      className="w-full px-3 py-2 pr-12 rtl:pr-3 rtl:pl-12 rounded-xl text-sm font-mono font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#6C4DFF] shadow-2xs"
                      placeholder={isAr ? 'العرض' : 'Width'}
                    />
                    <span className="absolute right-3 rtl:right-auto rtl:left-3 top-2.5 text-xs text-slate-400 font-mono pointer-events-none">
                      {isAr ? 'بكسل' : 'px'}
                    </span>
                  </div>
                </div>

                {/* Aspect Ratio Lock Toggle */}
                <div className="pt-5 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setKeepAspectRatio(!keepAspectRatio)}
                    title={
                      keepAspectRatio
                        ? isAr
                          ? 'قفل النسبة مفعّل (النسبة ثابتة)'
                          : 'Aspect Ratio Locked'
                        : isAr
                        ? 'قفل النسبة معطل'
                        : 'Aspect Ratio Unlocked'
                    }
                    className={`p-2 rounded-xl border transition-all ${
                      keepAspectRatio
                        ? 'border-[#6C4DFF] bg-[#6C4DFF]/15 text-[#6C4DFF] dark:text-[#2DD4BF] shadow-xs'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {keepAspectRatio ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Height input */}
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    {isAr ? 'الارتفاع الجديد (New Height)' : 'New Height'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={targetHeight || ''}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      className="w-full px-3 py-2 pr-12 rtl:pr-3 rtl:pl-12 rounded-xl text-sm font-mono font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#6C4DFF] shadow-2xs"
                      placeholder={isAr ? 'الارتفاع' : 'Height'}
                    />
                    <span className="absolute right-3 rtl:right-auto rtl:left-3 top-2.5 text-xs text-slate-400 font-mono pointer-events-none">
                      {isAr ? 'بكسل' : 'px'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Keep Aspect Ratio Checkbox Option & Unit */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200/70 dark:border-slate-750">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={keepAspectRatio}
                    onChange={(e) => setKeepAspectRatio(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-[#6C4DFF] focus:ring-[#6C4DFF] accent-[#6C4DFF]"
                  />
                  <span>{isAr ? 'الحفاظ على نسبة العرض إلى الارتفاع (Keep Aspect Ratio)' : 'Keep Aspect Ratio'}</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {isAr ? 'الوحدة: بكسل (Pixels)' : 'Unit: Pixels'}
                </span>
              </div>

              {/* Standard Resolution Presets Dropdown/Grid */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-750">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                  {isAr ? 'أو اختر من المقاسات القياسية الشائعة:' : 'Or choose standard resolution:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {RESOLUTION_PRESETS.slice(0, 6).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.width, preset.height)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-750 text-right rtl:text-right ltr:text-left text-[11px] transition-colors"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {isAr ? preset.nameAr : preset.nameEn}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 block">
                        {preset.width} × {preset.height} px
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'النسبة المئوية للأبعاد' : 'Scaling Percentage'}</span>
                  <span className="font-mono text-[#6C4DFF] dark:text-[#2DD4BF] text-sm font-bold">
                    {percentScale}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="400"
                  step="5"
                  value={percentScale}
                  onChange={(e) => handlePercentChange(Number(e.target.value))}
                  className="w-full accent-[#6C4DFF]"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-mono pt-2 border-t border-slate-200 dark:border-slate-750">
                <span>
                  {isAr ? 'النتيجة بالبكسل:' : 'Result in pixels:'}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {targetWidth} × {targetHeight} px ({targetMegapixels} MP)
                </span>
              </div>
            </div>
          )}

          {/* Resampling Interpolation Algorithm */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
              <span>{isAr ? 'خوارزمية إعادة التشكيل (Resampling Filter)' : 'Resampling Algorithm'}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAlgorithm('bicubic')}
                className={`p-2.5 rounded-xl border text-right rtl:text-right ltr:text-left transition-all ${
                  algorithm === 'bicubic'
                    ? 'border-[#6C4DFF] bg-[#6C4DFF]/10 text-slate-900 dark:text-white ring-1 ring-[#6C4DFF]'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">
                    {isAr ? 'تنعيم فائق (Bicubic Smooth)' : 'Bicubic (Smooth / High Quality)'}
                  </span>
                  {algorithm === 'bicubic' && <Check className="w-3.5 h-3.5 text-[#6C4DFF]" />}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isAr ? 'الأمثل للصور الفوتوغرافية والتكبير العام' : 'Best for general photos & upscaling'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAlgorithm('lanczos_step')}
                className={`p-2.5 rounded-xl border text-right rtl:text-right ltr:text-left transition-all ${
                  algorithm === 'lanczos_step'
                    ? 'border-[#6C4DFF] bg-[#6C4DFF]/10 text-slate-900 dark:text-white ring-1 ring-[#6C4DFF]'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">
                    {isAr ? 'تصغير متدرج (Step-Down Anti-Aliasing)' : 'Step-Down Anti-Aliasing'}
                  </span>
                  {algorithm === 'lanczos_step' && <Check className="w-3.5 h-3.5 text-[#6C4DFF]" />}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isAr ? 'يمنع التموج والتشوه عند التصغير الكبير' : 'Prevents moiré & aliasing when downscaling'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAlgorithm('nearest')}
                className={`p-2.5 rounded-xl border text-right rtl:text-right ltr:text-left transition-all ${
                  algorithm === 'nearest'
                    ? 'border-[#6C4DFF] bg-[#6C4DFF]/10 text-slate-900 dark:text-white ring-1 ring-[#6C4DFF]'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">
                    {isAr ? 'حواف حادة (Nearest Neighbor)' : 'Nearest Neighbor (Pixel Art)'}
                  </span>
                  {algorithm === 'nearest' && <Check className="w-3.5 h-3.5 text-[#6C4DFF]" />}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isAr ? 'مثالي للبكسل آرت والشعارات الدقيقة' : 'Crisp pixel blocks, logos & retro graphics'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAlgorithm('bilinear')}
                className={`p-2.5 rounded-xl border text-right rtl:text-right ltr:text-left transition-all ${
                  algorithm === 'bilinear'
                    ? 'border-[#6C4DFF] bg-[#6C4DFF]/10 text-slate-900 dark:text-white ring-1 ring-[#6C4DFF]'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">
                    {isAr ? 'ثنائي خطي قياسي (Bilinear)' : 'Bilinear Standard'}
                  </span>
                  {algorithm === 'bilinear' && <Check className="w-3.5 h-3.5 text-[#6C4DFF]" />}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isAr ? 'معالجة سريعة ومتوازنة' : 'Fast standard balanced interpolation'}
                </p>
              </button>
            </div>
          </div>

          {/* Canvas & Layer Placement options */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 space-y-2.5 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              {isAr ? 'سلوك العرض على لوحة العمل بعد تغيير البكسل:' : 'Canvas Layout Behavior After Resampling:'}
            </span>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="updateDisplayBounds"
                  checked={updateDisplayBounds === 'match_pixels'}
                  onChange={() => setUpdateDisplayBounds('match_pixels')}
                  className="accent-[#6C4DFF]"
                />
                <span className="text-slate-750 dark:text-slate-300">
                  {isAr
                    ? 'تعديل حجم الطبقة في اللوحة ليتطابق مع عدد البكسلات الجديد (1:1)'
                    : 'Match layer canvas display bounds to new pixel dimensions (1:1)'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="updateDisplayBounds"
                  checked={updateDisplayBounds === 'keep_canvas_size'}
                  onChange={() => setUpdateDisplayBounds('keep_canvas_size')}
                  className="accent-[#6C4DFF]"
                />
                <span className="text-slate-750 dark:text-slate-300">
                  {isAr
                    ? 'الحفاظ على حجم الطبقة الحالي على اللوحة (زيادة كثافة البكسل والحدة في نفس المساحة)'
                    : 'Keep current display size on canvas (increases pixel density & sharpness in place)'}
                </span>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-750">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resizeCanvasToFit}
                  onChange={(e) => setResizeCanvasToFit(e.target.checked)}
                  className="rounded-sm accent-[#6C4DFF]"
                />
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {isAr
                    ? `تحديث أبعاد لوحة العمل بالكامل لتصبح ${targetWidth} × ${targetHeight} px`
                    : `Also resize project canvas to ${targetWidth} × ${targetHeight} px`}
                </span>
              </label>
            </div>
          </div>

          {/* Safety Warnings & Validation */}
          {isOomDanger && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div>
                <span className="font-bold block">
                  {isAr ? 'أبعاد الصورة كبيرة جداً.' : 'Image dimensions are too large.'}
                </span>
                <span className="text-[11px] text-red-600 dark:text-red-400 block mt-0.5">
                  {isAr
                    ? `تتجاوز الأبعاد الحد الآمن (${MAX_SAFE_IMAGE_DIMENSION}px أو ${MAX_SAFE_MEGAPIXELS} ميجابكسل). يرجى تقليل المقاس لتجنب تعطل الذاكرة.`
                    : `Dimensions exceed safety limit of ${MAX_SAFE_IMAGE_DIMENSION}px or ${MAX_SAFE_MEGAPIXELS} MP. Please reduce target dimensions.`}
                </span>
              </div>
            </div>
          )}

          {isInvalidDimension && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>
                {isAr
                  ? 'يجب أن يكون العرض والارتفاع أرقاماً موجبة أكبر من الصفر.'
                  : 'Width and height must be positive numbers greater than zero.'}
              </span>
            </div>
          )}

          {isHighResolutionWarning && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <span>
                {isAr
                  ? 'ملاحظة: المقاس المطلوب عالي الدقة (>4000px). ستتم المعالجة بنجاح ولكن قد تستغرق بضع ثوانٍ إضافية.'
                  : 'Note: Target dimensions are high resolution (>4000px). Processing may take a few seconds.'}
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/60">
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            {isAr ? 'يحافظ على الشفافية بالكامل (Alpha Channel)' : 'Full Alpha Transparency Preserved'}
          </span>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-750 transition-colors"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={isProcessing || isOomDanger || isInvalidDimension}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C4DFF] to-[#4B32C3] hover:from-[#5839EE] hover:to-[#3F2AB5] shadow-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{isAr ? 'جارِ إعادة تشكيل البكسلات...' : 'Resampling Pixels...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {isAr
                      ? `تطبيق (${targetWidth}×${targetHeight})`
                      : `Apply (${targetWidth}×${targetHeight})`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
