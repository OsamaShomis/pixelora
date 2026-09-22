import React, { useState } from 'react';
import {
  Layer,
  LayerFilters,
  ToneCurves,
  HslMixer,
  ColorGrading,
  VignetteEffect,
  GrainEffect,
} from '../../../types';
import {
  Sun,
  Palette,
  Sparkles,
  RotateCcw,
  Eye,
  Columns,
  Flame,
  Droplets,
  Layers,
  ChevronDown,
  ChevronUp,
  Wand2,
  Sliders,
  Check,
  CircleDot,
  Focus,
  SlidersHorizontal,
  Film,
  Zap,
} from 'lucide-react';
import { DEFAULT_FILTERS } from '../../../data/sampleProjects';
import {
  LIGHTROOM_PRESETS,
  PRESET_CATEGORIES,
  FilterPreset,
  DEFAULT_TONE_CURVES,
  DEFAULT_HSL_MIXER,
  DEFAULT_COLOR_GRADING,
  DEFAULT_VIGNETTE,
  DEFAULT_GRAIN,
} from '../../../data/lightroomPresets';
import { ToneCurveEditor } from './ToneCurveEditor';
import { HslMixerEditor } from './HslMixer';
import { ColorGradingWheel } from './ColorGradingWheel';
import { BeforeAfterModal } from './BeforeAfterModal';
import { isImageProcessingFilter } from '../../../utils/filterEngines';
import { FILTER_PARAM_DEFS, getDefaultFilterParams } from '../../../data/imageProcessingFilters';

interface AdjustmentsAndFiltersStudioProps {
  selectedLayer?: Layer;
  onUpdateFilters: (updater: (prev: LayerFilters) => LayerFilters) => void;
  language: 'ar' | 'en';
  defaultOpenSection?: AccordionSection;
}

export type AccordionSection =
  | 'presets'
  | 'basic'
  | 'color'
  | 'detail'
  | 'hsl'
  | 'curves'
  | 'grading'
  | 'effects';

export const AdjustmentsAndFiltersStudio: React.FC<AdjustmentsAndFiltersStudioProps> = ({
  selectedLayer,
  onUpdateFilters,
  language,
  defaultOpenSection,
}) => {
  const isAr = language === 'ar';

  // State for collapsible accordion sections
  const [openSections, setOpenSections] = useState<Record<AccordionSection, boolean>>({
    presets: defaultOpenSection === 'presets',
    basic: defaultOpenSection ? defaultOpenSection === 'basic' : true,
    color: defaultOpenSection ? defaultOpenSection === 'color' : false,
    detail: defaultOpenSection ? defaultOpenSection === 'detail' : false,
    hsl: defaultOpenSection ? defaultOpenSection === 'hsl' : false,
    curves: defaultOpenSection ? defaultOpenSection === 'curves' : false,
    grading: defaultOpenSection ? defaultOpenSection === 'grading' : false,
    effects: defaultOpenSection ? defaultOpenSection === 'effects' : false,
  });

  // Preset category filter
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Interactive Before/After modals and hold-original states
  const [showBeforeAfterModal, setShowBeforeAfterModal] = useState(false);
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);
  const [originalFiltersBackup, setOriginalFiltersBackup] = useState<LayerFilters | null>(null);

  const toggleSection = (sec: AccordionSection) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // If no layer selected
  if (!selectedLayer) {
    return (
      <div className="py-12 px-4 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
        <SlidersHorizontal className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          {isAr ? 'لم يتم تحديد طبقة' : 'No Layer Selected'}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          {isAr
            ? 'يرجى تحديد صورة أو طبقة من اللوحة لتطبيق الفلاتر والتحسينات الاحترافية.'
            : 'Select an image layer on the canvas to adjust lighting, colors, curves, and presets.'}
        </p>
      </div>
    );
  }

  const filters: LayerFilters = selectedLayer.filters || DEFAULT_FILTERS;

  // Generic single-key updater
  const updateField = (key: keyof LayerFilters, val: any) => {
    onUpdateFilters((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  // Section Activity Checkers
  const isBasicActive =
    filters.brightness !== 100 ||
    filters.contrast !== 100 ||
    (filters.exposure && filters.exposure !== 0) ||
    (filters.saturation !== 100) ||
    (filters.hue && filters.hue !== 0) ||
    (filters.highlights && filters.highlights !== 0) ||
    (filters.shadows && filters.shadows !== 0) ||
    (filters.whites && filters.whites !== 0) ||
    (filters.blacks && filters.blacks !== 0);

  const isColorActive =
    (filters.temperature && filters.temperature !== 0) ||
    (filters.tint && filters.tint !== 0) ||
    (filters.vibrance && filters.vibrance !== 0);

  const isDetailActive =
    (filters.sharpness && filters.sharpness !== 0) ||
    (filters.blur && filters.blur !== 0) ||
    (filters.clarity && filters.clarity !== 0) ||
    (filters.texture && filters.texture !== 0);

  const isHslActive = (() => {
    if (!filters.hslMixer) return false;
    return Object.values(filters.hslMixer).some(
      (ch) => ch && (ch.hue !== 0 || ch.saturation !== 0 || ch.luminance !== 0)
    );
  })();

  const isCurvesActive = (() => {
    if (!filters.toneCurves) return false;
    const isLinear = (pts?: { x: number; y: number }[]) =>
      !pts || (pts.length === 2 && pts[0]?.x === 0 && pts[0]?.y === 0 && pts[1]?.x === 255 && pts[1]?.y === 255);
    return (
      !isLinear(filters.toneCurves.rgb) ||
      !isLinear(filters.toneCurves.red) ||
      !isLinear(filters.toneCurves.green) ||
      !isLinear(filters.toneCurves.blue)
    );
  })();

  const isGradingActive = (() => {
    if (!filters.colorGrading) return false;
    return (
      (filters.colorGrading.shadows && filters.colorGrading.shadows.saturation > 0) ||
      (filters.colorGrading.midtones && filters.colorGrading.midtones.saturation > 0) ||
      (filters.colorGrading.highlights && filters.colorGrading.highlights.saturation > 0)
    );
  })();

  const isEffectsActive = (() => {
    const vAmt = typeof filters.vignette === 'number' ? filters.vignette : filters.vignette?.amount || 0;
    const gAmt = typeof filters.grain === 'object' ? filters.grain.amount : 0;
    return (
      vAmt !== 0 ||
      gAmt > 0 ||
      (filters.grayscale && filters.grayscale !== 0) ||
      (filters.sepia && filters.sepia !== 0) ||
      (filters.invert && filters.invert !== 0)
    );
  })();

  const isPresetsActive = filters.presetFilter && filters.presetFilter !== 'none';

  // Count total active modifications
  const countActiveModifications = () => {
    let count = 0;
    if (isBasicActive) count++;
    if (isColorActive) count++;
    if (isDetailActive) count++;
    if (isHslActive) count++;
    if (isCurvesActive) count++;
    if (isGradingActive) count++;
    if (isEffectsActive) count++;
    if (isPresetsActive) count++;
    return count;
  };

  const activeCount = countActiveModifications();

  // Reset Handlers
  const handleResetAll = () => {
    onUpdateFilters(() => ({
      ...DEFAULT_FILTERS,
      toneCurves: DEFAULT_TONE_CURVES,
      hslMixer: DEFAULT_HSL_MIXER,
      colorGrading: DEFAULT_COLOR_GRADING,
      vignette: DEFAULT_VIGNETTE,
      grain: DEFAULT_GRAIN,
      presetFilter: 'none',
      presetIntensity: 100,
    }));
  };

  const handleResetBasic = () => {
    onUpdateFilters((prev) => ({
      ...prev,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      exposure: 0,
      hue: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
    }));
  };

  const handleResetColor = () => {
    onUpdateFilters((prev) => ({
      ...prev,
      temperature: 0,
      tint: 0,
      vibrance: 0,
    }));
  };

  const handleResetDetail = () => {
    onUpdateFilters((prev) => ({
      ...prev,
      sharpness: 0,
      blur: 0,
      clarity: 0,
      texture: 0,
    }));
  };

  const handleResetEffects = () => {
    onUpdateFilters((prev) => ({
      ...prev,
      vignette: 0,
      grain: DEFAULT_GRAIN,
      grayscale: 0,
      sepia: 0,
      invert: 0,
    }));
  };

  // Hold Original comparison logic
  const handleHoldStart = () => {
    if (isHoldingOriginal) return;
    setOriginalFiltersBackup({ ...filters });
    setIsHoldingOriginal(true);
    onUpdateFilters(() => ({ ...DEFAULT_FILTERS }));
  };

  const handleHoldEnd = () => {
    if (!isHoldingOriginal) return;
    if (originalFiltersBackup) {
      onUpdateFilters(() => ({ ...originalFiltersBackup }));
    }
    setIsHoldingOriginal(false);
    setOriginalFiltersBackup(null);
  };

  // Preset Selection & Blending Logic
  const handleSelectPreset = (preset: FilterPreset) => {
    onUpdateFilters((prev) => ({
      ...prev,
      ...preset.filters,
      presetFilter: preset.id,
      presetIntensity: 100,
      presetParams: isImageProcessingFilter(preset.id)
        ? { ...(prev.presetParams || {}), ...(getDefaultFilterParams(preset.id) || {}) }
        : prev.presetParams,
    }));
  };

  const handleIntensityChange = (val: number) => {
    const activePreset = LIGHTROOM_PRESETS.find((p) => p.id === filters.presetFilter);
    if (!activePreset || isImageProcessingFilter(filters.presetFilter)) {
      onUpdateFilters((prev) => ({ ...prev, presetIntensity: val }));
      return;
    }

    const k = Math.max(0, Math.min(100, val)) / 100;
    const pf = activePreset.filters;

    onUpdateFilters((prev) => {
      const next: LayerFilters = { ...prev, presetIntensity: val };

      // Interpolate numeric sliders between defaults and preset values
      if (pf.brightness !== undefined) next.brightness = Math.round(100 + (pf.brightness - 100) * k);
      if (pf.contrast !== undefined) next.contrast = Math.round(100 + (pf.contrast - 100) * k);
      if (pf.saturation !== undefined) next.saturation = Math.round(100 + (pf.saturation - 100) * k);
      if (pf.exposure !== undefined) next.exposure = Math.round((pf.exposure || 0) * k);
      if (pf.temperature !== undefined) next.temperature = Math.round((pf.temperature || 0) * k);
      if (pf.tint !== undefined) next.tint = Math.round((pf.tint || 0) * k);
      if (pf.vibrance !== undefined) next.vibrance = Math.round((pf.vibrance || 0) * k);
      if (pf.clarity !== undefined) next.clarity = Math.round((pf.clarity || 0) * k);
      if (pf.highlights !== undefined) next.highlights = Math.round((pf.highlights || 0) * k);
      if (pf.shadows !== undefined) next.shadows = Math.round((pf.shadows || 0) * k);
      if (pf.whites !== undefined) next.whites = Math.round((pf.whites || 0) * k);
      if (pf.blacks !== undefined) next.blacks = Math.round((pf.blacks || 0) * k);

      // Vignette interpolation
      if (pf.vignette) {
        const amt = typeof pf.vignette === 'number' ? pf.vignette : pf.vignette.amount;
        next.vignette = Math.round(amt * k);
      }

      // Grain interpolation
      if (pf.grain) {
        next.grain = {
          ...pf.grain,
          amount: Math.round(pf.grain.amount * k),
        };
      }

      // Color grading interpolation
      if (pf.colorGrading) {
        next.colorGrading = {
          ...pf.colorGrading,
          shadows: {
            ...pf.colorGrading.shadows,
            saturation: Math.round(pf.colorGrading.shadows.saturation * k),
          },
          midtones: {
            ...pf.colorGrading.midtones,
            saturation: Math.round(pf.colorGrading.midtones.saturation * k),
          },
          highlights: {
            ...pf.colorGrading.highlights,
            saturation: Math.round(pf.colorGrading.highlights.saturation * k),
          },
        };
      }

      return next;
    });
  };

  // Filter presets by active category
  const filteredPresets =
    activeCategory === 'all'
      ? LIGHTROOM_PRESETS
      : LIGHTROOM_PRESETS.filter((p) => p.category === activeCategory);

  const activePreset = LIGHTROOM_PRESETS.find((p) => p.id === filters.presetFilter);
  const vignetteAmt =
    typeof filters.vignette === 'number' ? filters.vignette : filters.vignette?.amount || 0;
  const grainAmt = typeof filters.grain === 'object' ? filters.grain.amount || 0 : 0;

  return (
    <div className="space-y-3 text-xs select-none pb-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & COMPARISON CONTROLS */}
      {/* ========================================================================= */}
      <div className="p-3 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#6C4DFF]/30 flex items-center justify-center text-[#2DD4BF]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block">
                {isAr ? 'الفلاتر والتحسينات' : 'Adjustments & Filters'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeCount > 0
                  ? isAr
                    ? `${activeCount} أقسام نشطة`
                    : `${activeCount} active sections`
                  : isAr
                  ? 'القيم الافتراضية'
                  : 'Original defaults'}
              </span>
            </div>
          </div>

          <button
            onClick={handleResetAll}
            disabled={activeCount === 0}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5 text-[11px] font-bold border border-slate-700/80 shadow-xs cursor-pointer"
            title={isAr ? 'إعادة تعيين جميع الفلاتر والتحسينات' : 'Reset all adjustments to original'}
          >
            <RotateCcw className="w-3 h-3 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>{isAr ? 'إعادة ضبط الكل' : 'Reset All'}</span>
          </button>
        </div>

        {/* Live Comparison Buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800">
          <button
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all select-none border cursor-pointer ${
              isHoldingOriginal
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-extrabold'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
            title={isAr ? 'اضغط مطولاً لرؤية الصورة بدون أي تعديلات' : 'Hold down to preview original untouched image'}
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAr ? 'معاينة الأصلي' : 'Hold Original'}</span>
          </button>

          <button
            onClick={() => setShowBeforeAfterModal(true)}
            className="py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-xs cursor-pointer"
            title={isAr ? 'فتح شاشة المقارنة قبل وبعد' : 'Open Before/After interactive slider'}
          >
            <Columns className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>{isAr ? 'مقارنة قبل وبعد' : 'Before / After'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PRESETS (الفلاتر والأنماط الجاهزة) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('presets')}
          className="w-full flex items-center justify-between p-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'الأنماط والفلاتر الجاهزة' : 'Presets'}
            </span>
            {isPresetsActive && (
              <span className="w-2 h-2 rounded-full bg-[#6C4DFF] dark:bg-[#2DD4BF]" />
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            {activePreset && (
              <span className="text-[10px] font-semibold text-[#6C4DFF] dark:text-[#2DD4BF] bg-[#6C4DFF]/10 px-2 py-0.5 rounded-full">
                {isAr ? activePreset.nameAr : activePreset.nameEn}
              </span>
            )}
            {openSections.presets ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {openSections.presets && (
          <div className="p-3.5 pt-0 space-y-3 border-t border-slate-100 dark:border-slate-800/80">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin pt-2">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-[#6C4DFF] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isAr ? 'الكل' : 'All'}
              </button>
              {PRESET_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-[#6C4DFF] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {isAr ? cat.nameAr : cat.nameEn}
                </button>
              ))}
            </div>

            {/* Active Preset Intensity Controller */}
            {isPresetsActive && (
              <div className="p-2.5 bg-purple-50/70 dark:bg-purple-950/20 rounded-xl border border-purple-200/80 dark:border-purple-800/40 space-y-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <span>{isAr ? 'شدة الفلتر' : 'Preset Intensity'}</span>
                    </span>
                    <span className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF]">
                      {filters.presetIntensity ?? 100}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.presetIntensity ?? 100}
                    onChange={(e) => handleIntensityChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF]"
                  />
                </div>

                {/* Optional Custom Parameters for Image Processing Filters */}
                {filters.presetFilter &&
                  isImageProcessingFilter(filters.presetFilter) &&
                  FILTER_PARAM_DEFS[filters.presetFilter] && (
                    <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/40 space-y-2">
                      {FILTER_PARAM_DEFS[filters.presetFilter].map((paramDef) => {
                        const currentVal =
                          filters.presetParams?.[paramDef.key] !== undefined
                            ? filters.presetParams[paramDef.key]
                            : paramDef.defaultValue;

                        if (paramDef.type === 'boolean') {
                          return (
                            <div key={paramDef.key} className="flex items-center justify-between text-[11px]">
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {isAr ? paramDef.labelAr : paramDef.labelEn}
                              </span>
                              <input
                                type="checkbox"
                                checked={!!currentVal}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  onUpdateFilters((prev) => ({
                                    ...prev,
                                    presetParams: {
                                      ...(prev.presetParams || {}),
                                      [paramDef.key]: checked,
                                    },
                                  }));
                                }}
                                className="rounded border-slate-300 dark:border-slate-700 text-[#6C4DFF] focus:ring-[#6C4DFF] cursor-pointer"
                              />
                            </div>
                          );
                        }

                        return (
                          <div key={paramDef.key} className="space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-700 dark:text-slate-300 font-medium">
                                {isAr ? paramDef.labelAr : paramDef.labelEn}
                              </span>
                              <span className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF]">
                                {currentVal}
                              </span>
                            </div>
                            <input
                              type="range"
                              min={paramDef.min}
                              max={paramDef.max}
                              step={paramDef.step}
                              value={currentVal}
                              onChange={(e) => {
                                const numVal = Number(e.target.value);
                                onUpdateFilters((prev) => ({
                                  ...prev,
                                  presetParams: {
                                    ...(prev.presetParams || {}),
                                    [paramDef.key]: numVal,
                                  },
                                }));
                              }}
                              className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF]"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>
            )}

            {/* Thumbnail Cards Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {/* Untouched Original Card */}
              <button
                type="button"
                onClick={() => {
                  onUpdateFilters((prev) => ({
                    ...prev,
                    presetFilter: 'none',
                    presetIntensity: 100,
                  }));
                }}
                className={`p-2 rounded-xl text-left transition-all border flex flex-col gap-1 cursor-pointer ${
                  !isPresetsActive
                    ? 'border-[#6C4DFF] dark:border-[#2DD4BF] bg-[#6C4DFF]/10 dark:bg-[#2DD4BF]/10 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300'
                }`}
              >
                <div className="h-10 w-full rounded-lg bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-[10px]">
                  {isAr ? 'الأصلية' : 'Original'}
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 truncate">
                    {isAr ? 'بدون فلتر' : 'No Filter'}
                  </span>
                  {!isPresetsActive && <Check className="w-3 h-3 text-[#6C4DFF] dark:text-[#2DD4BF]" />}
                </div>
              </button>

              {/* Presets List */}
              {filteredPresets.map((preset) => {
                const isCurrent = filters.presetFilter === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-xl text-left transition-all border flex flex-col gap-1 cursor-pointer ${
                      isCurrent
                        ? 'border-[#6C4DFF] dark:border-[#2DD4BF] bg-[#6C4DFF]/10 dark:bg-[#2DD4BF]/10 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`h-10 w-full rounded-lg bg-gradient-to-tr ${preset.previewGradient} flex items-center justify-center shadow-inner`}
                    >
                      <Sparkles className="w-4 h-4 text-white/80 drop-shadow-xs" />
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 truncate">
                        {isAr ? preset.nameAr : preset.nameEn}
                      </span>
                      {isCurrent && <Check className="w-3 h-3 text-[#6C4DFF] dark:text-[#2DD4BF]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. BASIC (الإضاءة والتباين والسطوع) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('basic')}
          className="w-full flex items-center justify-between p-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'الأساسية (Basic)' : 'Basic'}
            </span>
            {isBasicActive && (
              <span className="w-2 h-2 rounded-full bg-[#6C4DFF] dark:bg-[#2DD4BF]" />
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            {isBasicActive && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetBasic();
                }}
                className="text-[10px] font-bold text-slate-500 hover:text-[#6C4DFF] dark:hover:text-[#2DD4BF] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>{isAr ? 'ضبط' : 'Reset'}</span>
              </button>
            )}
            {openSections.basic ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {openSections.basic && (
          <div className="p-3.5 pt-0 space-y-3.5 border-t border-slate-100 dark:border-slate-800/80">
            {/* Brightness */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  {isAr ? 'السطوع (Brightness)' : 'Brightness'}
                </span>
                <button
                  type="button"
                  onClick={() => updateField('brightness', 100)}
                  className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  {filters.brightness}%
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={filters.brightness}
                onChange={(e) => updateField('brightness', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF]"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  {isAr ? 'التباين (Contrast)' : 'Contrast'}
                </span>
                <button
                  type="button"
                  onClick={() => updateField('contrast', 100)}
                  className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  {filters.contrast}%
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={filters.contrast}
                onChange={(e) => updateField('contrast', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF]"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  {isAr ? 'التشبع (Saturation)' : 'Saturation'}
                </span>
                <button
                  type="button"
                  onClick={() => updateField('saturation', 100)}
                  className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  {filters.saturation}%
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={filters.saturation}
                onChange={(e) => updateField('saturation', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF]"
              />
            </div>

            {/* Exposure */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  {isAr ? 'التعريض (Exposure)' : 'Exposure'}
                </span>
                <button
                  type="button"
                  onClick={() => updateField('exposure', 0)}
                  className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  {filters.exposure && filters.exposure > 0 ? `+${filters.exposure}` : filters.exposure || 0}
                </button>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={filters.exposure || 0}
                onChange={(e) => updateField('exposure', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF]"
              />
            </div>

            {/* Hue */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">
                  {isAr ? 'تدرج الألوان (Hue)' : 'Hue'}
                </span>
                <button
                  type="button"
                  onClick={() => updateField('hue', 0)}
                  className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  {filters.hue && filters.hue > 0 ? `+${filters.hue}°` : `${filters.hue || 0}°`}
                </button>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={filters.hue || 0}
                onChange={(e) => updateField('hue', Number(e.target.value))}
                className="w-full h-1.5 bg-gradient-to-r from-red-500 via-green-500 via-blue-500 to-red-500 rounded-lg appearance-none cursor-pointer accent-white shadow-xs"
              />
            </div>

            {/* Highlights & Shadows Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {isAr ? 'الإضاءات العالية' : 'Highlights'}
                  </span>
                  <span className="font-mono text-slate-500">{filters.highlights || 0}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.highlights || 0}
                  onChange={(e) => updateField('highlights', Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {isAr ? 'الظلال' : 'Shadows'}
                  </span>
                  <span className="font-mono text-slate-500">{filters.shadows || 0}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.shadows || 0}
                  onChange={(e) => updateField('shadows', Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. COLOR (حرارة اللون، الصبغة، الحيوية) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('color')}
          className="w-full flex items-center justify-between p-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'الألوان (Color & Temp)' : 'Color'}
            </span>
            {isColorActive && (
              <span className="w-2 h-2 rounded-full bg-[#6C4DFF] dark:bg-[#2DD4BF]" />
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            {isColorActive && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetColor();
                }}
                className="text-[10px] font-bold text-slate-500 hover:text-[#6C4DFF] dark:hover:text-[#2DD4BF] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>{isAr ? 'ضبط' : 'Reset'}</span>
              </button>
            )}
            {openSections.color ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {openSections.color && (
          <div className="p-3.5 pt-0 space-y-3.5 border-t border-slate-100 dark:border-slate-800/80">
            {/* Auto White Balance button */}
            <button
              type="button"
              onClick={() => {
                onUpdateFilters((prev) => ({
                  ...prev,
                  temperature: 6,
                  tint: 2,
                  vibrance: 12,
                }));
              }}
              className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wand2 className="w-3 h-3 text-[#6C4DFF] dark:text-[#2DD4BF]" />
              <span>{isAr ? 'توازن أبيض تلقائي ذكي' : 'Auto White Balance'}</span>
            </button>

            {/* Temperature */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                  <span>{isAr ? 'حرارة اللون (Temp)' : 'Temperature'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => updateField('temperature', 0)}
                  className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  {filters.temperature && filters.temperature > 0 ? `+${filters.temperature}` : filters.temperature || 0}
                </button>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={filters.temperature || 0}
                onChange={(e) => updateField('temperature', Number(e.target.value))}
                className="w-full h-1.5 bg-gradient-to-r from-blue-500 via-slate-200 to-amber-500 rounded-lg appearance-none cursor-pointer accent-slate-800 dark:accent-white"
              />
            </div>

            {/* Tint */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                  <span>{isAr ? 'الصبغة (Tint)' : 'Tint'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => updateField('tint', 0)}
                  className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  {filters.tint && filters.tint > 0 ? `+${filters.tint}` : filters.tint || 0}
                </button>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={filters.tint || 0}
                onChange={(e) => updateField('tint', Number(e.target.value))}
                className="w-full h-1.5 bg-gradient-to-r from-green-500 via-slate-200 to-pink-500 rounded-lg appearance-none cursor-pointer accent-slate-800 dark:accent-white"
              />
            </div>

            {/* Vibrance */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                  <span>{isAr ? 'الحيوية (Vibrance)' : 'Vibrance'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => updateField('vibrance', 0)}
                  className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  {filters.vibrance && filters.vibrance > 0 ? `+${filters.vibrance}` : filters.vibrance || 0}
                </button>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={filters.vibrance || 0}
                onChange={(e) => updateField('vibrance', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF]"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. DETAIL (الحدة، التمويه، الوضوح) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('detail')}
          className="w-full flex items-center justify-between p-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Focus className="w-4 h-4 text-cyan-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'التفاصيل والحدة (Detail)' : 'Detail'}
            </span>
            {isDetailActive && (
              <span className="w-2 h-2 rounded-full bg-[#6C4DFF] dark:bg-[#2DD4BF]" />
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            {isDetailActive && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetDetail();
                }}
                className="text-[10px] font-bold text-slate-500 hover:text-[#6C4DFF] dark:hover:text-[#2DD4BF] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>{isAr ? 'ضبط' : 'Reset'}</span>
              </button>
            )}
            {openSections.detail ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {openSections.detail && (
          <div className="p-3.5 pt-0 space-y-3.5 border-t border-slate-100 dark:border-slate-800/80">
            {/* Sharpen (Real Unsharp Mask) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                  <span>{isAr ? 'الحدة البصرية (Sharpen)' : 'Sharpen'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => updateField('sharpness', 0)}
                  className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  {filters.sharpness || 0}%
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.sharpness || 0}
                onChange={(e) => updateField('sharpness', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF]"
              />
            </div>

            {/* Blur */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                  <span>{isAr ? 'التمويه (Blur)' : 'Blur'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => updateField('blur', 0)}
                  className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  {filters.blur || 0}px
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={filters.blur || 0}
                onChange={(e) => updateField('blur', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF]"
              />
            </div>

            {/* Clarity */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                  <span>{isAr ? 'الوضوح الموضعي (Clarity)' : 'Clarity'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => updateField('clarity', 0)}
                  className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  {filters.clarity && filters.clarity > 0 ? `+${filters.clarity}` : filters.clarity || 0}
                </button>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={filters.clarity || 0}
                onChange={(e) => updateField('clarity', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF]"
              />
            </div>

            {/* Texture */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                  <span>{isAr ? 'الملمس (Texture)' : 'Texture'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => updateField('texture', 0)}
                  className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  {filters.texture && filters.texture > 0 ? `+${filters.texture}` : filters.texture || 0}
                </button>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={filters.texture || 0}
                onChange={(e) => updateField('texture', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF]"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. HSL MIXER (خلاط الألوان بـ 8 قنوات) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('hsl')}
          className="w-full flex items-center justify-between p-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'خلاط الألوان (HSL Mixer)' : 'HSL Color Mixer'}
            </span>
            {isHslActive && (
              <span className="w-2 h-2 rounded-full bg-[#6C4DFF] dark:bg-[#2DD4BF]" />
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            {openSections.hsl ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {openSections.hsl && (
          <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800/80">
            <HslMixerEditor
              mixer={filters.hslMixer || DEFAULT_HSL_MIXER}
              onChange={(newMixer) => updateField('hslMixer', newMixer)}
              language={language}
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7. CURVES (منحنى الإضاءة وتدرج النغمات) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('curves')}
          className="w-full flex items-center justify-between p-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'منحنى التدرج (Tone Curves)' : 'Curves'}
            </span>
            {isCurvesActive && (
              <span className="w-2 h-2 rounded-full bg-[#6C4DFF] dark:bg-[#2DD4BF]" />
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            {openSections.curves ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {openSections.curves && (
          <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800/80">
            <ToneCurveEditor
              curves={filters.toneCurves || DEFAULT_TONE_CURVES}
              onChange={(newCurves) => updateField('toneCurves', newCurves)}
              language={language}
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 8. COLOR GRADING (التدريج اللوني ثلاثي المسارات) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('grading')}
          className="w-full flex items-center justify-between p-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <CircleDot className="w-4 h-4 text-rose-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'التدرج اللوني (Color Grading)' : 'Color Grading'}
            </span>
            {isGradingActive && (
              <span className="w-2 h-2 rounded-full bg-[#6C4DFF] dark:bg-[#2DD4BF]" />
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            {openSections.grading ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {openSections.grading && (
          <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800/80">
            <ColorGradingWheel
              grading={filters.colorGrading || DEFAULT_COLOR_GRADING}
              onChange={(newGrading) => updateField('colorGrading', newGrading)}
              language={language}
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 9. EFFECTS (الحبيبات السينمائية، التظليل، التأثيرات الكلاسيكية) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('effects')}
          className="w-full flex items-center justify-between p-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'التأثيرات (Grain & Vignette)' : 'Effects'}
            </span>
            {isEffectsActive && (
              <span className="w-2 h-2 rounded-full bg-[#6C4DFF] dark:bg-[#2DD4BF]" />
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            {isEffectsActive && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetEffects();
                }}
                className="text-[10px] font-bold text-slate-500 hover:text-[#6C4DFF] dark:hover:text-[#2DD4BF] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>{isAr ? 'ضبط' : 'Reset'}</span>
              </button>
            )}
            {openSections.effects ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {openSections.effects && (
          <div className="p-3.5 pt-0 space-y-3.5 border-t border-slate-100 dark:border-slate-800/80">
            {/* Film Grain (Realistic Texture) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                  <span>{isAr ? 'حبيبات الفيلم (Film Grain)' : 'Film Grain'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => updateField('grain', { amount: 0, size: 25, roughness: 50 })}
                  className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  {grainAmt}%
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={grainAmt}
                onChange={(e) =>
                  updateField('grain', {
                    amount: Number(e.target.value),
                    size: typeof filters.grain === 'object' ? filters.grain.size || 25 : 25,
                    roughness: typeof filters.grain === 'object' ? filters.grain.roughness || 50 : 50,
                  })
                }
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF]"
              />
            </div>

            {/* Vignette */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                  <span>{isAr ? 'تظليل الأطراف (Vignette)' : 'Vignette'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => updateField('vignette', 0)}
                  className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline cursor-pointer"
                >
                  {vignetteAmt > 0 ? `+${vignetteAmt}` : vignetteAmt}
                </button>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={vignetteAmt}
                onChange={(e) => updateField('vignette', Number(e.target.value))}
                className="w-full h-1.5 bg-gradient-to-r from-slate-950 via-slate-200 to-white rounded-lg appearance-none cursor-pointer accent-slate-800 dark:accent-white"
              />
            </div>

            {/* Grayscale, Sepia, Invert */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Grayscale */}
              <button
                type="button"
                onClick={() => updateField('grayscale', filters.grayscale ? 0 : 100)}
                className={`py-2 px-1.5 rounded-xl border text-[10px] font-bold text-center transition-all cursor-pointer ${
                  filters.grayscale && filters.grayscale > 0
                    ? 'border-[#6C4DFF] bg-[#6C4DFF]/10 text-[#6C4DFF] dark:text-[#2DD4BF]'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {isAr ? 'أبيض وأسود' : 'Grayscale'}
              </button>

              {/* Sepia */}
              <button
                type="button"
                onClick={() => updateField('sepia', filters.sepia ? 0 : 100)}
                className={`py-2 px-1.5 rounded-xl border text-[10px] font-bold text-center transition-all cursor-pointer ${
                  filters.sepia && filters.sepia > 0
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {isAr ? 'سيبيا كلاسيك' : 'Sepia'}
              </button>

              {/* Invert */}
              <button
                type="button"
                onClick={() => updateField('invert', filters.invert ? 0 : 100)}
                className={`py-2 px-1.5 rounded-xl border text-[10px] font-bold text-center transition-all cursor-pointer ${
                  filters.invert && filters.invert > 0
                    ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {isAr ? 'عكس الألوان' : 'Invert'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Before / After Full Comparison Modal */}
      <BeforeAfterModal
        isOpen={showBeforeAfterModal}
        onClose={() => setShowBeforeAfterModal(false)}
        selectedLayer={selectedLayer}
        language={language}
      />
    </div>
  );
};
