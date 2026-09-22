import React, { useState } from 'react';
import { Layer, LayerFilters } from '../../../types';
import {
  Sun,
  Palette,
  Sparkles,
  Sliders,
  RotateCcw,
  Eye,
  Columns,
  Flame,
  Zap,
  Droplets,
  Layers,
  Image as ImageIcon,
  Check,
  CircleDot,
  Focus,
  SlidersHorizontal,
} from 'lucide-react';
import { DEFAULT_FILTERS } from '../../../data/sampleProjects';
import { BeforeAfterModal } from './BeforeAfterModal';

interface EssentialAdjustmentsStudioProps {
  selectedLayer?: Layer;
  onUpdateFilters: (updater: (prev: LayerFilters) => LayerFilters) => void;
  language: 'ar' | 'en';
}

export const EssentialAdjustmentsStudio: React.FC<EssentialAdjustmentsStudioProps> = ({
  selectedLayer,
  onUpdateFilters,
  language,
}) => {
  const isAr = language === 'ar';
  const [showBeforeAfterModal, setShowBeforeAfterModal] = useState(false);
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);
  const [originalFiltersBackup, setOriginalFiltersBackup] = useState<LayerFilters | null>(null);

  // Active layer filters or default
  const filters: LayerFilters = selectedLayer?.filters || DEFAULT_FILTERS;

  // Generic single field updater
  const updateField = (key: keyof LayerFilters, val: any) => {
    onUpdateFilters((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  // 1. Reset ALL Adjustments to default
  const handleResetAll = () => {
    onUpdateFilters(() => ({
      ...DEFAULT_FILTERS,
    }));
  };

  // 2. Reset Light & Color section only
  const handleResetLightAndColor = () => {
    onUpdateFilters((prev) => ({
      ...prev,
      brightness: 100,
      contrast: 100,
      exposure: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      saturation: 100,
      vibrance: 0,
      temperature: 0,
      tint: 0,
      hue: 0,
    }));
  };

  // 3. Reset Details section only
  const handleResetDetails = () => {
    onUpdateFilters((prev) => ({
      ...prev,
      sharpness: 0,
      blur: 0,
      clarity: 0,
    }));
  };

  // 4. Reset Effects section only
  const handleResetEffects = () => {
    onUpdateFilters((prev) => ({
      ...prev,
      vignette: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,
    }));
  };

  // Count active modifications
  const countActiveModifications = () => {
    let count = 0;
    if (filters.brightness !== 100) count++;
    if (filters.contrast !== 100) count++;
    if (filters.exposure && filters.exposure !== 0) count++;
    if (filters.highlights && filters.highlights !== 0) count++;
    if (filters.shadows && filters.shadows !== 0) count++;
    if (filters.whites && filters.whites !== 0) count++;
    if (filters.blacks && filters.blacks !== 0) count++;
    if (filters.saturation !== 100) count++;
    if (filters.vibrance && filters.vibrance !== 0) count++;
    if (filters.temperature && filters.temperature !== 0) count++;
    if (filters.tint && filters.tint !== 0) count++;
    if (filters.hue && filters.hue !== 0) count++;
    if (filters.sharpness && filters.sharpness !== 0) count++;
    if (filters.blur && filters.blur !== 0) count++;
    if (filters.clarity && filters.clarity !== 0) count++;
    const vAmt = typeof filters.vignette === 'number' ? filters.vignette : filters.vignette?.amount || 0;
    if (vAmt !== 0) count++;
    if (filters.grayscale && filters.grayscale !== 0) count++;
    if (filters.sepia && filters.sepia !== 0) count++;
    if (filters.invert && filters.invert !== 0) count++;
    return count;
  };

  const activeCount = countActiveModifications();

  // Hold to preview original logic
  const handleHoldStart = () => {
    if (isHoldingOriginal) return;
    setOriginalFiltersBackup({ ...filters });
    setIsHoldingOriginal(true);
    onUpdateFilters(() => ({
      ...DEFAULT_FILTERS,
    }));
  };

  const handleHoldEnd = () => {
    if (!isHoldingOriginal) return;
    if (originalFiltersBackup) {
      onUpdateFilters(() => ({
        ...originalFiltersBackup,
      }));
    }
    setIsHoldingOriginal(false);
    setOriginalFiltersBackup(null);
  };

  if (!selectedLayer) {
    return (
      <div className="py-12 px-4 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
        <SlidersHorizontal className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          {isAr ? 'لم يتم تحديد طبقة' : 'No Layer Selected'}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          {isAr
            ? 'يرجى تحديد صورة أو طبقة من اللوحة لتعديل الإضاءة، الألوان، والتأثيرات.'
            : 'Select an image or layer from the canvas to adjust light, color, and effects.'}
        </p>
      </div>
    );
  }

  const vignetteValue = typeof filters.vignette === 'number' ? filters.vignette : filters.vignette?.amount || 0;

  return (
    <div className="space-y-4 text-xs select-none">
      {/* 1. Header with Global Actions & Status */}
      <div className="p-3 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#6C4DFF]/30 flex items-center justify-center text-[#2DD4BF]">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">
                {isAr ? 'تحسينات الصورة' : 'Image Adjustments'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeCount > 0
                  ? isAr
                    ? `${activeCount} تحسينات نشطة`
                    : `${activeCount} active adjustments`
                  : isAr
                  ? 'القيم الأصلية'
                  : 'Default values'}
              </span>
            </div>
          </div>

          {/* Reset All Button */}
          <button
            onClick={handleResetAll}
            disabled={activeCount === 0}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 text-[11px] font-bold border border-slate-700/80 shadow-xs"
            title={isAr ? 'إعادة جميع التحسينات للوضع الافتراضي' : 'Reset all adjustments to default'}
          >
            <RotateCcw className="w-3 h-3 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>{isAr ? 'إعادة ضبط الكل' : 'Reset All'}</span>
          </button>
        </div>

        {/* Before / After Comparison Controls */}
        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800">
          <button
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all select-none border ${
              isHoldingOriginal
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
            title={isAr ? 'اضغط باستمرار لرؤية الصورة الأصلية بدون تعديلات' : 'Hold to view original image'}
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'معاينة الأصلي' : 'Hold Original'}</span>
          </button>

          <button
            onClick={() => setShowBeforeAfterModal(true)}
            className="py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-xs"
            title={isAr ? 'فتح شاشة المقارنة التفاعلية قبل وبعد' : 'Open interactive Before & After modal'}
          >
            <Columns className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>{isAr ? 'قارن قبل وبعد' : 'Before / After'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: الإضاءة والألوان (Light & Color) */}
      <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'الإضاءة والألوان' : 'Light & Color'}
            </span>
          </div>
          <button
            onClick={handleResetLightAndColor}
            className="text-[10px] font-bold text-slate-500 hover:text-[#6C4DFF] dark:hover:text-[#2DD4BF] flex items-center gap-1 transition-colors"
            title={isAr ? 'إعادة ضبط الإضاءة والألوان' : 'Reset Light & Color'}
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
          </button>
        </div>

        {/* 1. Brightness */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
              <span>{isAr ? 'السطوع (Brightness)' : 'Brightness'}</span>
            </span>
            <button
              onClick={() => updateField('brightness', 100)}
              className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
              title={isAr ? 'اضغط لإعادة الضبط لـ 100%' : 'Click to reset to 100%'}
            >
              {filters.brightness ?? 100}%
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={filters.brightness ?? 100}
            onChange={(e) => updateField('brightness', Number(e.target.value))}
            className="w-full accent-[#6C4DFF] cursor-pointer"
          />
        </div>

        {/* 2. Contrast */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {isAr ? 'التباين (Contrast)' : 'Contrast'}
            </span>
            <button
              onClick={() => updateField('contrast', 100)}
              className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
              title={isAr ? 'اضغط لإعادة الضبط لـ 100%' : 'Click to reset to 100%'}
            >
              {filters.contrast ?? 100}%
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={filters.contrast ?? 100}
            onChange={(e) => updateField('contrast', Number(e.target.value))}
            className="w-full accent-[#6C4DFF] cursor-pointer"
          />
        </div>

        {/* 3. Exposure */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {isAr ? 'التعريض العام (Exposure)' : 'Exposure'}
            </span>
            <button
              onClick={() => updateField('exposure', 0)}
              className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
            >
              {filters.exposure && filters.exposure > 0 ? `+${filters.exposure}` : filters.exposure ?? 0}
            </button>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={filters.exposure ?? 0}
            onChange={(e) => updateField('exposure', Number(e.target.value))}
            className="w-full accent-[#6C4DFF] cursor-pointer"
          />
        </div>

        {/* 4. Highlights */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {isAr ? 'المناطق الساطعة (Highlights)' : 'Highlights'}
            </span>
            <button
              onClick={() => updateField('highlights', 0)}
              className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
            >
              {filters.highlights && filters.highlights > 0 ? `+${filters.highlights}` : filters.highlights ?? 0}
            </button>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={filters.highlights ?? 0}
            onChange={(e) => updateField('highlights', Number(e.target.value))}
            className="w-full accent-[#6C4DFF] cursor-pointer"
          />
        </div>

        {/* 5. Shadows */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {isAr ? 'الظلال (Shadows)' : 'Shadows'}
            </span>
            <button
              onClick={() => updateField('shadows', 0)}
              className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
            >
              {filters.shadows && filters.shadows > 0 ? `+${filters.shadows}` : filters.shadows ?? 0}
            </button>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={filters.shadows ?? 0}
            onChange={(e) => updateField('shadows', Number(e.target.value))}
            className="w-full accent-[#6C4DFF] cursor-pointer"
          />
        </div>

        {/* 6. Whites */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {isAr ? 'درجات الأبيض (Whites)' : 'Whites'}
            </span>
            <button
              onClick={() => updateField('whites', 0)}
              className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
            >
              {filters.whites && filters.whites > 0 ? `+${filters.whites}` : filters.whites ?? 0}
            </button>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={filters.whites ?? 0}
            onChange={(e) => updateField('whites', Number(e.target.value))}
            className="w-full accent-[#6C4DFF] cursor-pointer"
          />
        </div>

        {/* 7. Blacks */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {isAr ? 'درجات الأسود (Blacks)' : 'Blacks'}
            </span>
            <button
              onClick={() => updateField('blacks', 0)}
              className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
            >
              {filters.blacks && filters.blacks > 0 ? `+${filters.blacks}` : filters.blacks ?? 0}
            </button>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={filters.blacks ?? 0}
            onChange={(e) => updateField('blacks', Number(e.target.value))}
            className="w-full accent-[#6C4DFF] cursor-pointer"
          />
        </div>

        {/* 8. Saturation */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {isAr ? 'التشبع اللوني (Saturation)' : 'Saturation'}
            </span>
            <button
              onClick={() => updateField('saturation', 100)}
              className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
            >
              {filters.saturation ?? 100}%
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={filters.saturation ?? 100}
            onChange={(e) => updateField('saturation', Number(e.target.value))}
            className="w-full accent-[#6C4DFF] cursor-pointer"
          />
        </div>

        {/* 9. Vibrance */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {isAr ? 'الحيوية (Vibrance)' : 'Vibrance'}
            </span>
            <button
              onClick={() => updateField('vibrance', 0)}
              className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
            >
              {filters.vibrance && filters.vibrance > 0 ? `+${filters.vibrance}` : filters.vibrance ?? 0}
            </button>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={filters.vibrance ?? 0}
            onChange={(e) => updateField('vibrance', Number(e.target.value))}
            className="w-full accent-[#6C4DFF] cursor-pointer"
          />
        </div>

        {/* 10. Temperature */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
              <span>{isAr ? 'درجة الحرارة (Temperature)' : 'Temperature'}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({isAr ? 'بارد ↔ دافئ' : 'Cool ↔ Warm'})
              </span>
            </span>
            <button
              onClick={() => updateField('temperature', 0)}
              className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
            >
              {filters.temperature && filters.temperature > 0
                ? `+${filters.temperature}`
                : filters.temperature ?? 0}
            </button>
          </div>
          <div className="relative">
            <input
              type="range"
              min="-100"
              max="100"
              value={filters.temperature ?? 0}
              onChange={(e) => updateField('temperature', Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-blue-500 via-slate-200 to-amber-500 dark:via-slate-700 accent-amber-500"
            />
          </div>
        </div>

        {/* 11. Tint */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
              <span>{isAr ? 'الصبغة (Tint)' : 'Tint'}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({isAr ? 'أخضر ↔ بنفسجي' : 'Green ↔ Magenta'})
              </span>
            </span>
            <button
              onClick={() => updateField('tint', 0)}
              className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
            >
              {filters.tint && filters.tint > 0 ? `+${filters.tint}` : filters.tint ?? 0}
            </button>
          </div>
          <div className="relative">
            <input
              type="range"
              min="-100"
              max="100"
              value={filters.tint ?? 0}
              onChange={(e) => updateField('tint', Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-emerald-500 via-slate-200 to-fuchsia-500 dark:via-slate-700 accent-fuchsia-500"
            />
          </div>
        </div>

        {/* 12. Hue */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {isAr ? 'تغيير درجات الألوان (Hue)' : 'Hue Rotate'}
            </span>
            <button
              onClick={() => updateField('hue', 0)}
              className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
            >
              {filters.hue && filters.hue > 0 ? `+${filters.hue}°` : `${filters.hue ?? 0}°`}
            </button>
          </div>
          <div className="relative">
            <input
              type="range"
              min="-180"
              max="180"
              value={filters.hue ?? 0}
              onChange={(e) => updateField('hue', Number(e.target.value))}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-red-500 via-green-500 via-blue-500 to-red-500 accent-[#6C4DFF]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: التفاصيل (Details) */}
      <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Focus className="w-4 h-4 text-[#2DD4BF]" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'التفاصيل والوضوح' : 'Details & Clarity'}
            </span>
          </div>
          <button
            onClick={handleResetDetails}
            className="text-[10px] font-bold text-slate-500 hover:text-[#6C4DFF] dark:hover:text-[#2DD4BF] flex items-center gap-1 transition-colors"
            title={isAr ? 'إعادة ضبط التفاصيل' : 'Reset Details'}
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
          </button>
        </div>

        {/* 1. Sharpness */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {isAr ? 'الحدة وتفاصيل الصورة (Sharpness)' : 'Sharpness'}
            </span>
            <button
              onClick={() => updateField('sharpness', 0)}
              className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
            >
              {filters.sharpness ?? 0}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.sharpness ?? 0}
            onChange={(e) => updateField('sharpness', Number(e.target.value))}
            className="w-full accent-[#2DD4BF] cursor-pointer"
          />
        </div>

        {/* 2. Blur */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {isAr ? 'التمويه والضبابية (Blur)' : 'Blur'}
            </span>
            <button
              onClick={() => updateField('blur', 0)}
              className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
            >
              {filters.blur ?? 0}px
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={filters.blur ?? 0}
            onChange={(e) => updateField('blur', Number(e.target.value))}
            className="w-full accent-[#6C4DFF] cursor-pointer"
          />
        </div>

        {/* 3. Clarity */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {isAr ? 'الوضوح والتباين المحلي (Clarity)' : 'Clarity'}
            </span>
            <button
              onClick={() => updateField('clarity', 0)}
              className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
            >
              {filters.clarity && filters.clarity > 0 ? `+${filters.clarity}` : filters.clarity ?? 0}
            </button>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={filters.clarity ?? 0}
            onChange={(e) => updateField('clarity', Number(e.target.value))}
            className="w-full accent-[#2DD4BF] cursor-pointer"
          />
        </div>
      </div>

      {/* SECTION 3: التأثيرات (Effects) */}
      <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'التأثيرات البصرية' : 'Effects'}
            </span>
          </div>
          <button
            onClick={handleResetEffects}
            className="text-[10px] font-bold text-slate-500 hover:text-[#6C4DFF] dark:hover:text-[#2DD4BF] flex items-center gap-1 transition-colors"
            title={isAr ? 'إعادة ضبط التأثيرات' : 'Reset Effects'}
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
          </button>
        </div>

        {/* 1. Vignette */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
              <span>{isAr ? 'تأطير الأطراف (Vignette)' : 'Vignette'}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({isAr ? 'أبيض ↔ أسود' : 'White ↔ Dark'})
              </span>
            </span>
            <button
              onClick={() => updateField('vignette', 0)}
              className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
            >
              {vignetteValue > 0 ? `+${vignetteValue}` : vignetteValue}
            </button>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={vignetteValue}
            onChange={(e) => updateField('vignette', Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        {/* 2. Grayscale / Black & White */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {isAr ? 'أبيض وأسود (Grayscale / B&W)' : 'Grayscale / B&W'}
            </span>
            <button
              onClick={() => updateField('grayscale', filters.grayscale ? 0 : 100)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                filters.grayscale && filters.grayscale > 0
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {filters.grayscale && filters.grayscale > 0 ? (isAr ? 'مفعل' : 'ON') : isAr ? 'تفعيل' : 'Toggle'}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.grayscale ?? 0}
            onChange={(e) => updateField('grayscale', Number(e.target.value))}
            className="w-full accent-slate-700 dark:accent-slate-300 cursor-pointer"
          />
        </div>

        {/* 3. Sepia */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {isAr ? 'تأثير سيبيا الكلاسيكي (Sepia)' : 'Sepia Effect'}
            </span>
            <button
              onClick={() => updateField('sepia', filters.sepia ? 0 : 100)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                filters.sepia && filters.sepia > 0
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {filters.sepia && filters.sepia > 0 ? (isAr ? 'مفعل' : 'ON') : isAr ? 'تفعيل' : 'Toggle'}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.sepia ?? 0}
            onChange={(e) => updateField('sepia', Number(e.target.value))}
            className="w-full accent-amber-600 cursor-pointer"
          />
        </div>

        {/* 4. Invert */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-700 dark:text-slate-300 font-semibold">
              {isAr ? 'عكس الألوان (Invert Colors)' : 'Invert Colors'}
            </span>
            <button
              onClick={() => updateField('invert', filters.invert ? 0 : 100)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                filters.invert && filters.invert > 0
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {filters.invert && filters.invert > 0 ? (isAr ? 'مفعل' : 'ON') : isAr ? 'تفعيل' : 'Toggle'}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.invert ?? 0}
            onChange={(e) => updateField('invert', Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Before / After Comparison Modal */}
      {showBeforeAfterModal && selectedLayer && (
        <BeforeAfterModal
          isOpen={showBeforeAfterModal}
          onClose={() => setShowBeforeAfterModal(false)}
          selectedLayer={selectedLayer}
          language={language}
        />
      )}
    </div>
  );
};
